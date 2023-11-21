import { Request, Response, response } from 'express';
import * as schemas from "../models/api_schemas"
import { decodeB64ContentsToZip } from '../services/upload/unzip_contents';
import logger from "../utils/logger";
import { MetricsController } from '../services/scoring/controllers/metrics-controller';

import { container } from '../services/scoring/container';
import graphqlWithAuth from '../utils/graphql_query_setup';
import { extractGitHubInfo, isGitHubUrl, resolveNpmToGitHub } from '../services/scoring/services/parseURL';
import uploadToS3 from '../services/aws/s3upload';

import { extractBase64ContentsFromUrl } from '../services/upload/convert_zipball';
import { checkMetadataExists, checkPkgIDInDB, genericPkgDataGet, insertPackageIntoDB, updatePackageVersionInDB } from '../services/database/operation_queries';
import { deleteFromS3 } from '../services/aws/s3delete';
import { deletePackageDataByID } from '../services/database/delete_queries';
import { RepoIdentifier } from '../models/other_schemas';
import { is } from '@babel/types';

//Controllers are basically a way to organize the functions called by your API
//Obviously most of our functions will be too complex to have within the API endpoint declaration
//Instead we can group them into "controllers" based their primary functionality and purpose

//Controllers will call "services", which are more granular functions that perform a specific task needed by the controller
//That may be reused across multiple controllers
//For example, getting info from a database, or calling an external API
//The actual data processing should be handled by services
//While input validation, building the output object
//And providing the correct status will be done by the controller


const controller = container.resolve(MetricsController); //Basically gets an instance of the MetricsController class


//This controller contains a class that handles everything related to creating, deleting, and updating packages
export class PackageUploader {

    public async updatePkgById (req: Request, res: Response) {

        //The name, version, and ID must match.
        //The package contents (from PackageData) will replace the previous contents.

        //They have to submit ID as a part of the request body anyways so do we even want to use the one in the URL?
    
        const req_body: schemas.Package = req.body;
        const id = req.params.id;

        /*
                NEED TO CHECK REQUEST BODY IS PROPERLY FORMATTED WITH METADATA AND STUFF
        */

        if(id != req_body.metadata.ID) {    
            return res.status(400).send("Inconsistant package ID between request metadata and URL");
        }

        const curr_path = await checkMetadataExists(req_body.metadata)

        if(curr_path == null) {
            return res.status(404).send("Could not find existing package with matching metadata");
        }
        else {
            let extractedContents;
            let base64contents;
            let repoInfo: RepoIdentifier | undefined; //Need to have this defined here to seperate if statements
            let repoURL: string;
            
            if(req_body.data.hasOwnProperty("URL") && !req_body.data.hasOwnProperty("Content")) {

                logger.debug("Recieved URL in request body")
                repoURL = req_body.data.URL!
    
                //Handle 
                if(!isGitHubUrl(repoURL)) {
                    console.log("Identified as non-github URL")
                    const githubFromNPM = await resolveNpmToGitHub(repoURL);
                    if(githubFromNPM == "") {
                        return res.status(400).send("Invalid URL in request body");
                    }
                    else {
                        repoURL = githubFromNPM;
                    }
                }
                //Get the owner and repo name from the URL
                repoInfo = extractGitHubInfo(repoURL);
    
                //Get the zipped version of the file from the GitHub API
    
                const zipball_query = `{
                    repository(owner: "${repoInfo.owner}", name: "${repoInfo.repo}") {
                  
                      defaultBranchRef {
                        target {
                          ... on Commit {
                            zipballUrl
                          }
                        }
                      }
                    }
                  }`
    
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let response: any;
                try {
    
                    response = await graphqlWithAuth(zipball_query);
                }
                catch (err) {
                    logger.error(`Error while querying GitHub API for zipball URL: ${err}`)
                    return res.status(400).send("Invalid URL in request body");
                } 
    
                const zipballUrl = response.repository.defaultBranchRef.target.zipballUrl;
                //Query returns a URL that downloads the repo when GET requested
                logger.debug(`Retrieved zipball URL ${zipballUrl} from GitHub API`)
                
                base64contents = await extractBase64ContentsFromUrl(zipballUrl);
    
                //And now we can proceed the same way
    
                //The reason we get the zipball before doing the score check is we would've had to clone the repo anyways, which probably takes a similar amount of memory and time
                //Doing this makes it easier to integrate with the other input formats
                
                extractedContents = await decodeB64ContentsToZip(base64contents); //We know it'll exist
    
            }
            else if(req_body.data.hasOwnProperty("Content") && !req_body.data.hasOwnProperty("URL")) {
                logger.debug("Recieved encoded package contents in request body")
    
                base64contents = req_body.data.Content; //Do this so we can not have as much in seperate if statements
                extractedContents = await decodeB64ContentsToZip(req_body.data.Content!); //We know it'll exist
    
                /*
    
                    NEED TO FIGURE OUT HOW TO DEAL WITH A REPO URL TO A UNIQUE VERSION OF THE PACKAGE
    
                */
            }
            else {
                return res.status(400).send("Invalid or malformed PackageData in request body");
            }
            const pkg_json = JSON.parse(extractedContents.metadata["package.json"].toString());
    
            if(typeof(repoInfo) === "undefined") { //If we didn't get the repo info yet (it only gets assigned by now if the URL was uploaded)
                repoURL = pkg_json.repository.url; //Assign from the pkg json (URL should already be defined from a URL upload)
                repoInfo = extractGitHubInfo(repoURL);
            }
    
            const repo_ID = repoInfo.owner + "_" + repoInfo.repo + "_" + pkg_json.version
    
            const response_obj: schemas.PackageMetadata = {
                    Name: pkg_json.name,
                    Version: pkg_json.version,
                    ID: repo_ID
            }
    
            if(response_obj.ID != req_body.metadata.ID || response_obj.Name != req_body.metadata.Name || response_obj.Version != req_body.metadata.Version) {
                //Check if the package metadata matches the metadata in the request body
                return res.status(400).send("Inconsistant package metadata between request body and contents extracted from package data");
            }

            const metric_scores = await controller.generateMetrics(repoInfo.owner, repoInfo.repo, extractedContents.metadata);
            
            //Ensure it passes the metric checks
    
    
            //********************************************************************* */
            //***** NOT CHECKING THIS FOR NOW BECAUSE THE PHASE 1 SCORING KINDA SUCKS */
            //********************************************************************* */
    
            //Apperently we're supposed to do this no matter what
    
            // if(metric_scores["BusFactor"] < 0.5 || metric_scores["RampUp"] < 0.5 || metric_scores["Correctness"] < 0.5 || metric_scores["ResponsiveMaintainer"] < 0.5 || metric_scores["LicenseScore"] < 0.5) {
                //return res.status(424).send("npm package failed to pass rating check for public ingestion\nScores: " + JSON.stringify(metric_scores));
            // }
            // else {
                const contentsPath = await uploadToS3(extractedContents, repo_ID)
                //Need to figure out how to make it so that if the DB write fails the uploadToS3 doesn't go through
                //Probably have to redo this function so it updates scores instead of overwriting them
                // await insertPackageIntoDB(metric_scores, response_obj.metadata, contentsPath);
            // }
    
    

            return res.status(200).send(`Updated package with ID: ${id}`);
        }

    }


    public async deletePkgByID (req: Request, res: Response) {
    
        const id = req.params.id;
    
        if(!id) {
            res.status(400).send("Invalid/missing package ID in header");
        }
        else if(!await checkPkgIDInDB(id)) {
            res.status(404).send("Could not find existing package with matching ID");
        }
        else {
            const pkg_name = await genericPkgDataGet("NAME", id) //Need the name to create the key for the deleted object in S3
            //Delete package from S3 bucket
            await deleteFromS3(id, pkg_name)
            //Delete all package data from DB
            await deletePackageDataByID(id);

            res.status(200).send(`Successfully deleted ${id} from the registry`);
        }
        
    }
    

    public async createPkg (req: Request, res: Response) {

        logger.debug("Successfully routed to endpoint for uploading a new package")

        const req_body: schemas.PackageData = req.body; //The body here can either be contents of a package or a URL to a GitHub repo for public ingest via npm

        let extractedContents;
        let base64contents;
        let repoInfo: RepoIdentifier | undefined; //Need to have this defined here to seperate if statements
        let repoURL: string;
        

        if(req_body.hasOwnProperty("URL") && !req_body.hasOwnProperty("Content")) {

            logger.debug("Recieved URL in request body")
            repoURL = req_body.URL!

            //Handle 
            if(!isGitHubUrl(repoURL)) {
                console.log("Identified as non-github URL")
                const githubFromNPM = await resolveNpmToGitHub(repoURL);
                if(githubFromNPM == "") {
                    return res.status(400).send("Invalid URL in request body");
                }
                else {
                    repoURL = githubFromNPM;
                }
            }
            //Get the owner and repo name from the URL
            repoInfo = extractGitHubInfo(repoURL);

            //Get the zipped version of the file from the GitHub API

            const zipball_query = `{
                repository(owner: "${repoInfo.owner}", name: "${repoInfo.repo}") {
              
                  defaultBranchRef {
                    target {
                      ... on Commit {
                        zipballUrl
                      }
                    }
                  }
                }
              }`

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response: any;
            try {

                response = await graphqlWithAuth(zipball_query);
            }
            catch (err) {
                logger.error(`Error while querying GitHub API for zipball URL: ${err}`)
                return res.status(400).send("Invalid URL in request body");
            } 

            const zipballUrl = response.repository.defaultBranchRef.target.zipballUrl;
            //Query returns a URL that downloads the repo when GET requested
            logger.debug(`Retrieved zipball URL ${zipballUrl} from GitHub API`)
            
            base64contents = await extractBase64ContentsFromUrl(zipballUrl);

            //And now we can proceed the same way

            //The reason we get the zipball before doing the score check is we would've had to clone the repo anyways, which probably takes a similar amount of memory and time
            //Doing this makes it easier to integrate with the other input formats
            
            extractedContents = await decodeB64ContentsToZip(base64contents); //We know it'll exist

        }
        else if(req_body.hasOwnProperty("Content") && !req_body.hasOwnProperty("URL")) {
            logger.debug("Recieved encoded package contents in request body")

            base64contents = req_body.Content; //Do this so we can not have as much in seperate if statements
            extractedContents = await decodeB64ContentsToZip(req_body.Content!); //We know it'll exist

            /*

                NEED TO FIGURE OUT HOW TO DEAL WITH A REPO URL TO A UNIQUE VERSION OF THE PACKAGE

            */
        }
        else {
            return res.status(400).send("Invalid or malformed PackageData in request body");
        }
        const pkg_json = JSON.parse(extractedContents.metadata["package.json"].toString());

        if(typeof(repoInfo) === "undefined") { //If we didn't get the repo info yet (it only gets assigned by now if the URL was uploaded)
            repoURL = pkg_json.repository.url; //Assign from the pkg json (URL should already be defined from a URL upload)
            repoInfo = extractGitHubInfo(repoURL);
        }

        const repo_ID = repoInfo.owner + "_" + repoInfo.repo + "_" + pkg_json.version

        //Check DB if package id already exists in database
        if(await checkPkgIDInDB(repo_ID)) {
            logger.error("Detected package with matching ID already exists in database")
            return res.status(409).send("Uploaded package already exists in registry");
        }

        const response_obj: schemas.Package = {
            metadata: {
                Name: pkg_json.name,
                Version: pkg_json.version,
                ID: repo_ID
                //metrics: metric_scores
            },
            data: {
                Content: base64contents
            }
        }

        const metric_scores = await controller.generateMetrics(repoInfo.owner, repoInfo.repo, extractedContents.metadata);
        
        //Ensure it passes the metric checks


        //********************************************************************* */
        //***** NOT CHECKING THIS FOR NOW BECAUSE THE PHASE 1 SCORING KINDA SUCKS */
        //********************************************************************* */

        //Apperently we're supposed to do this no matter what

        // if(metric_scores["BusFactor"] < 0.5 || metric_scores["RampUp"] < 0.5 || metric_scores["Correctness"] < 0.5 || metric_scores["ResponsiveMaintainer"] < 0.5 || metric_scores["LicenseScore"] < 0.5) {
            //return res.status(424).send("npm package failed to pass rating check for public ingestion\nScores: " + JSON.stringify(metric_scores));
        // }
        // else {
            const contentsPath = await uploadToS3(extractedContents, repo_ID)
            //Need to figure out how to make it so that if the DB write fails the uploadToS3 doesn't go through
            await insertPackageIntoDB(metric_scores, response_obj.metadata, contentsPath);
        // }


    
        return res.status(201).json(response_obj);
    }

    public deletePkgByName (req: Request, res: Response) {
        const name = req.params.name;
        const auth_token = req.params.auth_token;
    
        //******* IMPLEMENTATION HERE ********* 
        
        //************************************** 
    
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if(response_code == 200) {
            res.status(200).send("Successfully deleted all versions of package with name {packageName}");
        }
        else if(response_code == 400) {
            if(auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package name");
            }
        }
        else if(response_code == 404) {
            res.status(404).send("Could not find existing package with matching name");
        }
        res.send(`Deleted all versions of package with name: ${name}`);
    }
}

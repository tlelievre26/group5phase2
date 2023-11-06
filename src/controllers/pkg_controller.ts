import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import { uploadBase64Contents } from '../services/upload/unzip_contents';
import logger from "../utils/logger";
import { MetricsController } from '../services/scoring/controllers/metrics-controller';

import { container } from '../services/scoring/container';
import axios from 'axios'
import graphqlWithAuth from '../utils/graphql_query_setup';
import { extractGitHubInfo } from '../services/scoring/services/parseURL';
import uploadToS3 from '../services/upload/s3upload';

import JSZip from 'jszip';
import { extractBase64ContentsFromUrl } from '../services/upload/convert_zipball';

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

    public updatePkgById (req: Request, res: Response) {
        //The name, version, and ID must match.
        //The package contents (from PackageData) will replace the previous contents.
    
        const req_body: schemas.Package = req.body;
        const id = req.params.id;
        const auth_token = req.params.auth_token;
    
        //******* IMPLEMENTATION HERE ********* 
        
       //************************************** 
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if(response_code == 200) {
            res.status(200).send("Successfully updated {packageName} to version X");
        }
        else if(response_code == 400) {
            if(auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package ID in header");
            }
        }
        else if(response_code == 404) {
            res.status(404).send("Could not find existing package with matching name, ID, and version");
        }
    
        res.send(`Update package with ID: ${id}`);
    }


    
    public deletePkgByID (req: Request, res: Response) {
    
        const id = req.params.id;
        const auth_token = req.params.auth_token;
    
        //******* IMPLEMENTATION HERE ********* 
        
        //************************************** 

    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if(response_code == 200) {
            res.status(200).send("Successfully deleted {packageName} from the registry");
        }
        else if(response_code == 400) {
            if(auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package ID in header");
            }
        }
        else if(response_code == 404) {
            res.status(404).send("Could not find existing package with matching ID");
        }
        res.send(`Delete package with ID: ${id}`);
    }
    
    


    public async createPkg (req: Request, res: Response) {

        logger.debug("Successfully routed to endpoint for uploading a new package")

        const req_body: schemas.PackageData = req.body; //The body here can either be contents of a package or a URL to a GitHub repo for public ingest via npm
        var response_obj: schemas.Package;
        let package_name;
        let extractedContents
        
        //Would the GitHub URL be the "ingestion of npm package" in the spec?
    
        //Need to add: check that package doesn't already exist

        if(req_body.hasOwnProperty("URL") && !req_body.hasOwnProperty("Content")) {

            logger.debug("Recieved GitHub URL in request body")
            const github_URL = req_body.URL!
            //Get the owner and repo name from the URL
            const {owner, repo} = extractGitHubInfo(github_URL);

            //Get the zipped version of the file from the GitHub API

            const zipball_query = `{
                repository(owner: "${owner}", name: "${repo}") {
              
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
            const response: any = await graphqlWithAuth(zipball_query);

            const zipballUrl = response.repository.defaultBranchRef.target.zipballUrl;
            //Query returns a URL that downloads the repo when GET requested
            logger.debug(`Retrieved zipball URL ${zipballUrl} from GitHub API`)
            
            const contents = await extractBase64ContentsFromUrl(zipballUrl);

            //And now we can proceed the same way

            //The reason we get the zipball before doing the score check is we would've had to clone the repo anyways, which probably takes a similar amount of memory and time
            //Doing this makes it easier to integrate with the other input formats
            
            extractedContents = await uploadBase64Contents(contents); //We know it'll exist
            const pkg_json = JSON.parse(extractedContents.metadata["package.json"].toString());
            //**************************************************************
            //***Can we assume this repo URL exists in the package.json??***
            //Currently waiting on piazza post for clarification

            const repo_ID = owner + "_" + repo

            //Check DB if package id already exists in database

            /*
            if(package already exists) {
                res.status(404).send("Uploaded package already exists in registry");
            }
            */

            response_obj = {
                metadata: {
                    Name: pkg_json.name,
                    Version: pkg_json.version,
                    ID: repo_ID
                    //metrics: metric_scores
                },
                data: {
                    Content: contents
                }
            }

            const metric_scores = await controller.generateMetrics(owner, repo, extractedContents.metadata);
            
            //Ensure it passes the metric checks
            if(metric_scores["BusFactor"] < 0.5 || metric_scores["RampUp"] < 0.5 || metric_scores["Correctness"] < 0.5 || metric_scores["ResponsiveMaintainer"] < 0.5 || metric_scores["LicenseScore"] < 0.5) {
                return res.status(424).send("npm package failed to pass rating check for public ingestion\nScores: " + JSON.stringify(metric_scores));
            }
            else {
                uploadToS3(extractedContents)
            }

        }
        else if(req_body.hasOwnProperty("Content") && !req_body.hasOwnProperty("URL")) {
            logger.debug("Recieved encoded package contents in request body")

            
            extractedContents = await uploadBase64Contents(req_body.Content!); //We know it'll exist

            //NEED TO CHECK IT ISNT A DUPE

            const pkg_json = JSON.parse(extractedContents.metadata["package.json"].toString());
            const repo_url = pkg_json.repository.url;
            //**************************************************************
            //***Can we assume this repo URL exists in the package.json??***
            //Currently waiting on piazza post for clarification

            const {owner, repo} = extractGitHubInfo(repo_url);
            const repo_ID = owner + "_" + repo

            //Check DB if package id already exists in database

            /*
            if(package already exists) {
                res.status(404).send("Uploaded package already exists in registry");
            }
            */

            response_obj = {
                metadata: {
                    Name: pkg_json.name,
                    Version: pkg_json.version,
                    ID: repo_ID
                    //metrics: metric_scores
                },
                data: {
                    Content: req_body.Content
                }
            }

            //We decode the package.json several times which is technically inefficient but whatever


            const metric_scores = await controller.generateMetrics(owner, repo, extractedContents.metadata);

            uploadToS3(extractedContents)

            //Write scores to db
        }
        else {
            return res.status(400).send("Invalid or malformed PackageData in request body");
        }

        


    
        res.status(201).json(response_obj);
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

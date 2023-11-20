import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import * as types from "../models/api_types"
import { uploadBase64Contents } from '../services/upload/unzip_contents';
import logger from "../utils/logger";
import { MetricsController } from '../services/scoring/controllers/metrics-controller';

import { container } from '../services/scoring/container';
import graphqlWithAuth from '../utils/graphql_query_setup';
import { extractGitHubInfo } from '../services/scoring/services/parseURL';
import uploadToS3 from '../services/aws/s3upload';

import { extractBase64ContentsFromUrl } from '../services/upload/convert_zipball';
import { checkPkgIDInDB, genericPkgDataGet, insertPackageIntoDB } from '../services/database/operation_queries';
import { deleteFromS3 } from '../services/aws/s3delete';
import { deletePackageDataByID } from '../services/database/delete_queries';

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
    
        if(!(types.Package.is(req_body))) {
            logger.debug("Invalid or malformed Package in request body to endpoint PUT /package/{id}")
            return res.status(400).send("Invalid or malformed Package in request body");
        }
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


    
    public async deletePkgByID (req: Request, res: Response) {
    
        const id = req.params.id;
    
        if(!id) {
            return res.status(400).send("Invalid/missing package ID in header");
        }
        else if(!await checkPkgIDInDB(id)) {
            return res.status(404).send("Could not find existing package with matching ID");
        }
        else {
            const pkg_name = await genericPkgDataGet("NAME", id)
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
        let response_obj: schemas.Package;
        let extractedContents

        if(!(types.PackageData.is(req_body))) {
            logger.debug("Invalid or malformed Package in request body to endpoint POST /package")
            return res.status(400).send("Invalid or malformed Package in request body");
        }

        if(req_body.hasOwnProperty("URL") && !req_body.hasOwnProperty("Content")) {

            logger.debug("Recieved GitHub URL in request body")
            const github_URL = req_body.URL!
            //Get the owner and repo name from the URL
            const {owner, repo} = extractGitHubInfo(github_URL);
            const repo_ID = owner + "_" + repo

            if(await checkPkgIDInDB(repo_ID)) {
                return res.status(409).send("Uploaded package already exists in registry");
            }

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



            //Check DB if package id already exists in database



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
            //********************************************************************* */
            //***** NOT CHECKING THIS FOR NOW BECAUSE THE PHASE 1 SCORING KINDA SUCKS */
            //********************************************************************* */

            // if(metric_scores["BusFactor"] < 0.5 || metric_scores["RampUp"] < 0.5 || metric_scores["Correctness"] < 0.5 || metric_scores["ResponsiveMaintainer"] < 0.5 || metric_scores["LicenseScore"] < 0.5) {
                //return res.status(424).send("npm package failed to pass rating check for public ingestion\nScores: " + JSON.stringify(metric_scores));
            // }
            // else {
                const contentsPath = await uploadToS3(extractedContents, repo_ID)
                //Need to figure out how to make it so that if the DB write fails the uploadToS3 doesn't go through
                await insertPackageIntoDB(metric_scores, response_obj.metadata, contentsPath);
            // }

        }
        else if(req_body.hasOwnProperty("Content") && !req_body.hasOwnProperty("URL")) {
            logger.debug("Recieved encoded package contents in request body")

            
            extractedContents = await uploadBase64Contents(req_body.Content!); //We know it'll exist

            //NEED TO CHECK IT ISNT A DUPE

            const pkg_json = JSON.parse(extractedContents.metadata["package.json"].toString());
            const repo_url = pkg_json.repository.url;
            const {owner, repo} = extractGitHubInfo(repo_url);
            const repo_ID = owner + "_" + repo
            if(await checkPkgIDInDB(repo_ID)) {
                return res.status(409).send("Uploaded package already exists in registry");
            }


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

            const contentsPath = await uploadToS3(extractedContents, repo_ID)
            //Need to figure out how to make it so that if the DB write fails the uploadToS3 doesn't go through
            await insertPackageIntoDB(metric_scores, response_obj.metadata, contentsPath);

            //Write scores to db
        }
        else {
            return res.status(400).send("Invalid or malformed PackageData in request body");
        }
    
        return res.status(201).json(response_obj);
    }
}

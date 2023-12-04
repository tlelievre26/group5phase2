import e, { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import { UserPermissions } from '../models/other_schemas';
import logger from "../utils/logger";
import { genericPkgDataGet, PkgScoresGet, PostgetPackage, searchPackageWithRegex  } from "../services/database/operation_queries";
import * as types from "../models/api_types"
import { fetchallLimitChecker, verifyAuthToken } from '../services/user_auth/generate_auth_token';
import { JsonWebTokenError } from 'jsonwebtoken';
import searchReadmeFilesInS3 from '../services/aws/s3search';
import s3download from '../services/aws/s3download';

//import { inject, injectable } from "tsyringe";

//This file contains a class that acts a controller for everything relating to getting data about a package

export class PkgDataManager {

    public async getPackageQuery(req: Request, res: Response) {
        logger.debug("Got a package query request");
        //Get any packages fitting the query. Search for packages satisfying the indicated query.
    
        //If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
    
        //The response is paginated; the response header includes the offset to use in the next query.
    
        //Proposed design to protect from DDOS: only allow an auth token to call the * endpoint 3 times

        //Post requests have a "request body" that is the data being posted
        const req_body: schemas.PackageQuery[] = req.body;
        let offset; //0 if offset is not defined
        const auth_token = req.headers.authorization!;
        var response_obj: schemas.PackageMetadata[] = [];
        let user_perms: UserPermissions;

        if(req.query.offset) { //If offset is defined
            try {
                offset = parseInt(req.query.offset as string);
                if(offset < 0) {
                    logger.debug("Invalid offset in request body to endpoint POST /packages, defaulting to 0")
                    offset = 0
                }
            }
            catch {
                logger.debug("Invalid offset in request body to endpoint POST /packages, defaulting to 0")
                offset = 0
            }
        }
        else {
            offset = 0;
        }

        //Verify user permissions
        try {
            //user_perms = await verifyAuthToken(auth_token, ["search"]) //Can ensure auth exists bc we check for it in middleware
            await verifyAuthToken(auth_token, ["search"])
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            if(err instanceof JsonWebTokenError) { //If the token lacks permissions or is expired
                logger.error(`Error validating auth token ${auth_token}`)
                return res.status(401).send("Error validating auth token: " + err.message);
            }
            else {
                logger.error(`Error: Invalid/malformed auth token ${auth_token}`)
                return res.status(400).send("Error validating auth token: " + err.message);
            }
        }



        for (const pkg_query of req_body) {

            //Validate request body for each entry
            if(!(types.PackageQuery.is(pkg_query))) {
                logger.debug("Invalid or malformed Package in request body to endpoint POST /packages")
                return res.status(400).send("Invalid or malformed Package in request body");
            }
    

            // //For this endpoint specifically we want to check that people can't run fetchall queries more than once per hour
            // if(pkg_query.Name == "*") {
            //     try {
            //         await fetchallLimitChecker(user_perms)
            //     }
            //     catch {
            //         logger.error("Auth token has exceeded fetchall limit of once per hour")
            //         return res.status(401).send("Auth token has exceeded fetchall limit of once per hour")
            //     }

            // }

        }

        let results;
        try {
            results = await PostgetPackage(req_body, offset);
        }
        catch (err) {
            logger.error("Error querying the database")
            return res.status(400).send("Error querying the database: " + err)
        }
        for (const result of results[0]) { //Only doing this so it exactly matches the schema for the autograder
            response_obj.push({
                "Version": result.LATEST_VERSION,
                "Name": result.NAME,
                "ID": result.ID,
            })
        }
        const matches = results[1][0].MATCHES;
        if(matches - offset * 10 > 10) { //If there are more results to paginate
            logger.debug("Still more results to paginate")
            res.set('offset', (offset + 1).toString());
        }
        else {
            res.set('offset', "-1"); //If there are no more results to paginate
        }
        //logger.info("here bro for results", response_obj);
        return res.status(200).send(response_obj);
    }
    
    public async getPkgById(req: Request, res: Response) {

        const id = req.params.id;
        const auth_token = req.headers.authorization!;

    
        if(!id) {
            logger.error("Malformed/missing PackageID in request body to endpoint GET /package/{id}")
            return res.status(400).send("Missing PackageID in params");
        }
    
        //Verify user permissions
        try {
            await verifyAuthToken(auth_token, ["download"]) //Can ensure auth exists bc we check for it in middleware
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            if(err instanceof JsonWebTokenError) { //If the token lacks permissions or is expired
                logger.error(`Error validating auth token ${auth_token}`)
                return res.status(401).send("Error validating auth token: " + err.message);
            }
            else {
                logger.error(`Error: Invalid/malformed auth token`)
                return res.status(400).send("Error validating auth token: " + err.message);
            }
        }

            // try {
            //     const result = await searchPackage(databaseName as string, packageNameOrId as string);
            //     res.status(200).send(result);
            // } catch (error) {
            //     res.status(500).send({ error: 'Error querying the database' });
            // }
        let result;
        try {
            result = await genericPkgDataGet("ID, NAME, LATEST_VERSION, CONTENTS_PATH", id);
            console.log(result)
            if(!result) {
                return res.status(404).send({ error: 'Package not found' });
            }

        } catch (error) {
            return res.status(500).send({ error: `Error querying the database: ${error}` });
        }

        try {
            const contents = await s3download(result.CONTENTS_PATH);
            const response_obj = {
                "meta": {
                    "ID": result.ID,
                    "Name": result.NAME,
                    "Version": result.LATEST_VERSIONVERSION
                },
                "data": {
                    "Content": contents
                }

            }
            return res.status(200).send(response_obj);
        }
        catch (error) {
            return res.status(500).send({ error: `Error retrieving package contents from S3: ${error}` });
        }

    }
    
    
    public async ratePkgById(req: Request, res: Response) {
        //Gets scores for the specified package
        const id = req.params.id;
        const auth_token = req.headers.authorization!;
    
        try {
            await verifyAuthToken(auth_token, ["search"]) //Can ensure auth exists bc we check for it in middleware
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            if(err instanceof JsonWebTokenError) { //If the token lacks permissions or is expired
                logger.error(`Error validating auth token ${auth_token}`)
                return res.status(401).send("Error validating auth token: " + err.message);
            }
            else {
                logger.error(`Error: Invalid/malformed auth token`)
                return res.status(400).send("Error validating auth token: " + err.message);
            }
        }
    
        try {
            // const result = await getScores(databaseName as string, packageNameOrId as string);
            const result = await PkgScoresGet("*", id);
            console.log(result)
            if(result === undefined) {
                return res.status(404).send({ error: 'Package not found' });
            }

            const netscore = ((result.ResponsiveMaintainer * 0.28) + (result.BusFactor * 0.28) + (result.RampUp * 0.22) + (result.Correctness * 0.22)) * (result.LicenseScore);

            const reformatted_result = { //Just adjusting it to match the order + format in the spec
                "BusFactor": result.BusFactor,
                "Correctness": result.Correctness,
                "RampUp": result.RampUp,
                "ResponsiveMaintainer": result.ResponsiveMaintainer,
                "LicenseScore": result.License,
                "GoodPinningPractice": result.GoodPinningPractice,
                "PullRequest": result.PullRequest,
                "NetScore": netscore
            }
            return res.status(200).send(reformatted_result);
        } catch (error) {
            return res.status(500).send({ error: 'Error querying the database', message: error });
        }

    }
    
    
    public async getPkgByRegex(req: Request, res: Response) {
        //Search for a package using regular expression over package names and READMEs. This is similar to search by name.
    
        const auth_token = req.headers.authorization!;
        const regex: schemas.PackageRegEx = req.body;


        if(!(types.PackageRegEx.is(regex))) {
            logger.debug("Invalid or malformed Package in request body to endpoint POST /packages")
            return res.status(400).send("Invalid or malformed Package in request body");
        }

        //Verify user permissions
        try {
            await verifyAuthToken(auth_token, ["search"]) //Can ensure auth exists bc we check for it in middleware
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (err: any) {
            if(err instanceof JsonWebTokenError) { //If the token lacks permissions or is expired
                logger.error(`Error validating auth token ${auth_token}`)
                return res.status(401).send("Error validating auth token: " + err.message);
            }
            else {
                logger.error(`Error: Invalid/malformed auth token`)
                return res.status(400).send("Error validating auth token: " + err.message);
            }
        } 

        const response_obj: schemas.PackageMetadata[] = [];
        const found_IDs: string[] = []; //Using this as an easier way to keep track of what packages have already been matched
        //Can also use this to save time on the AWS side by not searching for packages that have already been found in the DB
        try {
            const dbResults = await searchPackageWithRegex(regex.RegEx);
            for (const result of dbResults) {
                response_obj.push({
                    "Name": result.NAME,
                    "Version": result.LATEST_VERSION,
                    "ID": result.ID,
                })
                found_IDs.push(result.ID);
            }
            const regexObj = new RegExp(regex.RegEx?.toString() || ''); // Convert string to RegExp object
            console.log(regexObj)
            const AWSresults = await searchReadmeFilesInS3(regexObj);
            for(const result of AWSresults) {
                if(result.ID && !found_IDs.includes(result.ID)) { //If the package hasn't already been found in the DB
                    response_obj.push(result);
                }
            }
            if(response_obj.length == 0) {
                return res.status(404).send({ error: 'No packages found matching RegEx' });
            }
            else {
                return res.status(200).send(response_obj);
            }

        } catch (error) {
            res.status(500).send({ error: 'Error querying the database' });
        }
        
    }

}
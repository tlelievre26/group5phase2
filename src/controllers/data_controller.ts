import { Request, Response } from 'express';
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
        logger.info("*************Recieved request to endpoint POST /packages*************")
        //Get any packages fitting the query. Search for packages satisfying the indicated query.
    
        //If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
    
        //The response is paginated; the response header includes the offset to use in the next query.
    
        //Proposed design to protect from DDOS: only allow an auth token to call the * endpoint 3 times

        //Post requests have a "request body" that is the data being posted
        const req_body: schemas.PackageQuery[] = req.body;
        let offset; //0 if offset is not defined

        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;
        const response_obj: schemas.PackageMetadata[] = [];

        logger.debug("Recieved request body: \n" + JSON.stringify(req_body, null, 4))

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
        logger.debug("Offset: " + req.query.offset)

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

        if(!Array.isArray(req_body)) {
            logger.error("Invalid or malformed request body to endpoint POST /packages, not at array")
            return res.status(400).send("Invalid or malformed request body, not an array");
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
        logger.debug("Query results:\n" + JSON.stringify(response_obj, null, 4))
        logger.debug("Offset returned in header: " + res.get('offset'))
        return res.status(200).send(response_obj);
    }
    
    public async getPkgById(req: Request, res: Response) {
        logger.debug("*************Recieved request to endpoint GET /package/{id}*************")

        const id = req.params.id;
        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;

    
        if(!id) {
            logger.error("Malformed/missing PackageID in request body")
            return res.status(400).send("Missing PackageID in params");
        }
        logger.debug("Requested package ID: " + id)

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
            // console.log(result)
            if(!result) {
                logger.error("Package with given ID not found in database")
                return res.status(404).send("Package with given ID not found in database");
            }

        } catch (error) {
            logger.debug("Error querying the database for package contents path: " + error)
            return res.status(500).send(`Error querying the database for package contents path: ${error}`);
        }

        try {
            const contents = await s3download(result.CONTENTS_PATH);
            const response_obj: schemas.Package = {
                "metadata": {
                    "ID": result.ID,
                    "Name": result.NAME,
                    "Version": result.LATEST_VERSION
                },
                "data": {
                    "Content": contents
                }
            }
            logger.debug("Response object sent:\n" + JSON.stringify(response_obj.metadata, null, 4))
            logger.debug("Contents: " + response_obj.data.Content?.slice(0, 5) + "..." + response_obj.data.Content?.slice(-5))
            return res.status(200).send(response_obj);
        }
        catch (error) {
            logger.error(`Error retrieving package contents from S3: ${error}`)
            return res.status(500).send(`Error retrieving package contents from S3: ${error}`);
        }

    }
    
    
    public async ratePkgById(req: Request, res: Response) {
        logger.info("*************Recieved request to endpoint GET /package/{id}/rate*************")
        //Gets scores for the specified package
        const id = req.params.id;
        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;
    
        if(!id) {
            logger.error("Malformed/missing PackageID in request body")
            return res.status(400).send("Missing PackageID in params");
        }

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
            // console.log(result)
            if(result === undefined) {
                logger.error("Package with given ID not found in database")
                return res.status(404).send("Package with given ID not found in database");
            }

            const netscore = Math.round(((result.ResponsiveMaintainer * 0.28) + (result.BusFactor * 0.28) + (result.RampUp * 0.22) + (result.Correctness * 0.22)) * (result.LicenseScore) * 1000) / 1000;

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
            logger.debug("Response object sent:\n" + JSON.stringify(reformatted_result, null, 4))
            return res.status(200).send(reformatted_result);
        } catch (error) {
            logger.error("Error querying the database for package scores: " + error)
            return res.status(500).send('Error querying the database for package scores: ' + error);
        }

    }
    
    
    public async getPkgByRegex(req: Request, res: Response) {
        logger.info("*************Recieved request to endpoint POST /package/byRegEx*************")
        //Search for a package using regular expression over package names and READMEs. This is similar to search by name.
    
        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;
        const regex: schemas.PackageRegEx = req.body;

        if(!(types.PackageRegEx.is(regex))) {
            logger.error("Invalid or malformed PackageRegEx in request body to endpoint POST /packages")
            return res.status(400).send("Invalid or malformed PackageRegEx in request body");
        }
        logger.debug("Requested RegEx in body: " + regex.RegEx)

        let regexObj
        try {
            regexObj = new RegExp(regex.RegEx?.toString() || ''); // Convert string to RegExp object to test if its a valid format
        }
        catch (err) {
            logger.error("Invalid regex string in request body to endpoint POST /packages")
            return res.status(400).send("Invalid regex string in request body");
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
            const redos_format = /\(.*(\+|\*|\|).*\)(\+|\*)/ //Nested qualifiers are disallowed
            //Source: https://learn.snyk.io/lesson/redos/
            if(redos_format.test(regex.RegEx)) {
                logger.error("Potential ReDoS attack detected, denying request")
                return res.status(400).send("Potential ReDoS attack detected, denying request"); //Shouldn't send this to an actual attack but whatever
            }
            

            const dbResults = await searchPackageWithRegex(regex.RegEx);
            for (const result of dbResults) {
                response_obj.push({
                    "Name": result.NAME,
                    "Version": result.LATEST_VERSION,
                    "ID": result.ID,
                })
                found_IDs.push(result.ID);
            }

            // console.log(regexObj)
            const AWSresults = await searchReadmeFilesInS3(regexObj);
            for(const result of AWSresults) {
                if(result.ID && !found_IDs.includes(result.ID)) { //If the package hasn't already been found in the DB
                    response_obj.push(result);
                }
            }
            
            logger.debug("Query results:\n" + JSON.stringify(response_obj, null, 4))

            if(response_obj.length == 0) {
                logger.error("No packages found matching RegEx")
                return res.status(404).send('No packages found matching RegEx');
            }
            else {
                return res.status(200).send(response_obj);
            }

        } catch (error) {
            logger.error("Error querying the database using REGEXP: " + error)
            res.status(500).send('Error querying the database using REGEXP: ' + error );
        }
        
    }

}
import { Request, Response } from 'express';
import { searchPackage, getScores, searchPackageWithRegex } from '../services/database/operation_queries';
import * as schemas from "../models/api_schemas"
import logger from "../utils/logger";
import { genericPkgDataGet, PkgScoresGet, PostgetPackage } from "../services/database/operation_queries";
import { version } from 'os';
//import { inject, injectable } from "tsyringe";

//This file contains a class that acts a controller for everything relating to getting data about a package

export class PkgDataManager {

    public async getPackageQuery(req: Request, res: Response) {
        logger.debug("Got a package query request");
        //Get any packages fitting the query. Search for packages satisfying the indicated query.
    
        //If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
    
        //The response is paginated; the response header includes the offset to use in the next query.
    
        //QUESTION
        //So how do we match packages to the query? The example in the spec just says "string" and gets matches based off version
        //It's an array input, can we assume each entry in the array is something we should try to match?
        //Also, should we match either the version or the name or should we only return packages that match both?
    
        //Post requests have a "request body" that is the data being posted
        // logger.info("***************************** new ", req.body);
        const req_body: schemas.PackageQuery = req.body;
        const offset = req.params.offset;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.PackageMetadata[];
        var response_code; //Probably wont implement it like this, just using it as a placeholder
    
    
        response_code = 200;
    
        if (response_code == 200) {
            const result = await PostgetPackage(req_body.Version, req_body.Name);
            logger.info("here bro for results", result);
            res.status(200).send(result);
        }
        else if(response_code == 400) {
            if(auth_token) { //If its invalid
            //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid or malformed request body");
            }
        }
        else if(response_code == 413) {
            res.status(413).send("Too many packages returned");
        }
    
        res.send('List of packages');
    }
    
    public async getPkgById(req: Request, res: Response) {

        const { databaseName, packageNameOrId } = req.query;
        const id = req.params.id;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.Package;
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if (response_code == 200) {
            try {
                const result = await searchPackage(databaseName as string, packageNameOrId as string);
                res.status(200).send(result);
            } catch (error) {
                res.status(500).send({ error: 'Error querying the database' });
            }
        }

        try {
            const result = await genericPkgDataGet("ID,NAME, LATEST_VERSION", id);
            if (result.length > 0) {
                res.status(200).send(result);
            } else {
                res.status(404).send({ error: 'Package not found' });
            }
        } catch (error) {
            res.status(500).send({ error: 'Error querying the database' });
        }
    }
    public async postPackages(req: Request, res: Response) {

    }
    
    
    
    public async ratePkgById(req: Request, res: Response) {
        //Gets scores for the specified package
        const packageName = req.params.id;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.PackageRating;
        const { databaseName, packageNameOrId } = req.query;
    
        if (!packageName) {
            res.status(400).send({ error: 'Missing package name in the URL' });
            return;
        }
    
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if (response_code == 200) {
            try {
                const result = await getScores(databaseName as string, packageNameOrId as string);
                res.status(200).send(result);
            } catch (error) {
                res.status(500).send({ error: 'Error querying the database' });
            }
        // res.status(200).send("Successfully rated {packageName}");
            // const result = await PkgScoresGet("BusFactor,Correctness, RampUp, ResponsiveMaintainer,LicenseScore,GoodPinningPractice,PullRequest", packageName);
            const result = await PkgScoresGet("*", packageName);

            logger.info(result);
            res.status(200).send(result);
        }
        else if(response_code == 400) {
            if(auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package ID");
            }
        }
        else if(response_code == 404) {
            res.status(404).send("Could not find existing package with matching ID");
        }
        else if(response_code == 500) {
            res.status(500).send("Fatal error during rating calculations");
        }
        res.send(`Get rating for package with ID: ${packageName}`);
    }
    
    getPkgHistoryByName(req: Request, res: Response) {
        const name = req.params.name;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.PackageHistoryEntry[];
    
    
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if(response_code == 200) {
            res.status(200).send("Successfully retrieved package history");
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
        res.send(`Get history for package with name: ${name}`);
    }
    
    
    
    public async getPkgByRegex(req: Request, res: Response) {
        //Search for a package using regular expression over package names and READMEs. This is similar to search by name.
    
        const auth_token = req.params.auth_token;
        const regex: schemas.PackageRegEx = req.body;
        var response_obj: schemas.PackageMetadata[];
    
        const { databaseName, packageNameOrId } = req.query;

        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if (response_code == 200) {
            try {
                const result = await searchPackageWithRegex(databaseName as string, packageNameOrId as string);
                res.status(200).send(result);
            } catch (error) {
                res.status(500).send({ error: 'Error querying the database' });
            }

        // res.status(200).send("Successfully retrieved package history");
        }
        else if(response_code == 400) {
            if(auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid or malformed PackageRegEx in request body");
            }
        }
        else if(response_code == 404) {
            res.status(404).send("Could not find existing package matching regex");
        }
        res.send('Get packages based on regular expression');
    }
}
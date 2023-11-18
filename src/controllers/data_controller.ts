import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import logger from "../utils/logger";
//import { inject, injectable } from "tsyringe";

//This file contains a class that acts a controller for everything relating to getting data about a package

export class PkgDataManager {

    getPackageQuery(req: Request, res: Response) {
        logger.debug("Got a package query request");
        //Get any packages fitting the query. Search for packages satisfying the indicated query.
    
        //If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".
    
        //The response is paginated; the response header includes the offset to use in the next query.
    
        //QUESTION
        //So how do we match packages to the query? The example in the spec just says "string" and gets matches based off version
        //It's an array input, can we assume each entry in the array is something we should try to match?
        //Also, should we match either the version or the name or should we only return packages that match both?
    
        //Post requests have a "request body" that is the data being posted
        const req_body: schemas.PackageQuery[] = req.body;
        const offset = req.params.offset;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.PackageMetadata[];
        var response_code; //Probably wont implement it like this, just using it as a placeholder
    
    
        response_code = 200;
    
        if(response_code == 200) {
            res.status(200).send("Successfully queried for X packages");
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
    
    getPkgById (req: Request, res: Response) {
        //Retrieves a package by its ID
        //Return this package
        const id = req.params.id;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.Package;
    
    
    
    
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if(response_code == 200) {
            res.status(200).send(`Successfully returned {packageName} with ID = ${id}`);
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
        else if(response_code == 401) {
            res.status(401).send("You do not have permission to reset the registry");
        }
    
        //res.send(`Retrieve package with ID: ${id}`);
    }
    
    
    
    ratePkgById(req: Request, res: Response) {
        //Gets scores for the specified package
        const id = req.params.id;
        const auth_token = req.params.auth_token;
        var response_obj: schemas.PackageRating;
    
    
    
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
        if(response_code == 200) {
            res.status(200).send("Successfully rated {packageName}");
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
        res.send(`Get rating for package with ID: ${id}`);
    }
    
    
    getPkgByRegex(req: Request, res: Response) {
        //Search for a package using regular expression over package names and READMEs. This is similar to search by name.
    
        const auth_token = req.params.auth_token;
        const regex: schemas.PackageRegEx = req.body;
        var response_obj: schemas.PackageMetadata[];
    
    
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
                res.status(400).send("Invalid or malformed PackageRegEx in request body");
            }
        }
        else if(response_code == 404) {
            res.status(404).send("Could not find existing package matching regex");
        }
        res.send('Get packages based on regular expression');
    }
}
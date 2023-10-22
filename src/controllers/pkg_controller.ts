import { Request, Response, response } from 'express';
import * as schemas from "../models/api_schemas"

//Controllers are basically a way to organize the functions called by your API
//Obviously most of our functions will be too complex to have within the API endpoint declaration
//Instead we can group them into "controllers" based their primary functionality and purpose

//Controllers will call "services", which are more granular functions that perform a specific task needed by the controller
//That may be reused across multiple controllers
//For example, getting info from a database, or calling an external API
//The actual data processing should be handled by services
//While input validation, building the output object
//And providing the correct status will be done by the controller


//This controller file is for all of our package-related endpoints
//May want to split it up into several files


export const getPackageQuery = (req: Request, res: Response) => {
    console.log("Got a package query request");
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

export const getPkgById = (req: Request, res: Response) => {
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

export const updatePkgById = (req: Request, res: Response) => {
    //The name, version, and ID must match.
    //The package contents (from PackageData) will replace the previous contents.

    const req_body: schemas.Package = req.body;
    const id = req.params.id;
    const auth_token = req.params.auth_token;




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

export const deletePkgById = (req: Request, res: Response) => {

    const id = req.params.id;
    const auth_token = req.params.auth_token;





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

export const createPkg =  (req: Request, res: Response) => {
    const req_body: schemas.PackageData = req.body; //The body here can either be contents of a package or a URL to a GitHub repo for public ingest via npm

    var response_obj: schemas.Package;
    console.log(req_body)
    //Would the GitHub URL be the "ingestion of npm package" in the spec?

    if(req_body.hasOwnProperty("URL") && !req_body.hasOwnProperty("Content")) {
        console.log("Provided URL to GitHub repo")
        //parseUrlToZip(req_body.URL);
        //Calculate scores for repo using URL and see if it passes

        //***CAN WE RETOOL THE PHASE 1 REPO TO JUST TAKE IN THE URL DIRECTLY */

        //If it does, get the zipped version of the file from the GitHub API endpoint /repos/{owner}/{repo}/zipball/{ref}

        //*** ORIGINAL GROUP USED GRAPHQL, DO WE HAVE TO DO THE SAME FOR FUTURE API CALLS*/

        //Convert zipped contexts to base64 text
        //Proceed as normal
    }
    else if(req_body.hasOwnProperty("Content") && !req_body.hasOwnProperty("URL")) {
        console.log("Contents uploaded directly")
        
    }
    else {
        return res.status(400).send("Invalid or malformed PackageData in request body");
    }
    
    //Steps: Take the contents and save it to an AWS bucket 
    //Extract contents and get metadata from package.json
    //Calculate scores for repo and store all relevant info in our database
    //Create response object



    var response_code = 201; //Probably wont implement it like this, just using it as a placeholder

    if(response_code == 201) {
        res.status(201).send("Successfully created new package {packageName} with ID = {id}");
    }
    else if(response_code == 409) {
        res.status(404).send("Uploaded package already exists in registry");
    }
    else if(response_code == 424) {
        //Should probably return the scores along with the message
        res.status(404).send("npm package failed to pass rating check for public ingestion");
    }
}

export const ratePkgById = (req: Request, res: Response) => {
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

export const getPkgHistoryByName =  (req: Request, res: Response) => {
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

export const deletePkgByName = (req: Request, res: Response) => {
    const name = req.params.name;
    const auth_token = req.params.auth_token;




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

export const getPkgByRegex =  (req: Request, res: Response) => {
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
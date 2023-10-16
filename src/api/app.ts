import * as schemas from "./models/api_schemas"
import express, { Application, Request, Response } from 'express';

//Built using chatGPT

const app: Application = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to get a list of packages
app.post('/packages', (req: Request, res: Response) => {

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




    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});


// Endpoint to reset the registry
app.delete('/reset', (req: Request, res: Response) => {
    //Reset the registry to a system default state.

    const auth_token = req.params.auth_token;
    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder




    if(response_code == 200) {
        res.status(200).send("Successfully reset registry to default state");
    }
    else if(response_code == 400) {
        res.status(400).send("Invalid auth token");
    }
    else if(response_code == 401) {
        res.status(401).send("You do not have permission to reset the registry");
    }
});


// Endpoint to retrieve a specific package by ID
app.get('/package/:id', (req: Request, res: Response) => {
    //Return this package
    const id = req.params.id;
    const auth_token = req.params.auth_token;
    var response_obj: schemas.Package;





    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

    if(response_code == 200) {
        res.status(200).send("Successfully returned {packageName}");
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

    res.send(`Retrieve package with ID: ${id}`);
});


// Endpoint to update a package by ID
app.put('/package/:id', (req: Request, res: Response) => {
    //The name, version, and ID must match.
    //The package contents (from PackageData) will replace the previous contents.

    const req_body: schemas.Package = req.body;
    const id = req.params.id;
    const auth_token = req.params.auth_token;




    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});


// Endpoint to delete a package by ID
app.delete('/package/:id', (req: Request, res: Response) => {

    const id = req.params.id;
    const auth_token = req.params.auth_token;





    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});


// Endpoint to create a new package
app.post('/package', (req: Request, res: Response) => {
    const req_body: schemas.PackageData = req.body; //The body here can either be contents of a package or a URL to a GitHub repo for public ingest via npm
    const auth_token = req.params.auth_token;
    var response_obj: schemas.Package;




    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

    if(response_code == 201) {
        res.status(201).send("Successfully created new package {packageName} with ID = {id}");
    }
    else if(response_code == 400) {
        if(auth_token) { //If its invalid
            //VALIDATION CHECK UNIMPLEMENTED
            res.status(400).send("Invalid auth token");
        }
        else {
            res.status(400).send("Invalid or malformed PackageData in request body");
        }
    }
    else if(response_code == 409) {
        res.status(404).send("Uploaded package already exists in registry");
    }
    else if(response_code == 424) {
        //Should probably return the scores along with the message
        res.status(404).send("npm package failed to pass rating check for public ingestion");
    }
});


// Endpoint to get the rating of a package by ID
app.get('/package/:id/rate', (req: Request, res: Response) => {
    //Gets scores for the specified package
    const id = req.params.id;
    const auth_token = req.params.auth_token;
    var response_obj: schemas.PackageRating;




    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});


// Endpoint to authenticate and obtain an access token
app.put('/authenticate', (req: Request, res: Response) => {
    //Create an access token.
    const req_body: schemas.AuthenticationRequest = req.body;




    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

    if(response_code == 200) {
        res.status(200).send("Successfully created new auth token");
    }
    else if(response_code == 400) {
        res.status(400).send("Invalid or malformed AuthenticationRequest in request body");
    }
    else if(response_code == 401) {
        res.status(401).send("Invalid username/password");
    }
    else if(response_code == 501) {
        res.status(501).send("This system does not support authentication");
    }

    res.send('Access token is obtained');
});


// Endpoint to get the history of a package by name
app.get('/package/byName/:name', (req: Request, res: Response) => {
    const name = req.params.name;
    const auth_token = req.params.auth_token;
    var response_obj: schemas.PackageHistoryEntry[];



    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});


// Endpoint to delete all versions of a package by name
app.delete('/package/byName/:name', (req: Request, res: Response) => {
    const name = req.params.name;
    const auth_token = req.params.auth_token;




    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});


// Endpoint to get packages based on a regular expression
app.post('/package/byRegEx', (req: Request, res: Response) => {
    //Search for a package using regular expression over package names and READMEs. This is similar to search by name.

    const auth_token = req.params.auth_token;
    const regex: schemas.PackageRegEx = req.body;
    var response_obj: schemas.PackageMetadata[];


    var response_code = 0; //Probably wont implement it like this, just using it as a placeholder

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
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
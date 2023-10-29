"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageUploader = void 0;
const unzip_contents_1 = require("../services/upload/unzip_contents");
const logger_1 = __importDefault(require("../utils/logger"));
//import { inject, injectable } from "tsyringe";
//Controllers are basically a way to organize the functions called by your API
//Obviously most of our functions will be too complex to have within the API endpoint declaration
//Instead we can group them into "controllers" based their primary functionality and purpose
//Controllers will call "services", which are more granular functions that perform a specific task needed by the controller
//That may be reused across multiple controllers
//For example, getting info from a database, or calling an external API
//The actual data processing should be handled by services
//While input validation, building the output object
//And providing the correct status will be done by the controller
//This controller contains a class that handles everything related to creating, deleting, and updating packages
class PackageUploader {
    updatePkgById(req, res) {
        //The name, version, and ID must match.
        //The package contents (from PackageData) will replace the previous contents.
        const req_body = req.body;
        const id = req.params.id;
        const auth_token = req.params.auth_token;
        //******* IMPLEMENTATION HERE ********* 
        //************************************** 
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
        if (response_code == 200) {
            res.status(200).send("Successfully updated {packageName} to version X");
        }
        else if (response_code == 400) {
            if (auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package ID in header");
            }
        }
        else if (response_code == 404) {
            res.status(404).send("Could not find existing package with matching name, ID, and version");
        }
        res.send(`Update package with ID: ${id}`);
    }
    deletePkgByID(req, res) {
        const id = req.params.id;
        const auth_token = req.params.auth_token;
        //******* IMPLEMENTATION HERE ********* 
        //************************************** 
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
        if (response_code == 200) {
            res.status(200).send("Successfully deleted {packageName} from the registry");
        }
        else if (response_code == 400) {
            if (auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package ID in header");
            }
        }
        else if (response_code == 404) {
            res.status(404).send("Could not find existing package with matching ID");
        }
        res.send(`Delete package with ID: ${id}`);
    }
    createPkg(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug("Successfully routed to endpoint for uploading a new package");
            const req_body = req.body; //The body here can either be contents of a package or a URL to a GitHub repo for public ingest via npm
            var response_obj;
            let package_name;
            //Would the GitHub URL be the "ingestion of npm package" in the spec?
            //Need to add: check that package doesn't already exist
            if (req_body.hasOwnProperty("URL") && !req_body.hasOwnProperty("Content")) {
                logger_1.default.debug("Recieved GitHub URL in request body");
                //parseUrlToZip(req_body.URL);
                //Calculate scores for repo using URL and see if it passes
                //***CAN WE RETOOL THE PHASE 1 REPO TO JUST TAKE IN THE URL DIRECTLY */
                //If it does, get the zipped version of the file from the GitHub API endpoint /repos/{owner}/{repo}/zipball/{ref}
                //*** ORIGINAL GROUP USED GRAPHQL, DO WE HAVE TO DO THE SAME FOR FUTURE API CALLS*/
                //Convert zipped contexts to base64 text
                //Proceed as normal
                package_name = req_body.URL;
            }
            else if (req_body.hasOwnProperty("Content") && !req_body.hasOwnProperty("URL")) {
                logger_1.default.debug("Recieved encoded package contents in request body");
                //Package contents encoded into a base64 string
                //Conundrum: We can't unzip the package once it's already in the S3, and we need to give it an appropriate name
                //Here's what we probably need to extract:
                //package.json
                //README.md
                //any license file
                //Can get relevant name from package.json + GitHub repo URL
                //Once we have those, we use the name to upload the package and c
                //Can use that URL to call scoring functions
                //Raw package contents, decoded from base64 text into binary data
                const pkg_json = yield (0, unzip_contents_1.uploadBase64Contents)(req_body.Content); //We know it'll exist
                package_name = pkg_json.name;
            }
            else {
                return res.status(400).send("Invalid or malformed PackageData in request body");
            }
            //Steps: Take the contents and save it to an AWS bucket 
            //Extract contents and get metadata from package.json
            //Calculate scores for repo and store all relevant info in our database
            //Create response object
            var response_code = 201; //Probably wont implement it like this, just using it as a placeholder
            if (response_code == 201) {
                res.status(201).send(`Successfully created new package ${package_name}`);
            }
            else if (response_code == 409) {
                res.status(404).send("Uploaded package already exists in registry");
            }
            else if (response_code == 424) {
                //Should probably return the scores along with the message
                res.status(404).send("npm package failed to pass rating check for public ingestion");
            }
        });
    }
    deletePkgByName(req, res) {
        const name = req.params.name;
        const auth_token = req.params.auth_token;
        //******* IMPLEMENTATION HERE ********* 
        //************************************** 
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
        if (response_code == 200) {
            res.status(200).send("Successfully deleted all versions of package with name {packageName}");
        }
        else if (response_code == 400) {
            if (auth_token) { //If its invalid
                //VALIDATION CHECK UNIMPLEMENTED
                res.status(400).send("Invalid auth token");
            }
            else {
                res.status(400).send("Invalid package name");
            }
        }
        else if (response_code == 404) {
            res.status(404).send("Could not find existing package with matching name");
        }
        res.send(`Deleted all versions of package with name: ${name}`);
    }
}
exports.PackageUploader = PackageUploader;
//# sourceMappingURL=pkg_controller.js.map
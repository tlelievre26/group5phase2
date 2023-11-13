import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import { wipeS3packages } from '../services/aws/s3delete';
import { wipeDBpackages } from '../services/database/delete_queries';

//This is our controller for all of our non-package related endpoints

export class UtilsController{
    public async hardReset(req: Request, res: Response) {
        //Reset the registry to a system default state.

        /***********************************************
         * 
         *   NEED TO ADD USER AUTH TO THIS FUNCTION
         * 
         */


        /***********************************************
         * 
         *   NEED TO BE ABLE TO CLEAR USERS
         * 
         */

        await wipeDBpackages();
        await wipeS3packages();


    
        res.status(200).send("Successfully reset registry to default state");
        // else if(response_code == 401) {
        //     res.status(401).send("You do not have permission to reset the registry");
        // }
    }
    
    public getAuthToken (req: Request, res: Response) {
        //Create an access token.
        const req_body: schemas.AuthenticationRequest = req.body;
    
    
    
    
        var response_code = 200; //Probably wont implement it like this, just using it as a placeholder
    
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
    }
}

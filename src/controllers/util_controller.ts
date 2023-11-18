import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import { wipeS3packages } from '../services/aws/s3delete';
import { wipeDBpackages } from '../services/database/delete_queries';
import { findUserInDB } from '../services/database/auth_queries';
import { verifyPassword } from '../services/user_auth/password_hashing';
import logger from "../utils/logger"
import { generateAuthToken } from '../services/user_auth/generate_auth_token';

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
    
    public async getAuthToken (req: Request, res: Response) {
        //Create an access token.
        const req_body: schemas.AuthenticationRequest = req.body;
        
        const user_data = await findUserInDB(req_body.User.name, req_body.User.isAdmin);
        //Query returns users hashed password and whether or not they have a token

        if(user_data == undefined) { //If query to find users doesnt match anything
            logger.error("Invalid username did not match any existing users")
            return res.status(401).send("Invalid username did not match any existing users");
        }

        if(user_data.HAS_TOKEN == 1) { //If user already has a token
            //NOT SURE IF THIS SHOULD ACTUALLY BE AN ERROR
            logger.error("This user already has a token")
            return res.send("This user already has a token")
        }

        if(await verifyPassword(req_body.Secret.password, user_data.PASSWORD) == false) { //Checks if the input password matches the hashed password in the DB
            //I think the comparison function basically does the check "automatically", so it sees if the input password would hash to the same thing as the password in the DB
            logger.error("Invalid password")
            return res.status(401).send("Invalid password");
        }

        //Define the permissions object inside the function call bc Im lazy lol
        return res.status(200).send(generateAuthToken(req_body.User.name, req_body.User.isAdmin, {
            canUpload: user_data.CAN_UPLOAD,
            canSearch: user_data.CAN_SEARCH,
            canDownload: user_data.CAN_DOWNLOAD
        }
        ));

    }

    public async registerUser(req: Request, res: Response) {
        const req_body: schemas.UserRegistrationInfo = req.body;
    }

    public async deleteUser(req: Request, res: Response) {
        const req_body: schemas.AuthenticationRequest = req.body; //I think we only need the same fields as the auth request
    }

}

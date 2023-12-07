/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"
import * as types from "../models/api_types"
import { wipeS3packages } from '../services/aws/s3delete';
import { wipeDBpackages, wipeUsers } from '../services/database/delete_queries';
import { checkForExistingToken, createNewUserProfile, findUserInDB, deleteUserFromDB } from '../services/database/auth_queries';
import { verifyPassword } from '../services/user_auth/password_hashing';
import logger from "../utils/logger"
import { generateAuthToken, verifyAuthToken } from '../services/user_auth/generate_auth_token';
import { JsonWebTokenError } from 'jsonwebtoken';

//This is our controller for all of our non-package related endpoints

export class UtilsController{
    public async hardReset(req: Request, res: Response) {
        logger.info("*************Recieved request to endpoint DELETE /reset*************")
        //Reset the registry to a system default state.
        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;

        try {
            await verifyAuthToken(auth_token, ["admin"]) //Can ensure auth exists bc we check for it in middleware
        }
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

        //Clear all data stores
        
        await wipeDBpackages();
        await wipeS3packages();
        await wipeUsers();

        //Recreate default admin user
        //We don't exclude it from the initial deletion because we want to clear its tokens and its just easier to write like this

        await createNewUserProfile("ece30861defaultadminuser", "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;", true, {
            canUpload: true,
            canSearch: true,
            canDownload: true
        })
    
        logger.info("Successfully reset registry to default state")
        return res.status(200).send("Successfully reset registry to default state");
    }

    
    public async getAuthToken(req: Request, res: Response) {
        logger.info("*************Recieved request to endpoint PUT /authenticate*************")

        const req_body: schemas.AuthenticationRequest = req.body;

        //Check request body has proper shape
        if(!(types.AuthenticationRequest.is(req_body))) {
            logger.error("Invalid or malformed AuthenticationRequest in request body to endpoint PUT /authenticate")
            return res.status(400).send("Invalid or malformed Package in request body");
        }
        
        logger.debug("Request body:\n" + JSON.stringify(req_body, null, 4))

        const user_data = await findUserInDB(req_body.User.name);
        //Query returns users hashed password and whether or not they have a token

        if(user_data == undefined) { //If query to find users doesnt match anything or only matches a user with a different admin status
            logger.error("Invalid username did not match any existing users")
            return res.status(401).send("Invalid username did not match any existing users");
        }


        if(await verifyPassword(req_body.Secret.password, user_data.PASSWORD) == false) { //Checks if the input password matches the hashed password in the DB
            //I think the comparison function basically does the check "automatically", so it sees if the input password would hash to the same thing as the password in the DB
            logger.error("Invalid password")
            return res.status(401).send("Invalid password for username");
        }

        const existing_token = await checkForExistingToken(user_data.USER_ID)
        if(existing_token != "") { //If user already has a token in our DB

            //Just repeat the existing token rather than generating a new one
            logger.debug("This user already has a token")
            logger.debug("Returned token: bearer " + existing_token)
            return res.status(200).json('"bearer ' + existing_token + '"')
        }

        const new_token = await generateAuthToken(user_data.USER_ID, req_body.User.isAdmin, {
            canUpload: user_data.CAN_UPLOAD,
            canSearch: user_data.CAN_SEARCH,
            canDownload: user_data.CAN_DOWNLOAD
        })
        logger.info("Successfully generated auth token " + new_token)
        //Define the permissions object inside the function call bc Im lazy lol
        return res.status(200).json('"bearer ' + new_token + '"');

    }

    public async registerUser(req: Request, res: Response) {
        logger.info("*************Recieved request to endpoint POST /user*************")
        const req_body: schemas.UserRegistrationInfo = req.body;
        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;
        
        //Check request body has proper shape
        if(!(types.UserRegistrationInfo.is(req_body))) {
            logger.error("Invalid or malformed UserRegistrationInfo in request body to endpoint POST /user")
            return res.status(400).send("Invalid or malformed UserRegistrationInfo in request body");
        }

        logger.debug("Request body:\n" + JSON.stringify(req_body, null, 4))

        try {
            await verifyAuthToken(auth_token, ["admin"]) //Can ensure auth exists bc we check for it in middleware
        }
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

        //First check if user already exists
        const existing_user = await findUserInDB(req_body.User.name);

        if(existing_user != undefined) { //If query matches an existing user
            logger.error("User profile with that name already exists in database")
            return res.status(409).send("User profile with that name already exists in database");
        }

        await createNewUserProfile(req_body.User.name, req_body.Secret.password, req_body.User.isAdmin, req_body.Permissions)

        logger.info("Successfully created new user profile with username " + req_body.User.name)
        return res.status(200).send("Successfully created new user profile for " + req_body.User.name);
    }


    public async deleteUser(req: Request, res: Response) {
        logger.info("*************Recieved request to endpoint DELETE /user/{username}*************")
        logger.debug("Username for deletion: " + req.params.username)

        const req_body: schemas.AuthenticationRequest = req.body; //I think we only need the same fields as the auth request
        const auth_token: string = req.headers.authorization! || req.headers['x-authorization']! as string;
        const username = req.params.username;
        let user_data;

        //Check request body has proper shape
        // if(!(types.AuthenticationRequest.is(req_body))) {
        //     logger.error("Invalid or malformed AuthenticationRequest in request body to endpoint DELETE /user")
        //     return res.status(400).send("Invalid AuthenticationRequest in request body");
        // }
        if(!username) {
            logger.error("Invalid or malformed username in request body to endpoint DELETE /user")
            return res.status(400).send("Invalid username in request body");
        }

        try {
            const user_from_token = await verifyAuthToken(auth_token, ["admin", "self"])
            user_data = await findUserInDB(username); //Defining user data here so we dont have to re-query for password later

            if(user_data == undefined) { //If query to find users doesnt match anything
                logger.error("Invalid username did not match any existing users")
                return res.status(404).send("Invalid username did not match any existing users");
            }    

            if(!(user_from_token.roles.includes("admin"))) { //If the user is not an admin, we need to check if the token matches the identity of the user they are trying to delete   

                if(user_data.USER_ID != user_from_token.sub) { //If the user ID of the token doesnt match the user ID of the user they are trying to delete
                    logger.error("You do not have permission to delete this user")
                    return res.status(401).send("You do not have permission to delete this user");
                }

                //No need to do anything else here if the previous 2 pass, just move on now that we've confirmed permission
            }
        }
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


        // if(await verifyPassword(req_body.Secret.password, user_data.PASSWORD) == false) { //Checks if the input password matches the hashed password in the DB
        //     //I think the comparison function basically does the check "automatically", so it sees if the input password would hash to the same thing as the password in the DB
        //     logger.error("Invalid password")
        //     return res.status(401).send("Invalid password");
        // }

        //Now that we've confirmed everything, delete the user
        await deleteUserFromDB(user_data.USER_ID)

        logger.info ("Successfully deleted user " + req_body.User.name)
        return res.status(200).send("Successfully deleted user with user name " + req_body.User.name);
    }

}

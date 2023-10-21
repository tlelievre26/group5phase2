import { Request, Response } from 'express';
import * as schemas from "../models/api_schemas"

//This is our controller for all of our non-package related endpoints

export const hardReset = (req: Request, res: Response) => {
    //Reset the registry to a system default state.

    const auth_token = req.params.auth_token;
    var response_code = 200; //Probably wont implement it like this, just using it as a placeholder



    if(response_code == 200) {
        res.status(200).send("Successfully reset registry to default state");
    }
    else if(response_code == 400) {
        res.status(400).send("Invalid auth token");
    }
    else if(response_code == 401) {
        res.status(401).send("You do not have permission to reset the registry");
    }
}

export const getAuthToken = (req: Request, res: Response) => {
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
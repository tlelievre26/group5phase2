//Middleware are functions that are automatically run before the request actually is handled by the API endpoint
//Its useful for things like authentication, input validation, etc.

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

function checkForAuthToken(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers.authorization || req["headers"]["x-authorization"];

    if (!authToken) {
        logger.error("Authorization token is missing in request headers")
        return res.status(400).json("Authorization token is missing in request headers");
    }

    // Here you would verify the validity of the token, for example by decoding it and checking its expiration date
    // If the token is invalid, you would return a 400 Unauthorized response
    
    logger.debug("Recieved auth token: " + authToken)
    next();
}

export default checkForAuthToken;

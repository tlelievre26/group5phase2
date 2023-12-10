import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import logger from '../../utils/logger';
import { UserPermissions } from '../../models/other_schemas';
import { writeTokenToDB, checkTokenUseCount, updateTokenUseCount, getLastFetchallQueryTime, updateLastFetchallTime } from '../database/auth_queries';

const secret_key: string = process.env.SECRET_KEY!;

export async function generateAuthToken(user_id: number, isAdmin: boolean, perms: UserPermissions): Promise<string> {
    //Isnt it kinda funny that you could lack permissions to upload a package but still be able to delete one bc the spec only clarifies for 1 of them
    const user_perms = []
    if(isAdmin){
        user_perms.push("admin") //Allows use of all endpoints
    }
    else {
        if(perms.canUpload){
            user_perms.push("upload")
        }
        if(perms.canSearch){
            user_perms.push("search")
        }
        if(perms.canDownload) {
            user_perms.push("download")
        }
    }

    const exp_time = Math.floor(Date.now() / 1000) + (60 * 60 * 10)
    const payload = {
        sub: user_id,
        roles: user_perms,
        iat: Math.floor(Date.now() / 1000), // Issued at time in seconds
        exp: exp_time // Expires the token in 10 hours
    };
    const new_token = jwt.sign(payload, secret_key);

    logger.debug("Successfully generated auth token for user id " + user_id)
    await writeTokenToDB(user_id, new_token, exp_time);
    return new_token
}


export async function verifyAuthToken(auth_token: string, permissions: string[]) {

    auth_token = auth_token.split(" ")[1] //Remove the "Bearer " part of the auth token
    if (auth_token != undefined && auth_token.includes('\\""')) {
        auth_token = auth_token.replace('\\""', "")
    }
    logger.debug("Extracted auth token " + auth_token)
    let decoded;
    
    try {
        decoded = jwt.verify(auth_token, secret_key) as { sub: string, roles: string[], iat: number, exp: number }; //Need to do the "as" thing or typescript yells at me
    }
    catch (err) {
        logger.error("Invalid auth token")
        throw new Error("Invalid auth token")
    }

    //Makes the most sense to check in the order of:
    //1. Do they have permissions for this endpoint
    //2. Is the token expired
    //3. The special "self check" for the delete user endpoint
    //We need the self check last so that if the user's token is expired they still get denied

    //If the user has an admin role they automatically pass this, and ignore it if we're doing the self-check endpoint
    if(!(decoded.roles.includes("admin") || decoded.roles.some(r=> permissions.includes(r))) && !permissions.includes("self")) { //Invert condition where user must either have admin or have one of their permissions matching the required permissions
        logger.error("User does not have the required permissions to access this endpoint")
        throw new JsonWebTokenError("User does not have the required permissions to access this endpoint")
    }


    if (Date.now() / 1000 > decoded.exp) { //If the current time is past the expiry time of the token
        logger.error("Token has exceeded 10 hour time limit, please recall the authentication endpoint")
        throw new JsonWebTokenError("Token has exceeded 10 hour time limit, please recall the authentication endpoint")
    }

    //Feels inefficient to make 2 sql calls per API token check but whatever
    try {
        const use_count = await checkTokenUseCount(decoded.sub)
        if(use_count > 1000) {
            logger.error("Token has reached its usage limit of 1000 requests")
            throw new JsonWebTokenError("Token has reached its usage limit of 1000 requests")
        }
        else {
            await updateTokenUseCount(decoded.sub, use_count + 1)
        }
    }
    catch {
        logger.error("Failed to find valid token associated with user in database")
        throw new JsonWebTokenError("Failed to find token associated with user in database")
    }

    return decoded
}

export async function fetchallLimitChecker(user_perms: jwt.JwtPayload) {
    //Want to check if the user is an admin or if the user has called this endpoint within the last hour
    if(!user_perms.roles.includes("admin")) {
        const last_fetchall_time = await getLastFetchallQueryTime(user_perms.sub!)
        if(last_fetchall_time === undefined || (Date.now() / 1000) - last_fetchall_time > 3600) { //If the user has never called this endpoint before or if the last time they called it was more than an hour ago
            await updateLastFetchallTime(user_perms.sub!)
        }
        else {
            throw Error("This endpoint can only be called once per hour")
        }
    }
}
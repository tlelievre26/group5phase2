import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import logger from '../../utils/logger';
import { UserPermissions } from '../../models/other_schemas';
import { writeTokenToDB, checkTokenUseCount, updateTokenUseCount } from '../database/auth_queries';

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

    let decoded;
    
    try {
        decoded = jwt.verify(auth_token, secret_key) as { sub: string, roles: string[], iat: number, exp: number }; //Need to do the "as" thing or typescript yells at me
    }
    catch (err) {
        logger.error("Invalid auth token")
        throw new Error("Invalid auth token")
    }

    if(permissions.includes("self")) { //Special condition for if an endpoint allows a user to only act on their own profile, which is just the delete user endpoint
        //We handle it elsewhere so ignore it for now
        console.log("Ignoring self check")
        return decoded
    }
    
    if (Date.now() / 1000 > decoded.exp) { //If the current time is past the expiry time of the token
        logger.error("Token has exceeded 10 hour time limit, please recall the authentication endpoint")
        throw new JsonWebTokenError("Token has exceeded 10 hour time limit, please recall the authentication endpoint")
    }

    //If the user has an admin role they automatically pass this
    if(!(decoded.roles.includes("admin") || decoded.roles.some(r=> permissions.includes(r)))) { //Invert condition where user must either have admin or have one of their permissions matching the required permissions
        logger.error("User does not have the required permissions to access this endpoint")
        throw new JsonWebTokenError("User does not have the required permissions to access this endpoint")
    }
    
    //Feels inefficient to make 2 sql calls per API token check but whatever
    const use_count = await checkTokenUseCount(decoded.sub)
    if(use_count > 1000) {
        logger.error("Token has reached its usage limit of 1000 requests")
        throw new JsonWebTokenError("Token has reached its usage limit of 1000 requests")
    }
    else {
        await updateTokenUseCount(decoded.sub, use_count + 1)
    }

    return decoded
}
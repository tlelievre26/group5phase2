import jwt from 'jsonwebtoken';
import logger from '../../utils/logger';
import { UserPermissions } from '../../models/other_schemas';

const secret_key: string = process.env.SECRET_KEY!;

export function generateAuthToken(user_id: string, isAdmin: boolean, perms: UserPermissions): string {
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

    const payload = {
        sub: user_id,
        roles: user_perms,
        iat: Math.floor(Date.now() / 1000), // Issued at time in seconds
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 10) // Expires the token in 10 hours
    };

    
    return jwt.sign(payload, secret_key);
}

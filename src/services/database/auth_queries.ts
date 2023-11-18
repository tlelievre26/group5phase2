import logger from "../../utils/logger";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";

export async function findUserInDB(username: string, isAdmin: boolean) {
    const query: DbQuery = {
        sql: `SELECT PASSWORD, HAS_TOKEN, CAN_UPLOAD, CAN_SEARCH, CAN_DOWNLOAD FROM users WHERE username = ? and isAdmin = ?`,
        values: [username]
    }
    try {
        const response = await queryDatabase("users", query)
        return response[0][0]
    }
    catch (err) {
        logger.error("Error querying database for user information: ", err)
        throw err
    }

}
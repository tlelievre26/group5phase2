import logger from "../../utils/logger";
import queryDatabase from "./db_query";
import { DbQuery, UserPermissions } from "../../models/other_schemas";
import { hashPassword } from "../user_auth/password_hashing";

export async function findUserInDB(username: string, isAdmin: boolean) {
    const query: DbQuery = {
        sql: `SELECT USER_ID, PASSWORD, CAN_UPLOAD, CAN_SEARCH, CAN_DOWNLOAD FROM user_profiles WHERE USERNAME = ? and IS_ADMIN = ?`,
        values: [username, isAdmin]
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

export async function createNewUserProfile(username: string, password: string, isAdmin: boolean, permissions: UserPermissions) {

    const hashedPassword = await hashPassword(password) //Encrypt the inputted password
    
    const query: DbQuery = {
        sql: `INSERT INTO user_profiles (USERNAME, PASSWORD, IS_ADMIN, CAN_UPLOAD, CAN_SEARCH, CAN_DOWNLOAD) VALUES (?, ?, ?, ?, ?, ?)`,
        values: [username, hashedPassword, isAdmin, permissions.canUpload, permissions.canSearch, permissions.canDownload]
    }
    try {
        await queryDatabase("users", query)
        logger.debug(`Created new user profile for ${username} in DB`);
    }
    catch (err) {
        logger.error('Error creating new user profile in database:', err);
        throw err
    }
}

export async function checkForExistingToken(user_id: number): Promise<string> {
    //Check if the user has any unexpired tokens in the database
    const check_token_exists_query: DbQuery = {
        sql: `SELECT TOKEN FROM user_token_uses WHERE USER_ID = ? AND EXP_TIME > ? AND TOKEN_USES <= 1000;`, 
        values: [user_id, Date.now() / 1000]
    }
    try {
        const id_exists = await queryDatabase("users", check_token_exists_query)

        if(id_exists[0][0] != undefined) { //Need to do [0][0] because query returns a list of Promises bc of its atomic nature
            return id_exists[0][0].TOKEN
        }
        else {
            return ""
        }
    }
    catch (err) {
        logger.error('Error checking if token already exists in database:', err);
        throw err
    }

}

export async function writeTokenToDB(user_id: number, auth_token: string, exp_time: number) {

    //Whenever we create a new token, clear all old tokens in our database that are past their expiration time because idk where else would be a good place to do it
    const clear_old_tokens_query: DbQuery = {
        sql: `DELETE FROM user_token_uses WHERE EXP_TIME < ?`,
        values: [Date.now() / 1000]
    }
    const new_token_query: DbQuery = {
        sql: `INSERT INTO user_token_uses (USER_ID, TOKEN, TOKEN_USES, EXP_TIME) VALUES (?, ?, 0, ?)`,
        values: [user_id, auth_token, exp_time]
    }
    try {
        await queryDatabase("users", [clear_old_tokens_query, new_token_query])
        logger.debug(`Wrote new token to DB for user id ${user_id}`);
    }
    catch (err) {
        logger.error('Error writing new token to DB:', err);
        throw err
    
    }

}

export async function checkTokenUseCount(user_id: string) {
    const token_uses_query: DbQuery = {
        sql: `SELECT TOKEN_USES FROM user_token_uses WHERE user_id = ?`,
        values: [parseInt(user_id)] //Need to do this bc the user_id automatically decodes as a string not an int
    }
    try {
        const response = await queryDatabase("users", token_uses_query)
        logger.debug(`Queried DB for token uses for user id ${user_id}`);
        if(response[0][0] == undefined) {
            throw new Error("Token not found in database")
        }
        return response[0][0].TOKEN_USES
    }
    catch (err) {
        logger.error("Error querying database for token use count: ", err)
        throw err
    }
}

export async function updateTokenUseCount(user_id: string, use_count: number) {
    const update_token_uses_query: DbQuery = {
        sql: `UPDATE user_token_uses SET TOKEN_USES = ? WHERE USER_ID = ?`,
        values: [use_count, parseInt(user_id)]
    }
    try {
        await queryDatabase("users", update_token_uses_query)
        logger.debug(`Updated token use count for user id ${user_id}`);
    }
    catch (err) {
        logger.error('Error updating token use count in DB:', err);
        throw err
    }
}

export async function deleteUserFromDB(user_id: number) {
    const delete_user_profile: DbQuery = {
        sql: `DELETE FROM user_profiles WHERE USER_ID = ?`,
        values: [user_id]
    }
    try {
        await queryDatabase("users", delete_user_profile)
        logger.debug(`Deleted user profile for user id ${user_id}`);
    }
    catch(err) {
        logger.error("Error deleting user profile from DB:", err)
        throw err
    }
}

export async function getLastFetchallQueryTime(user_id: string) {
    const last_searchall_timestamp_query: DbQuery = {
        sql: `SELECT LAST_SEARCHALL FROM user_token_uses WHERE user_id = ?`,
        values: [parseInt(user_id)] //Need to do this bc the user_id automatically decodes from the webtoken as a string not an int
    }
    try {
        const response = await queryDatabase("users", last_searchall_timestamp_query)
        logger.debug(`Queried DB for last searchall time for user id ${user_id}`);
        return response[0][0].LAST_SEARCHALL
    }
    catch (err) {
        logger.error("Error querying database for last searchall time: ", err)
        throw err
    }
}

export async function updateLastFetchallTime(user_id: string) {
    const update_last_searchall_query: DbQuery = {
        sql: `UPDATE user_token_uses SET LAST_SEARCHALL = ? WHERE USER_ID = ?`,
        values: [Date.now() / 1000, parseInt(user_id)]
    }
    try {
        await queryDatabase("users", update_last_searchall_query)
        logger.debug(`Updated last searchall time for user id ${user_id}`);
    }
    catch (err) {
        logger.error('Error updating last searchall time in DB:', err);
        throw err
    }
}
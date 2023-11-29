import logger from "../../utils/logger";
import { PackageMetadata, PackageRating } from "../../models/api_schemas";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";
import e from "express";

/**
 * Inserts package data and scores into the RDS DB atomically
 * @param metric_scores - The package rating metrics.
 * @param pkg_metadata - The package metadata.
 * @param contentsPath - The path to the package contents.
 */
export async function insertPackageIntoDB(metric_scores: PackageRating, pkg_metadata: PackageMetadata, contentsPath: string) {
    const insert_pkgdata_query: DbQuery = { 
        sql: `INSERT INTO pkg_data (ID, NAME, LATEST_VERSION, CONTENTS_PATH, IS_SECRET) VALUES (?, ?, ?, ?, ?)`, 
        values: [pkg_metadata.ID, pkg_metadata.Name, pkg_metadata.Version, contentsPath, false]
    };
    const insert_scores_query: DbQuery = {
        sql: `INSERT INTO scores (ID, BusFactor, Correctness, RampUp, ResponsiveMaintainer, LicenseScore, GoodPinningPractice, PullRequest) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        values: [pkg_metadata.ID, metric_scores.BusFactor, metric_scores.Correctness, metric_scores.RampUp, metric_scores.ResponsiveMaintainer, metric_scores.LicenseScore, metric_scores.GoodPinningPractice, metric_scores.PullRequest]
    };
    try {
        await queryDatabase("packages", [insert_pkgdata_query, insert_scores_query])
        logger.debug("Inserted package data and scores into RDS DB");
    }
    catch (err) {
        console.error('Error inserting package info into database:', err);
        throw err
    }

}

/**
 * Runs a query to check if the package ID already exists in the DB.
 * @param pkg_ID - The package ID to check.
 */
export async function checkPkgIDInDB(pkg_ID: string): Promise<boolean> {
    const check_id_exists_query: DbQuery = {
        sql: `SELECT COUNT(*) AS count FROM pkg_data WHERE ID = ?;`, 
        values: [pkg_ID]
    }
    const id_exists = await queryDatabase("packages", check_id_exists_query)
    console.log(id_exists)
    if(id_exists[0][0].count > 0) { //Need to do [0][0] because query returns a list of Promises bc of its atomic nature
        return true
    }
    else {
        return false
    }
}
export async function PostgetPackage(serverRange: string, package_Name: string) {
    let ranges: string[] = [];
    let sql: string;
    let values: string[];
    sql = 'SELECT * from pkg_data';
    if (serverRange == undefined) {
        if (package_Name != '*') {
            sql += `WHERE NAME = ?`;
            values = [package_Name];
        } else {
            values = [];
        }
    } else {

        if (serverRange.includes("-")) {
            ranges = serverRange.split("-");
            sql += ` WHERE LATEST_VERSION >= ? AND LATEST_VERSION <= ?`;
            values = ranges.length > 0 ? [ranges[0], ranges[1]] : [serverRange];
        } else if (serverRange.includes("~")) {
            sql += `WHERE LATEST_VERSION REGEXP '?\\.[0-9]+$'`;
            values = [serverRange];
        } else if (serverRange.includes("^")) {
            sql += `WHERE LATEST_VERSION REGEXP '^((?)|[1-9]\\.[0-9]\\.[0-9])$'`;
            values = [serverRange];
        } else {
            sql = `WHERE LATEST_VERSION = ?`;
            values = [serverRange];
        }
        if (package_Name != '*') {
            sql += ` AND NAME = ?`;
            values.push(package_Name);
        } else {
            sql += `;`;
        }
    }

    const get_pkgdata_query: DbQuery = { sql, values };
    try {
        const response = await queryDatabase("packages", get_pkgdata_query);
        console.log("here in POSTGET", response);
        return response[0];
    } catch (err) {
        console.error('Error querying database:', err);
        throw err;
    }
}


// export function searchPackage(databaseName: string, packageNameOrId: string): Promise<any> {
//     const query = `SELECT * FROM pkg_data WHERE name = ? OR id = ?`;
//     const values = [packageNameOrId, packageNameOrId];
//     const dbQuery = { sql: query, values };
//     return queryDatabase(databaseName, dbQuery);
// }

// export function getScores(databaseName: string, packageNameOrId: string): Promise<any> {
//     const query = `SELECT * FROM scores WHERE name = ? OR id = ?`;
//     const values = [packageNameOrId, packageNameOrId];
//     const dbQuery = { sql: query, values };
//     return queryDatabase(databaseName, dbQuery);
// }

// export function searchPackageWithRegex(databaseName: string, regex: string): Promise<any> {
//     const query = `SELECT * FROM pkg_data WHERE name REGEXP ? OR id REGEXP ?`;
//     const values = [regex, regex];
//     const dbQuery = { sql: query, values };
//     return queryDatabase(databaseName, dbQuery);
// }




export async function genericPkgDataGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM pkg_data WHERE ID = ?;`,
        values: [pkg_ID]
    }
    try {
        const response = await queryDatabase("packages", get_pkgdata_query)
        console.log(response);
        return response[0][0][db_field]
    } catch (err) {
        console.error('Error querying database: last', err);
        throw err
    }
}
export async function PkgScoresGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM scores WHERE ID = ?;`,
        values: [pkg_ID]
    }
    console.log(get_pkgdata_query);
    const response = await queryDatabase("packages", get_pkgdata_query)
    console.log(response);
    return response
}
export async function RegexPkgDataGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM pkg_data WHERE ID REGEXP ?;`,
        values: [pkg_ID]
    }
    const response = await queryDatabase("packages", get_pkgdata_query)
    console.log(response);
    return response[0][0][db_field]
}

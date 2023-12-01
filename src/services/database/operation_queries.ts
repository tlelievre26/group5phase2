import logger from "../../utils/logger";
import { PackageMetadata, PackageRating, PackageQuery } from "../../models/api_schemas";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";


/**
 * Inserts package data and scores into the RDS DB atomically
 * @param metric_scores - The package rating metrics.
 * @param pkg_metadata - The package metadata.
 * @param contentsPath - The path to the package contents.
 */
export async function insertPackageIntoDB(metric_scores: PackageRating, pkg_metadata: PackageMetadata, contentsPath: string, debloating: boolean) {
    const insert_pkgdata_query: DbQuery = { 
        sql: `INSERT INTO pkg_data (ID, NAME, LATEST_VERSION, CONTENTS_PATH, DEBLOATED) VALUES (?, ?, ?, ?, ?)`, 
        values: [pkg_metadata.ID, pkg_metadata.Name, pkg_metadata.Version, contentsPath, debloating]
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

export async function updatePackageInDB(new_scores: PackageRating, pkg_id: string) {
    const update_scores_query: DbQuery = {
        sql: `UPDATE scores SET BusFactor = ?, Correctness = ?, RampUp = ?, ResponsiveMaintainer = ?, LicenseScore = ?, GoodPinningPractice = ?, PullRequest = ? WHERE ID = ?`, 
        values: [new_scores.BusFactor, new_scores.Correctness, new_scores.RampUp, new_scores.ResponsiveMaintainer, new_scores.LicenseScore, new_scores.GoodPinningPractice, new_scores.PullRequest, pkg_id]
    };
    try {
        await queryDatabase("packages", [update_scores_query])
        logger.debug("Updated package data and scores in RDS DB");
    }
    catch (err) {
        console.error('Error updating package info in database:', err);
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

    if(id_exists[0][0].count > 0) { //Need to do [0][0] because query returns a list of Promises bc of its atomic nature
        return true
    }
    else {
        return false
    }
}

export async function PostgetPackage(queries: PackageQuery[], offset: number) {
    let ranges: string[] = [];
    let sql: string;
    let values: string[] = [];
    sql = 'SELECT ID, NAME, LATEST_VERSION from pkg_data';
    for (let i = 0; i < queries.length; i++) {
        const package_Name = queries[i].Name;
        const semverRange = queries[i].Version;
        if(i != 0) { //Keep ORing the additional SQL queries
            sql += ' OR';
        }
        else if(!(queries.length == 1 && queries[0].Version == undefined && queries[0].Name == "*")) { //If there is only one query and it is not a serverRange query and it gets all names, don't add the WHERE
            sql += ' WHERE';
        }
        if (semverRange == undefined) {
            if (package_Name != '*') {
                sql += ` (NAME = ?)`;
                values.push(queries[0].Name);
            }
        } else {
    
            if (semverRange.includes("-")) {
                ranges = semverRange.split("-");
                sql += ` (LATEST_VERSION >= ? AND LATEST_VERSION <= ?`;
                values = ranges.length > 0 ? [ranges[0], ranges[1]] : [semverRange];
            } else if (semverRange.includes("~")) {
                sql += ` (LATEST_VERSION REGEXP '?\\.[0-9]+$'`;
                values = [semverRange];
            } else if (semverRange.includes("^")) {
                sql += ` (LATEST_VERSION REGEXP '^((?)|[1-9]\\.[0-9]\\.[0-9])$'`;
                values = [semverRange];
            } else {
                sql = ` (LATEST_VERSION = ?`;
                values = [semverRange];
            }
            if (package_Name != '*') {
                sql += ` AND NAME = ?)`;
                values.push(package_Name);
            } else {
                sql += `)`;
            }
        }
    }
    sql += ` LIMIT 10 OFFSET ${offset * 10};` //Only return the first 10 results for pagination
    console.log(sql);
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


export function searchPackage(databaseName: string, packageNameOrId: string) {
    const query = `SELECT * FROM pkg_data WHERE name = ? OR id = ?`;
    const values = [packageNameOrId, packageNameOrId];
    const dbQuery = { sql: query, values };
    return queryDatabase(databaseName, dbQuery);
}

export function getScores(databaseName: string, packageNameOrId: string) {
    const query = `SELECT * FROM scores WHERE name = ? OR id = ?`;
    const values = [packageNameOrId, packageNameOrId];
    const dbQuery = { sql: query, values };
    return queryDatabase(databaseName, dbQuery);
}

export function searchPackageWithRegex(databaseName: string, regex: string) {
    const query = `SELECT * FROM pkg_data WHERE name REGEXP ? OR id REGEXP ?`;
    const values = [regex, regex];
    const dbQuery = { sql: query, values };
    return queryDatabase(databaseName, dbQuery);
}




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

/**
 * Runs a query to check if a package with the corrensponding metadata exists in the DB
 * @param metadata - The package metadata to check.
 * Returns the path to the matching package
 */
export async function checkMetadataExists(metadata: PackageMetadata) {
    const check_metadata_matches: DbQuery = {
        sql: `SELECT DEBLOATED FROM pkg_data WHERE NAME = ? AND LATEST_VERSION = ? AND ID = ?;`,
        values: [metadata.Name, metadata.Version, metadata.ID]
    }
    const matching_pkg = await queryDatabase("packages", check_metadata_matches)
    if(matching_pkg[0].length == 0) { //If no match is found
        logger.debug("Failed to find package with matching metadata")
        return null
    }
    else {
        return matching_pkg[0][0].DEB
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
    return response;
}
export async function RegexPkgDataGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM pkg_data WHERE ID REGEXP ?;`,
        values: [pkg_ID]
    }
    const response = await queryDatabase("packages", get_pkgdata_query)
    console.log(response);
    return response;
}

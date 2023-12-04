import logger from "../../utils/logger";
import { PackageMetadata, PackageRating, PackageQuery } from "../../models/api_schemas";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";
import { number } from "io-ts";


/**
 * Inserts package data and scores into the RDS DB atomically
 * @param metric_scores - The package rating metrics.
 * @param pkg_metadata - The package metadata.
 * @param contentsPath - The path to the package contents.
 */
export async function insertPackageIntoDB(metric_scores: PackageRating, pkg_metadata: PackageMetadata, contentsPath: string, debloating: boolean) {
    const version_numbers = pkg_metadata.Version.split("."); //Gets an array of the version numbers
    //Store each version number seperately for the sake of comparison later
    const insert_pkgdata_query: DbQuery = { 
        sql: `INSERT INTO pkg_data (ID, NAME, LATEST_VERSION, MAJOR_VERSION, MINOR_VERSION, PATCH, CONTENTS_PATH, DEBLOATED) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        values: [pkg_metadata.ID, pkg_metadata.Name, pkg_metadata.Version, version_numbers[0], version_numbers[1], version_numbers[2], contentsPath, debloating]
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
    const values: string[] = [];
    //sql = 'SELECT ID, NAME, LATEST_VERSION from pkg_data';
    let conditions: string = ''
    const valid_version = /^([~^]?([0-9]+)(\.[0-9]+)?(\.[0-9]+)?)$|^([0-9]+)(\.[0-9]+)?(\.[0-9]+)?-([0-9]+)(\.[0-9]+)?(\.[0-9]+)?$/ //Enforces that version strings are of valid format


    for (let i = 0; i < queries.length; i++) {
        const package_Name = queries[i].Name;
        let semverRange = queries[i].Version;
        // logger.debug("Semver range: " + semverRange)
        if(semverRange != undefined && !valid_version.test(semverRange)) {
            throw new Error("Invalid Version String")
        }

        if(i != 0) { //Keep ORing the additional SQL queries
            conditions += ' OR';
        }
        else if(!(queries.length == 1 && semverRange == undefined && queries[0].Name == "*")) { //If there is only one query and it is not a serverRange query and it gets all names, don't add the WHERE
            conditions += ' WHERE';
        }
        if (semverRange == undefined) {
            if (package_Name != '*') {
                conditions += ` (NAME = ?)`;
                values.push(queries[0].Name);
            }
        } else {
    
            if (semverRange.includes("-")) {
                ranges = semverRange.replace("-", ".").split(".");
                //conditions += ` (MAJOR_VERSION >= ? AND MAJOR_VERSION <= ? AND MINOR_VERSION >= ? AND MINOR_VERSION <= ? AND PATCH >= ? AND PATCH <= ?`;
                //This one is rly tough bc we need some pretty complex conditions
                conditions += ` (((MAJOR_VERSION = ? AND MINOR_VERSION >= ? AND PATCH >= ?) OR (MAJOR_VERSION > ? AND MAJOR_VERSION < ?) OR (MAJOR_VERSION = ? AND MINOR_VERSION <= ? AND PATCH <= ?))`;
                if(ranges.length > 0) {
                    values.push(ranges[0], ranges[1], ranges[2], ranges[0], ranges[3], ranges[3], ranges[4], ranges[5]);
                }
                else {
                    values.push(semverRange)
                }
            } else if (semverRange.includes("~")) {
                semverRange = semverRange.replace("~","");
                const version_numbers = semverRange.split("."); //Gets an array of the version numbers

                if(version_numbers[1] == '0' && version_numbers[2] == '0') {
                    conditions += ` (MAJOR_VERSION = ?`;
                    values.push(version_numbers[0]);
                }
                else {
                    conditions += ` (MAJOR_VERSION = ? AND MINOR_VERSION = ? AND PATCH >= ?`;
                    values.push(version_numbers[0], version_numbers[1], version_numbers[2]);
                }
                
                //conditions += ` (LATEST_VERSION REGEXP '?\\.[0-9]+$'`;

                // values.push(semverRange, upper_version);
            } else if (semverRange.includes("^")) {
                semverRange = semverRange.replace("^",""); //Remove the carat from the string
                const version_numbers = semverRange.split("."); //Gets an array of the version numbers
                if(version_numbers[0] != '0') {
                    conditions += ` (MAJOR_VERSION = ? AND MINOR_VERSION >= ? AND PATCH >= ?`;
                    values.push(version_numbers[0], version_numbers[1], version_numbers[2]);
                }
                else if(version_numbers[1] != '0') {
                    conditions += ` (MINOR_VERSION = ? AND PATCH >= ?`;
                    values.push(version_numbers[1], version_numbers[2]);
                }
                else {
                    conditions += ` (PATCH = ?`;
                    values.push(version_numbers[2]);
                }

                //conditions += ` (LATEST_VERSION REGEXP '^((?)|[1-9]\\.[0-9]\\.[0-9])$'`;
                // values.push(semverRange, upper_version);

            } else {
                conditions += ` (LATEST_VERSION = ?`;
                values.push(semverRange);
            }
            if (package_Name != '*') {
                conditions += ` AND NAME = ?)`;
                values.push(package_Name);
            } else {
                conditions += `)`;
            }
        }
    }

    const sql: string = `SELECT ID, NAME, LATEST_VERSION from pkg_data ${conditions} LIMIT 10 OFFSET ${offset * 10};` //Only return the first 10 results for pagination 
    const count = `SELECT count(*) as MATCHES from pkg_data ${conditions};` //Use the count to know if we need to paginate
    // console.log(sql)
    // console.log(values)


    const get_pkgdata_query: DbQuery = { sql, values };
    const count_responses_query: DbQuery = { sql: count, values };
    try {
        const response = await queryDatabase("packages", [get_pkgdata_query, count_responses_query]);
        // console.log("here in POSTGET", response);
        return response;
    } catch (err) {
        logger.error('Error querying database:', err);
        throw err;
    }
}


// export function searchPackage(databaseName: string, packageNameOrId: string) {
//     const query = `SELECT * FROM pkg_data WHERE name = ? OR id = ?`;
//     const values = [packageNameOrId, packageNameOrId];
//     const dbQuery = { sql: query, values };
//     return queryDatabase(databaseName, dbQuery);
// }

export async function searchPackageWithRegex(regex: string) {
    const query = `SELECT ID, NAME, LATEST_VERSION FROM pkg_data WHERE name REGEXP ?`;
    const values = [regex, regex];
    const dbQuery = { sql: query, values };
    try {
        const response = await queryDatabase("packages", dbQuery);
        // console.log(response);
        return response[0];
    }
    catch (err) {
        logger.error('Error querying database with RegEx:', err);
        throw err;
    }

}


export async function genericPkgDataGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM pkg_data WHERE ID = ?;`,
        values: [pkg_ID]
    }
    try {
        const response = await queryDatabase("packages", get_pkgdata_query)
        // console.log(response);
        return response[0][0]
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
        return matching_pkg[0][0].DEBLOATED
    }


}

export async function PkgScoresGet(db_field: string, pkg_ID: string) {
    try {
        const get_pkgdata_query: DbQuery = {
            sql: `SELECT ${db_field} FROM scores WHERE ID = ?;`,
            values: [pkg_ID]
        }
        const response = await queryDatabase("packages", get_pkgdata_query)
        logger.debug("Successfully retrieved package scores from database")
        // console.log(response)
        return response[0][0];
    }
    catch (err) {
        console.error('Error querying database for scores: ', err);
        throw err
    }
}

export async function RegexPkgDataGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM pkg_data WHERE ID REGEXP ?;`,
        values: [pkg_ID]
    }
    const response = await queryDatabase("packages", get_pkgdata_query)
    // console.log(response);
    return response;
}

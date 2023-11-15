import logger from "../../utils/logger";
import { PackageMetadata, PackageRating } from "../../models/api_schemas";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";

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


export function searchPackage(databaseName: string, packageNameOrId: string): Promise<any> {
    const query = `SELECT * FROM pkg_data WHERE name = ? OR id = ?`;
    const values = [packageNameOrId, packageNameOrId];
    const dbQuery = { sql: query, values };
    return queryDatabase(databaseName, dbQuery);
}

export function getScores(databaseName: string, packageNameOrId: string): Promise<any> {
    const query = `SELECT * FROM scores WHERE name = ? OR id = ?`;
    const values = [packageNameOrId, packageNameOrId];
    const dbQuery = { sql: query, values };
    return queryDatabase(databaseName, dbQuery);
}

export function searchPackageWithRegex(databaseName: string, regex: string): Promise<any> {
    const query = `SELECT * FROM pkg_data WHERE name REGEXP ? OR id REGEXP ?`;
    const values = [regex, regex];
    const dbQuery = { sql: query, values };
    return queryDatabase(databaseName, dbQuery);
}





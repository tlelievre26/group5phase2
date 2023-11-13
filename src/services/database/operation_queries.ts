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

export async function updatePackageVersionInDB(new_version: string, new_scores: PackageRating, pkg_id: string) {
    const update_pkgdata_query: DbQuery = { 
        sql: `UPDATE pkg_data SET LATEST_VERSION = ? WHERE ID = ?`, 
        values: [new_version, pkg_id]
    };
    const update_scores_query: DbQuery = {
        sql: `UPDATE scores SET BusFactor = ?, Correctness = ?, RampUp = ?, ResponsiveMaintainer = ?, LicenseScore = ?, GoodPinningPractice = ?, PullRequest = ? WHERE ID = ?`, 
        values: [new_scores.BusFactor, new_scores.Correctness, new_scores.RampUp, new_scores.ResponsiveMaintainer, new_scores.LicenseScore, new_scores.GoodPinningPractice, new_scores.PullRequest, pkg_id]
    };
    try {
        await queryDatabase("packages", [update_pkgdata_query, update_scores_query])
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
    console.log(id_exists)
    if(id_exists[0][0].count > 0) { //Need to do [0][0] because query returns a list of Promises bc of its atomic nature
        return true
    }
    else {
        return false
    }
}

/**
 * Runs a query to check if a package with the corrensponding metadata exists in the DB
 * @param metadata - The package metadata to check.
 * Returns the path to the matching package
 */
export async function checkMetadataExists(metadata: PackageMetadata) {
    const check_metadata_matches: DbQuery = {
        sql: `SELECT CONTENTS_PATH FROM pkg_data WHERE NAME = ? AND LATEST_VERSION = ? AND ID = ?;`,
        values: [metadata.Name, metadata.Version, metadata.ID]
    }
    const matching_pkg = await queryDatabase("packages", check_metadata_matches)
    if(matching_pkg[0].length == 0) { //If no match is found
        logger.debug("Failed to find package with matching metadata")
        return null
    }
    else {
        return matching_pkg[0][0].CONTENTS_PATH
    }


}
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

    if(id_exists[0][0].count > 0) { //Need to do [0][0] because query returns a list of Promises bc of its atomic nature
        return true
    }
    else {
        return false
    }
}

export async function genericPkgDataGet(db_field: string, pkg_ID: string) {
    const get_pkgdata_query: DbQuery = {
        sql: `SELECT ${db_field} FROM pkg_data WHERE ID = ?;`,
        values: [pkg_ID]
    }
    const response = await queryDatabase("packages", get_pkgdata_query)
    return response[0][0][db_field]
}
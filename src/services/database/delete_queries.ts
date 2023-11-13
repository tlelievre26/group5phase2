import logger from "../../utils/logger";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";

export async function deletePackageDataByID(pkg_ID: string) {
    const delete_pkgdata_query: DbQuery = {
        sql: `DELETE FROM pkg_data WHERE ID = ?`, 
        values: [pkg_ID]
    };
    const delete_scores_query: DbQuery = {
        sql: `DELETE FROM scores WHERE ID = ?`,
        values: [pkg_ID]
    }
    try {
        await queryDatabase("packages", [delete_pkgdata_query, delete_scores_query])
        logger.debug("Deleted package data and scores from RDS DB");
    }
    catch (err) {
        console.error('Error deleting package info from database:', err);
        throw err
    }
}
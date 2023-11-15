import logger from "../../utils/logger";
import queryDatabase from "./db_query";
import { DbQuery } from "../../models/other_schemas";

export async function deletePackageDataByID(pkg_ID: string) {
    const delete_pkgdata_query: DbQuery = {
        sql: `DELETE FROM pkg_data WHERE ID = ?`, 
        values: [pkg_ID]
    };
    // const delete_scores_query: DbQuery = {
    //     sql: `DELETE FROM scores WHERE ID = ?`,
    //     values: [pkg_ID]
    // }

    //NOTE: WE DONT NEED TO DELETE SCORES BC I SET UP A TRIGGER TO DO IT AUTOMATICALLY

    try {
        await queryDatabase("packages", delete_pkgdata_query)
        logger.debug("Deleted package data and scores from RDS DB");
    }
    catch (err) {
        logger.error('Error deleting package info from database:', err);
        throw err
    }
}

export async function wipeDBpackages() {
    //Deletes everything in scores too automatically bc of database trigger

    const delete_all_pkgdata_query: DbQuery = {
        sql: `DELETE FROM pkg_data`, 
        values: []
    };
    try {
        await queryDatabase("packages", delete_all_pkgdata_query)
        logger.debug("Deleted all package data and scores from RDS DB");
    }
    catch (err) {
        logger.error('Error deleting package info from database:', err);
        throw err
    }
}
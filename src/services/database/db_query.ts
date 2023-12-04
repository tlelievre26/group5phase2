import { DbQuery } from "../../models/other_schemas";
import db_connection from "../../utils/db_connect";
import logger from "../../utils/logger";

/**
 * Executes one or more SQL queries on a specified database in our AWS RDS.
 * @param {string} databaseName - The name of the database to query.
 * @param {Query | Query[]} queries - The SQL query or queries to execute.
 * If a list, processes each call atomically
 * @returns {Promise} A promise that resolves with the query results or rejects with an error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function queryDatabase(databaseName: string, queries: DbQuery | DbQuery[]): Promise<any> {
  //Written by chat GPT
    return new Promise((resolve, reject) => {
        db_connection.getConnection((err, connection) => {
            if (err) {
              reject(err);
              return;
            }
      
            connection.beginTransaction((beginErr) => {

              if (beginErr) {
                logger.error("Error beginning transaction", beginErr)
                connection.rollback(() => {
                  connection.release();
                  reject(beginErr);
                });
                return;
              }
      
              connection.query(`USE ${databaseName}`, (useErr) => {
                if (useErr) {
                  logger.error("Error selecting table from DB", useErr)
                  connection.rollback(() => {
                    connection.release();
                    reject(useErr);
                  });
                  return;
                }
      
                // Ensure queries is an array
                const queryList = Array.isArray(queries) ? queries : [queries];
      
                // Execute each query in the list
                const promises = queryList.map((query) => {
                  return new Promise((queryResolve, queryReject) => {
                    connection.query(query.sql, query.values, (queryErr, results) => {
                      if (queryErr) {
                        logger.error("Error running main query", queryErr)
                        connection.rollback(() => {
                          connection.release();
                          queryReject(queryErr);
                        });
                      } else {
                        queryResolve(results);
                      }
                    });
                  });
                });
      
                Promise.all(promises)
                  .then((results) => {
                    connection.commit((commitErr) => {
                      if (commitErr) {
                        logger.error("Error committing results to DB", commitErr)
                        connection.rollback(() => {
                          connection.release();
                          reject(commitErr);
                        });
                      } else {
                        connection.release(); // Release the connection
                        resolve(results);
                      }
                    });
                  })
                  .catch((error) => {
                    connection.rollback(() => {
                      connection.release(); // Release the connection
                      reject(error);
                    });
                  });
              });
            });
          });
        });
}
import mysql from 'mysql'
import logger from './logger'

if(!process.env.DB_PORT) { //Uses 3306 as a default port
    logger.warn("Warning: DB_PORT not set, using 3306 as default")
    process.env.DB_PORT = "3306"
}

if(!process.env.DB_HOST) { //Uses localhost as a default hostname
    logger.warn("Warning: DB_HOSTNAME not set, using localhost as default")
    process.env.DB_HOST = "localhost"
}

const db_connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "3306") 
})

export default db_connection
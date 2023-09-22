import { ILogObj, Logger } from "tslog";
import * as fs from "fs";
import { appendFileSync } from "fs";

const logLevel: number = parseInt(process.env.LOG_LEVEL || "0", 10);
const logFilePath = process.env.LOG_FILE;

if (!logFilePath) {
    console.log("Log file path is not set. Exiting...");
    throw new Error("Log file path is not set. Exiting...");
}

// Ensure the log file exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');  // create the file
}

const log: Logger<ILogObj> = new Logger({
    name: "ModuleMetricsCLI",
    minLevel: logLevel,
});

// Attach the file transport
log.attachTransport((logObj) => {
    appendFileSync(logFilePath, JSON.stringify(logObj) + "\n");
});

export default log;

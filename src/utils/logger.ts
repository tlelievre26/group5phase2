import { ILogObj, ISettingsParam, Logger } from "tslog";
import * as fs from "fs";
import { appendFileSync } from "fs";

// Parse the LOG_LEVEL environment variable, defaulting to 0 if none found
const logLevel: number = parseInt(process.env.LOG_LEVEL || "0", 10);
const logFilePath = process.env.LOG_FILE;

if (!logFilePath) {
    console.log("Log file path is not set. Exiting (Code 1)...");
    throw new Error("Log file path is not set. Exiting (Code 1)...");
}

// Ensure the log file exists. If not, create it.
if (!fs.existsSync(logFilePath)) {
    console.log("Log file does not exist. Creating...");
    fs.writeFileSync(logFilePath, "");
}

// Create a new logger instance
const log: Logger<ILogObj> = new Logger({
    name: "ModuleMetricsCLI",
    minLevel: 0 // default verbosity is 0
});

switch (logLevel) {
    case 0:
        // If LOG_LEVEL is 0, set type to hidden
        log.settings.type = "hidden";
        log.debug("Set type to hidden");
        break;
    case 1:
        // If LOG_LEVEL is 1, set minLevel to 3 (info)
        log.settings.minLevel = 3;
        log.debug("Set minimum severity to 3 (info)");
        break;
    case 2:
        // If LOG_LEVEL is 2, set minLevel to 2 (debug)
        log.settings.minLevel = 2;
        log.debug("Set minimum severity to 2 (debug)");
        break;
    default:
        log.error("Unsupported LOG_LEVEL in logger.ts. Exiting (Code 1)...");
        throw new Error("Configuration Error in logger.ts. Exiting (Code 1)...");
}


// Attach the file transport
log.debug("Attaching file transport...");
log.attachTransport((logObj) => {
    appendFileSync(logFilePath, JSON.stringify(logObj) + "\n");
});

log.info(`Logger configured with minLevel=${log.settings.minLevel}, type=${log.settings.type}`);
export default log;

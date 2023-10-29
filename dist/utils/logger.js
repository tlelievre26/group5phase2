"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tslog_1 = require("tslog");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process_1 = __importDefault(require("process"));
// Parse the LOG_LEVEL environment variable, defaulting to 0 if none found
const logLevel = parseInt(process_1.default.env.LOG_LEVEL || "0", 10);
let logFileName;
if (process_1.default.env.LOG_FILE) {
    logFileName = path.basename(process_1.default.env.LOG_FILE);
}
else {
    console.log(process_1.default.env.LOG_FILE);
    console.log("Log file path is not set. Exiting (Code 1)...");
    throw new Error("Log file path is not set. Exiting (Code 1)...");
}
const logFilePath = path.join(process_1.default.cwd(), logFileName);
// Ensure the log file exists. If not, create it.
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, "");
}
// Create a new logger instance
const log = new tslog_1.Logger({
    name: "ModuleMetricsCLI",
    minLevel: 0,
    type: "pretty"
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
if (logLevel != 0) {
    // Attach the file transport
    log.debug("Attaching file transport...");
    log.attachTransport((logObj) => {
        fs.appendFile(logFilePath, JSON.stringify(logObj, null, 2) + "\n", err => {
            if (err)
                log.error("Error writing to log file:", err);
        });
    });
}
log.debug("Log file path is set to: " + path.join(process_1.default.cwd(), logFileName));
log.info(`Logger configured with minLevel=${log.settings.minLevel}, type=${log.settings.type}`);
exports.default = log;
//# sourceMappingURL=logger.js.map
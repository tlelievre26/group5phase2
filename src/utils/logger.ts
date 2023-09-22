import { ILogObj, Logger } from "tslog";
import * as fs from "fs";

const logLevel: number = parseInt(process.env.LOG_LEVEL || "0", 10);
const logFilePath = process.env.LOG_FILE;

if (logFilePath) {
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, ''); // create the file
    }
}

const log: Logger<ILogObj> = new Logger({
    name: "ModuleMetricsCLI",
    minLevel: logLevel,
});

export default log;
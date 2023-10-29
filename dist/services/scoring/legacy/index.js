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
/* eslint-disable */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("reflect-metadata");
const logger_1 = __importDefault(require("../../../utils/logger"));
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const metrics_controller_1 = require("../controllers/metrics-controller");
const container_1 = require("../container");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const controller = container_1.container.resolve(metrics_controller_1.MetricsController);
const figlet_1 = __importDefault(require("figlet"));
logger_1.default.info(figlet_1.default.textSync("Module Metrics"));
const program = new commander_1.Command();
program
    .version("1.0.0")
    .name("./run")
    .description("A CLI tool for analyzing npm modules");
// ./run test
program
    .command("test")
    .description("Run test suite")
    .action(() => {
    logger_1.default.info("Starting test suite...");
    // Step 1: Run Jest tests
    (0, child_process_1.exec)("npx jest --coverage --coverageReporters=\"json-summary\" --json", (error, stdout, stderr) => {
        if (error) {
            logger_1.default.error(`exec error: ${error}`);
            return;
        }
        const jestResult = JSON.parse(stdout);
        const total = jestResult.numTotalTests;
        const passed = jestResult.numPassedTests;
        // Step 2: Read the coverage-summary.json
        const coverageSummaryPath = path_1.default.join(process.cwd(), "coverage", "coverage-summary.json");
        if (fs.existsSync(coverageSummaryPath)) {
            const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, "utf-8"));
            const coveragePercentage = coverageSummary.total.lines.pct;
            logger_1.default.info(`Total: ${total}`);
            logger_1.default.info(`Passed: ${passed}`);
            logger_1.default.info(`Coverage: ${coveragePercentage}%`);
            process.stdout.write(`${passed}/${total} test cases passed. ${parseInt(coveragePercentage)}% line coverage achieved.`);
            process.exit(0);
        }
        else {
            logger_1.default.error("Coverage summary not found. Ensure jest is generating the summary correctly.");
            process.exit(1);
        }
    });
});
// ./run <URL_FILE>
program
    .arguments("<URL_FILE>")
    .action((urlFilePath) => {
    if (!fs.existsSync(urlFilePath)) {
        logger_1.default.error(`File not found: ${urlFilePath}`);
        process.exit(1);
    }
    else {
        controller.generateMetrics(urlFilePath)
            .then(() => {
            logger_1.default.info("Successfully generated metrics.");
            process.exit(0);
        })
            .catch(error => {
            logger_1.default.error("An error occurred in generateMetrics: ", error);
            process.exit(1);
        });
    }
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map
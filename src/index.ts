import 'reflect-metadata';

import { Command } from "commander";
import { execSync } from "child_process";

import * as fs from 'fs';

import { MetricsController } from "./controllers/metrics-controller";
import { container } from "./container"

const controller = container.resolve(MetricsController);

const figlet = require("figlet");
console.log(figlet.textSync("Module Metrics"));

const program = new Command();

program
    .version("1.0.0")
    .name("./run")
    .description("A CLI tool for analyzing npm modules");

// ./run install -> npm install
program
    .command("install")
    .description("Install dependencies")
    .action(() => {
        execSync("npm install", {stdio: "inherit"});
        console.log("Dependencies successfully installed");
    });

// ./run test
program
    .command("test")
    .description("Run test suite")
    .action(() => {
    });

// ./run <URL_FILE>
program
    // URL_FILE is the absolute location of a file consisting of an ASCII-encoded newline-delimited set of URLs
    .arguments("<URL_FILE>")
    .action((urlFilePath) => {
        if (!fs.existsSync(urlFilePath)) {
            console.error(`File not found: ${urlFilePath}`);
        } else {
            try {
                controller.generateMetrics(urlFilePath);
            } catch (error) {
                console.error((error as Error).message);
            }
        }
    });

program.parse(process.argv);
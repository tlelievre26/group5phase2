import {Command} from "commander";
import {execSync} from "child_process";
import * as fs from 'fs';

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
    .action((URL_FILE) => {
        if (!fs.existsSync(URL_FILE)) {
            console.error(`File not found: ${URL_FILE}`);
        } else {
            try {
                const urls = fs.readFileSync(URL_FILE, 'utf-8').split('\n');
                urls.forEach((url) => {
                    if (url) {
                        // Produce NDJSON output of scores for each URL
                    }
                });
            } catch (error) {
                console.error((error as Error).message);
            }
        }
    });

program.parse(process.argv);
import { injectable, inject } from "tsyringe";
import fs from "fs";
import logger from "../utils/logger";
import { NpmUrlResolver } from "./npm-url-resolver";


@injectable()
export class UrlFileProcessor {

    /**
     * Creates a new instance of the UrlFileProcessor class.
     *
     * @param npmUrlResolver
     */
    constructor(
        @inject("NpmUrlResolver") private npmUrlResolver: NpmUrlResolver
    ) {
    }


    /**
     * Processes a file containing a list of GitHub or npm URLs.
     *
     * @param urlFilePath
     */
    async processUrlFile(urlFilePath: string): Promise<string[]> {
        try {
            const urls = await this.extractUrlsFromFile(urlFilePath);
            const processedUrls: string[] = [];

            for (const url of urls) {
                if (await this.isGitHubUrl(url)) {
                    processedUrls.push(url); // No processing needed
                } else if (await this.isNpmUrl(url)) {
                    logger.debug(`Resolving npm URL to GitHub URL: ${url}`);
                    const gitHubUrl = await this.npmUrlResolver.resolveNpmToGitHub(url);
                    processedUrls.push(gitHubUrl); // Resolve npm URL to GitHub URL
                } else {
                    logger.error(`Unsupported URL type: ${url}`)
                    throw new Error(`Unsupported URL type: ${url}`);
                }
            }
            return processedUrls;
        } catch (error) {
            logger.error(`Error processing URL file ${urlFilePath}:`, error);
            throw error;
        }
    }


    /**
     * Checks if a URL is a GitHub URL.
     *
     * @param url
     */
    async isGitHubUrl(url: string): Promise<boolean> {
        if (!url) {
            throw new Error("URL is empty in isGitHubUrl");
        }
        const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
        return githubRegex.test(url);
    }


    /**
     * Checks if a URL is a npm URL.
     *
     * @param url
     */
    async isNpmUrl(url: string): Promise<boolean> {
        if (!url) {
            throw new Error("URL is empty in isNpmUrl");
        }
        const npmRegex = /^https:\/\/www\.npmjs\.com\/package\/[a-zA-Z0-9_-]+$/;
        return npmRegex.test(url);
    }


    /**
     * Extracts a list of URLs from a file.
     *
     * @param urlFilePath
     */
    async extractUrlsFromFile(urlFilePath: string): Promise<string[]> {
        const fileContents = fs.readFileSync(urlFilePath, "utf-8");
        return fileContents.split("\n").map(line => line.trim()).filter(Boolean);
    }
}
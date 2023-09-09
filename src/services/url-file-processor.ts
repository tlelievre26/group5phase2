import { injectable, inject } from "tsyringe";
import fs from "fs";

import { NpmUrlResolver } from "./npm-url-resolver";


@injectable()
export class UrlFileProcessor {

    constructor(
        @inject("NpmUrlResolver") private npmUrlResolver: NpmUrlResolver
    ) {
    }


    async processUrlFile(urlFilePath: string): Promise<string[]> {
        const urls = await this.extractUrlsFromFile(urlFilePath);
        const processedUrls: string[] = [];

        for (const url of urls) {
            if (await this.isGitHubUrl(url)) {
                processedUrls.push(url);
            } else if (await this.isNpmUrl(url)) {
                const gitHubUrl = await this.npmUrlResolver.resolveNpmToGitHub(url);
                processedUrls.push(gitHubUrl);
            } else {
                throw new Error(`Unsupported URL type: ${url}`);
            }
        }

        return processedUrls;
    }


    async isGitHubUrl(url: string): Promise<boolean> {
        if (!url) {
            throw new Error("URL is empty in isGitHubUrl");
        }
        const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
        return githubRegex.test(url);
    }


    async isNpmUrl(url: string): Promise<boolean> {
        if (!url) {
            throw new Error("URL is empty in isNpmUrl");
        }
        const npmRegex = /^https:\/\/www\.npmjs\.com\/package\/[a-zA-Z0-9_-]+$/;
        return npmRegex.test(url);
    }


    async extractUrlsFromFile(urlFilePath: string): Promise<string[]> {
        const fileContents = fs.readFileSync(urlFilePath, "utf-8");
        return fileContents.split("\n").map(line => line.trim()).filter(Boolean);
    }
}
import { injectable } from "tsyringe";
import logger from "../utils/logger";


@injectable()
export class NpmUrlResolver {

    private PACKAGE_NAME_REGEX = /^https:\/\/www\.npmjs\.com\/package\/([a-z0-9\-_]+)/;
    private GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;


    /**
     * Resolves a npm URL to a GitHub URL.
     *
     * @param npmUrl
     */
    async resolveNpmToGitHub(npmUrl: string): Promise<string> {

        logger.debug(`Resolving npm URL to GitHub URL: ${npmUrl}`);
        // Extract package name from npm URL
        const npmPackageName = npmUrl.match(this.PACKAGE_NAME_REGEX);

        if (!npmPackageName) {
            throw new Error(`Invalid npm URL: ${npmUrl}`);
        }

        // Fetch package data from npm registry
        const response = await fetch(`https://registry.npmjs.org/${npmPackageName[1]}`);
        const data = await response.json();

        if (!data.repository?.url) {
            throw new Error(`No repository URL found for package: ${npmPackageName[1]}`);
        }

        // Extract owner and repo from GitHub URL
        const resolvedUrl = "https://" + data.repository.url.match(this.GITHUB_URL_REGEX)[0];
        logger.debug(`Successfully resolved npm URL to GitHub URL: ${resolvedUrl}`)
        return resolvedUrl;
    }
}
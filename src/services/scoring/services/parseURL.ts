import { RepoIdentifier } from "../../../models/other_schemas";
import logger from "../../../utils/logger";



/**
 * Extracts owner and repo from a GitHub URL.
 * @param url
 * 
 */
export function extractGitHubInfo(url: string): RepoIdentifier {
    const GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
    const urlMatch = url.match(GITHUB_URL_REGEX);
    if (!urlMatch) {
        throw new Error(`Invalid GitHub URL: ${url}`);
    }
    const {1: owner, 2: repo} = urlMatch;
    logger.debug(`Extracted owner ${owner} and repo ${repo} from URL ${url}`)
    return {owner, repo};
}

//May also want to add a URL validation function to this

/**
 * Resolves a npm URL to a GitHub URL.
 *
 * @param npmUrl
 */
export async function resolveNpmToGitHub(npmUrl: string): Promise<string> {
    const PACKAGE_NAME_REGEX = /^https:\/\/www\.npmjs\.com\/package\/([a-z0-9\-_]+)/;
    const GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
    logger.debug(`Resolving npm URL to GitHub URL: ${npmUrl}`);
    // Extract package name from npm URL
    const npmPackageName = npmUrl.match(PACKAGE_NAME_REGEX);

    if (!npmPackageName) {
        logger.error("Passed in URL failed to match NPM URL")
        return ""
    }

    // Fetch package data from npm registry
    const response = await fetch(`https://registry.npmjs.org/${npmPackageName[1]}`);
    const data = await response.json();

    if (!data.repository?.url) {
        logger.error(`No repository URL found for package: ${npmPackageName[1]}`);
        return ""
    }

    // Extract owner and repo from GitHub URL
    const resolvedUrl = "https://" + data.repository.url.match(GITHUB_URL_REGEX)[0];
    logger.debug(`Successfully resolved npm URL to GitHub URL: ${resolvedUrl}`)
    return resolvedUrl;
}

export function isGitHubUrl(url: string): boolean {
    if (!url) {
        throw new Error("URL is empty in isGitHubUrl");
    }
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
    return githubRegex.test(url);
}

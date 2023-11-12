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

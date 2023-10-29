"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractGitHubInfo = void 0;
/**
 * Extracts owner and repo from a GitHub URL.
 * @param url
 *
 */
function extractGitHubInfo(url) {
    const GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
    const urlMatch = url.match(GITHUB_URL_REGEX);
    if (!urlMatch) {
        throw new Error(`Invalid GitHub URL: ${url}`);
    }
    const { 1: owner, 2: repo } = urlMatch;
    return { owner, repo };
}
exports.extractGitHubInfo = extractGitHubInfo;
//May also want to add a URL validation function to this
//# sourceMappingURL=parseURL.js.map
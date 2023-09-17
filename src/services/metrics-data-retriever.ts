import { injectable } from "tsyringe";
import { graphql } from "@octokit/graphql";

import { RepoIdentifier } from "../types/repo-identifier";


@injectable()
export class MetricsDataRetriever {

    private GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
    private graphqlWithAuth: any;


    constructor(token: string) {
        this.graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `token ${token}`
            }
        });
    }


    /**
     * Retrieves metrics data for a list of GitHub URLs.
     *
     * TODO:
     *   - Handle errors
     *   - Handle rate limiting/implement retries
     *
     * @param urls List of GitHub repository URLs.
     */
    async retrieveMetricsData(urls: Promise<string[]>): Promise<any[]> {

        // Fetch data for each URL in parallel and return the results
        return Promise.all((await urls).map(async (url) => {

            // Extract owner and repo from GitHub URL
            const {owner, repo} = await this.extractGitHubInfo(url);

            // Fetch data for metrics sequentially
            // TODO: Implement throttling and change to parallel fetching
            const busFactorData = await this.fetchBusFactorData(owner, repo);
            const rampUpData = await this.fetchRampUpData(owner, repo);
            const correctnessData = await this.fetchCorrectnessData(owner, repo);
            const responsiveMaintainerData = await this.fetchResponsiveMaintainerData(owner, repo);

            return {
                url,
                busFactorData,
                rampUpData,
                correctnessData,
                responsiveMaintainerData
            };
        }));
    }


    /**
     * Fetches bus factor data for a GitHub repository.
     *
     * TODO:
     *   - Handle errors
     *   - Handle rate limiting/implement retries
     *
     * @param owner The owner of the repository.
     * @param repo The name of the repository.
     */
    async fetchBusFactorData(owner: string, repo: string): Promise<any> {

        // Get date one year ago
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)).toISOString();

        // Query GitHub API for contributors in the last year
        const query = `
        {
          repository(owner: "${owner}", name: "${repo}") {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(since: "${oneYearAgo}") {
                    totalCount
                    edges {
                      node {
                        author {
                          user {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;

        const {repository} = await this.graphqlWithAuth(query);

        // Count the number of commits for each unique contributor using a map
        const contributorCommits = new Map();
        repository.defaultBranchRef.target.history.edges.forEach((edge: { node: { author: { user: { login: string; }; }; }; }) => {
            // Check author is not null before adding contributor to map
            if (edge.node.author?.user) {
                const contributor = edge.node.author.user.login;
                // Increment commit count for contributor
                contributorCommits.set(contributor, (contributorCommits.get(contributor) || 0) + 1);
            }
        });

        return {
            repo: repo,
            contributorCommits: contributorCommits
        };
    }


    async fetchCorrectnessData(owner: string, repo: string): Promise<any> {


    }


    /**
     * Fetches ramp up data for a GitHub repository.
     *
     * @param owner The owner of the repository.
     * @param repo The name of the repository.
     */
    async fetchRampUpData(owner: string, repo: string): Promise<any> {

        //Queries Github for Readme and Last Version Date
        const query = `
        {
        repository(owner: "${owner}", name: "${repo}") {
            updatedAt
            object(expression: "master:README.md") {
              ... on Blob {
                text
              }
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    edges {
                      node {
                        committedDate
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;

        const {repository} = await this.graphqlWithAuth(query);

        //Checks if Readme Exists and when it was Last Updated
        let readmeContent = "";
        let readmeLength = 0;
        let lastUpdated = "";

        if (repository?.object?.text) {
            readmeContent = repository.object.text;
            readmeLength = readmeContent.length;
            lastUpdated = repository.updatedAt;
        }
        //The Last Version Commit of the Project or NULL
        const lastCommit = repository.defaultBranchRef?.target?.history.edges[0]?.node.committedDate || null;

        return {
            repo: repo,
            readmeContent: readmeContent,
            readmeLength: readmeLength,
            lastUpdated: lastUpdated,
            lastCommit: lastCommit
        };
    }


    async fetchResponsiveMaintainerData(owner: string, repo: string): Promise<any> {

        // Query for the last 100 issues of the repository and their creation and closure dates
        const query = `
      {
          repository(owner: "${owner}", name: "${repo}") {
            issues(last: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
              edges {
                node {
                  id
                  title
                  createdAt
                  closedAt
                }
              }
            }
          }
        }
      `;

        const response = await this.graphqlWithAuth(query);

        const issues = response.repository.issues.edges;

        // Initialize an array to store the time taken for each closed issue
        const timeTakenForIssues: number[] = [];

        issues.forEach((issue: any) => {
            if (issue.node.closedAt) {
                const createdAt = new Date(issue.node.createdAt).getTime();
                const closedAt = new Date(issue.node.closedAt).getTime();
                const timeTaken = closedAt - createdAt;
                timeTakenForIssues.push(timeTaken);
            }
        });

        // If no issues have been closed in the repository, return null and set flag to false
        if (timeTakenForIssues.length === 0) {
            return {
                averageTimeInMillis: null,
                closedIssuesExist: false
            };
        }

        // Calculate total time for issues to be closed in milliseconds
        const totalMillis = timeTakenForIssues.reduce((acc, time) => acc + time, 0);

        // Return average time in milliseconds
        return {
            averageTimeInMillis: totalMillis / timeTakenForIssues.length,
            closedIssuesExist: true
        };
    }


    /**
     * Extracts owner and repo from a GitHub URL.
     * @param url
     * @private
     */
    private async extractGitHubInfo(url: string): Promise<RepoIdentifier> {
        const urlMatch = url.match(this.GITHUB_URL_REGEX);
        if (!urlMatch) {
            throw new Error(`Invalid GitHub URL: ${url}`);
        }
        const {1: owner, 2: repo} = urlMatch;
        return {owner, repo};
    }
}
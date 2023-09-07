import { injectable } from "tsyringe";
import { graphql } from "@octokit/graphql";


@injectable()
export class MetricsDataRetriever {

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
    async retrieveMetricsData(urls: string[]): Promise<any[]> {

        // Helper function to extract owner and repo name from URL
        const extractOwnerAndRepo = (url: string): { owner: string; repo: string } => {
            const path = new URL(url).pathname.split('/');
            return {
                owner: path[1],
                repo: path[2]
            };
        };

        // Fetch data for each URL in parallel and return the results
        return await Promise.all(urls.map(async (url) => {
            const {owner, repo} = extractOwnerAndRepo(url);

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
        const contributorCommitFrequency = new Map();
        repository.defaultBranchRef.target.history.edges.forEach((edge: { node: { author: { user: { login: string; }; }; }; }) => {
            // Check author is not null before adding contributor to map
            if (edge.node.author?.user) {
                const contributor = edge.node.author.user.login;
                // Increment commit count for contributor
                contributorCommitFrequency.set(contributor, (contributorCommitFrequency.get(contributor) || 0) + 1);
            }
        });

        return {
            repo: repo,
            contributorCommitFrequency: contributorCommitFrequency
        };
    }


    async fetchCorrectnessData(owner: string, repo: string): Promise<any> {


    }


    async fetchRampUpData(owner: string, repo: string): Promise<any> {


    }


    async fetchResponsiveMaintainerData(owner: string, repo: string): Promise<any> {


    }
}
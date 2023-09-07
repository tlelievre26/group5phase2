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

    async fetchBusFactorData(owner: string, repo: string): Promise<any> {


    }

    async fetchCorrectnessData(owner: string, repo: string): Promise<any> {


    }

    async fetchRampUpData(owner: string, repo: string): Promise<any> {


    }

    async fetchResponsiveMaintainerData(owner: string, repo: string): Promise<any> {


    }
}
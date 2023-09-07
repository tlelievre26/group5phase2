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

    retrieveMetricsData(urls: string[]): any {

    }

    getBusFactorData(): any {
        return;
    }

    getCorrectnessData(): any {
        return;
    }

    getRampUpData(): any {
        return;
    }

    getResponsiveMaintainerData(): any {
        return;
    }
}
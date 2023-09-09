import { inject, injectable } from "tsyringe";
import { LicenseVerifier } from "./license-verifier";

import { Metrics } from "../types/metrics";


@injectable()
export class MetricsCalculator {
    constructor(
        @inject("LicenseVerifier") private licenseVerifier: LicenseVerifier
    ) {
    }


    /**
     * Calculates metrics for a list of GitHub URLs.
     *
     * TODO: Implement error handling
     *
     * @param urlsPromise
     * @param data
     */
    public async calculateMetrics(urlsPromise: Promise<string[]>, data: any[]): Promise<Metrics[]> {
        const urls = await urlsPromise;

        // Calculate metrics for each URL in parallel and return the results
        return Promise.all(urls.map(async (url, index) => {
            const urlData = data[index];
            const [
                busFactor,
                correctness,
                rampUp,
                responsiveMaintainer
            ] = await Promise.all([
                this.calculateBusFactor(urlData.busFactorData),
                this.calculateCorrectness(urlData.correctnessData),
                this.calculateRampUp(urlData.rampUpData),
                this.calculateResponsiveMaintainer(urlData.responsiveMaintainerData)
            ]);

            const license = await this.licenseVerifier.verifyLicense(url);
            const netScore = await this.calculateNetScore(busFactor, correctness, rampUp, responsiveMaintainer, license);

            return {
                Url: url,
                BusFactor: busFactor,
                Correctness: correctness,
                RampUp: rampUp,
                ResponsiveMaintainer: responsiveMaintainer,
                License: license,
                NetScore: netScore
            };
        }));
    }


    /**
     * Calculates the bus factor for a GitHub repository.
     *
     * TODO: Implement error handling
     *
     * @param busFactorData
     */
    async calculateBusFactor(busFactorData: any): Promise<number> {
        if (!busFactorData || !busFactorData.contributorCommits) {
            throw new Error("busFactorData or contributorCommits is undefined");
        }

        // Convert the busFactorData Map to an array
        const contributorArray: { contributor: string; commitCount: number }[] =
            Array.from(busFactorData.contributorCommits.entries() as [string, number][]).map(([contributor, commitCount]) => ({
                contributor,
                commitCount
            }));


        // Sort contributors by commit count in descending order
        contributorArray.sort((a, b) => b.commitCount - a.commitCount);

        // Calculate 50% of total commits
        const totalCommits = contributorArray.reduce((total, contributor) => total + contributor.commitCount, 0);
        const threshold = totalCommits * 0.5;

        // Find how many top contributors are needed to surpass the threshold
        let count = 0;
        let topContributorsCommitCount = 0;

        for (const contributor of contributorArray) {
            topContributorsCommitCount += contributor.commitCount;
            count++;

            if (topContributorsCommitCount > threshold) {
                break;
            }
        }

        return count;
    }


    async calculateCorrectness(correctnessData: any): Promise<number> {

        return 0;
    }


    async calculateRampUp(rampUpData: any): Promise<number> {

        return 0;
    }


    async calculateResponsiveMaintainer(responsiveMaintainerData: any): Promise<number> {

        return 0;
    }


    async calculateNetScore(busFactor: number, correctness: number, rampUp: number,
                            responsiveMaintainer: number, license: boolean): Promise<number> {

        return 0;
    }
}
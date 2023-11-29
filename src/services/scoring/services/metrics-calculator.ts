/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from "tsyringe";
import { LicenseVerifier } from "./license-verifier";
import { PackageRating } from "../../../models/api_schemas";

import logger from "../../../utils/logger";
import { ExtractedMetadata } from "../../../models/other_schemas";


@injectable()
export class MetricsCalculator {
    constructor(
        @inject("LicenseVerifier") private licenseVerifier: LicenseVerifier
    ) {
    }


    /**
     * Calculates metrics for a list of GitHub URLs.
     *
     *
     * @param urlsPromise
     * @param data
     */
    public async calculateMetrics(owner: string, repo: string, data: any, pkg_metadata: ExtractedMetadata): Promise<PackageRating> {

        try {
            logger.debug(`Calculating metrics for ${repo}...`);

            const [
                busFactor,
                correctness,
                rampUp,
                responsiveMaintainer,
                pullRequest
            ] = await Promise.all([
                this.calculateBusFactor(data.busFactorData),
                this.calculateCorrectness(data.correctnessData),
                this.calculateRampUp(data.rampUpData),
                this.calculateResponsiveMaintainer(data.responsiveMaintainerData),
                this.calculatePercentPullRequest(data.pullRequestData)
            ]);

            //Pretty sure license is seperate here bc it clones the repo locally instead of reading from the API
            const license = await this.licenseVerifier.verifyLicense(pkg_metadata);


            //*********** TO DO: Implement scoring method for pinning practice ***********
            //Similar to license, pinning practice will require a local clone of the repo
            const pinningPractice = 0

            //Net score does NOT factor in the 2 new metrics
            const netScore = await this.calculateNetScore(busFactor, correctness, rampUp, responsiveMaintainer, license);

            return {
                BusFactor: busFactor,
                Correctness: correctness,
                RampUp: rampUp,
                ResponsiveMaintainer: responsiveMaintainer,
                LicenseScore: license,
                GoodPinningPractice: pinningPractice,
                PullRequest: pullRequest,
                NetScore: netScore
            }

        } catch (error) {
            logger.error(`Error calculating metrics for repo ${repo}:`, error);
            throw error;
        }
    }


    /**
     * Calculates the bus factor for a GitHub repository
     *
     *
     * @param busFactorData
     */
    async calculateBusFactor(busFactorData: any): Promise<number> {
        if (!busFactorData || !busFactorData.contributorCommits) {
            throw new Error("busFactorData or contributorCommits is undefined");
        }

        // Convert the busFactorData Map to an array and sort by number of commits in descending order
        const contributorArray = Array.from(busFactorData.contributorCommits.entries() as [string, number][]);
        contributorArray.sort((a, b) => b[1] - a[1]);

        // Calculate the overall total number of commits for the main branch
        const overallTotalCommits = contributorArray.reduce((acc, curr) => acc + curr[1], 0);
        const threshold = overallTotalCommits * 0.5; // Threshold is 50% of the total number of commits

        // Calculate the number of contributors needed to surpass the threshold
        let accumulatedCommits = 0;
        let count = 0;
        for (const [_, commitCount] of contributorArray) {
            accumulatedCommits += commitCount;
            count++;

            if (accumulatedCommits >= threshold) {
                break;
            }
        }

        // Normalize the count to a score between 0 and 1
        return count === 0 ? 0 : count / contributorArray.length
    }


    /**
     * Calculates the correctness score for a GitHub repository
     *
     * @param correctnessData
     */
    async calculateCorrectness(correctnessData: any): Promise<number> {
        // Handle potential error
        if (!correctnessData) {
            throw new Error("correctnessData is undefined");
        }
    
        // Initialize correctness score
        const correctnessScore = 0;
    
        // Find the ratio of open to merged issues
        const openToMergedRatio = correctnessData.openIssues / (correctnessData.mergedRequests + correctnessData.closedRequests);
    
        // Score based on the ratio
        if (isNaN(openToMergedRatio) || !isFinite(openToMergedRatio)) {
            return 0;
        } else {
            if (openToMergedRatio >= 0.9) {
                return 1;
            } else if (openToMergedRatio >= 0.75) {
                return 0.75;
            } else if (openToMergedRatio >= 0.5) {
                return 0.4;
            } else if (openToMergedRatio >= 0.3) {
                return 0.2;
            }
        }
    
        return correctnessScore;
    }

    /**
     * Calculates the ramp up score for a GitHub repository
     *
     * @param rampUpData
     */
    async calculateRampUp(rampUpData: any): Promise<number> {
        try {
            let RampUpScore = 0;
    
            // Log the readme length
            logger.debug(`Readme length: ${rampUpData.readmeLength}`);
    
            // Scores the Readme Length as a factor of the total Ramp Up
            if (rampUpData.readmeLength === 0) {
                RampUpScore = 0;
                return RampUpScore;
            } else {
                // Use Math.min to ensure the scaled RampUpScore is within [0, 1]
                RampUpScore = Math.min(rampUpData.readmeLength / 200, 1);
    
                // Log the scaled RampUpScore
                logger.debug(`Scaled RampUpScore: ${RampUpScore}`);
                
                return RampUpScore;
            }
        } catch (error) {
            logger.error(`Error calculating ramp-up score:`, error);
            throw error;
        }
        }
    


    /**
     * Calculates the responsive maintainer score for a GitHub repository
     *
     * @param responsiveMaintainerData
     */
    async calculateResponsiveMaintainer(responsiveMaintainerData: any): Promise<number> {

        // Error if the responsive data is not fetched properly
        if (!responsiveMaintainerData || (!responsiveMaintainerData.averageTimeInMillis && responsiveMaintainerData.closedIssuesExist)) {
            throw new Error("responsiveMaintainerData or averageTimeInMillis is undefined");
        }
    
        const maxBenchmark = 60 * 24 * 60 * 60 * 1000; // Using 60 days as a benchmark in milliseconds for scaling 
    
        // Calculate the score using a linear scale
        const score = 1 - (responsiveMaintainerData.averageTimeInMillis / maxBenchmark);
    
        return Math.max(0, Math.min(1, score));  // Ensuring the score is within [0, 1]
    }


    /**
     * Calculates the Net Score for a GitHub repository
     *
     * @param busFactor
     * @param correctness
     * @param rampUp
     * @param responsiveMaintainer
     * @param license
     */
    async calculateNetScore(busFactor: number, correctness: number, rampUp: number,
                            responsiveMaintainer: number, license: number): Promise<number> {

        //Note that the net score DOES NOT factor in the 2 new metrics

        // Formulae for the Net Score                        
        const NetScore = ((responsiveMaintainer * 0.28) + (busFactor * 0.28) + (rampUp * 0.22) + (correctness * 0.22)) * (license);

        return NetScore;
    }


}
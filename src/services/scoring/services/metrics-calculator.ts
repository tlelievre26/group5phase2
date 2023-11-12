/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from "tsyringe";
import { LicenseVerifier } from "./license-verifier";
import { PackageRating } from "../../../models/api_schemas";

import logger from "../../../utils/logger";
import { pull } from "isomorphic-git";
import {OctokitResponse} from OctokitResponse; 


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
    public async calculateMetrics(url: string, data: any): Promise<PackageRating> {

        try {
            logger.debug(`Calculating metrics for ${url}...`);

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
            const license = await this.licenseVerifier.verifyLicense(url);


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
            logger.error(`Error calculating metrics for URL ${url}:`, error);
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
        let correctnessScore = 0;

        // Create constants
        const openIssues = correctnessData.openIssues;
        const closedIssues = correctnessData.closedIssues;
        const openRequests = correctnessData.openRequests;
        const closedRequests = correctnessData.closedRequests;
        const mergedRequests = correctnessData.mergedRequests;
        const mergedAndClosed = closedRequests + mergedRequests;

        // Find total issues and pull requests
        const totalIssues = openIssues + closedIssues;
        const totalRequests = openRequests + closedRequests + mergedRequests;


        // If correctnessData is null, no need to calculate score
        if (correctnessData == null) {
            return correctnessScore;
        }

        // Calculate based on number of open and closed issues
        if ((closedIssues + openIssues) === 0) {
            correctnessScore += 0.5;
        } else if (closedIssues > openIssues) {
            if (closedIssues >= (totalIssues * 0.9)) {
                correctnessScore += 0.5;
            } else if (closedIssues >= (totalIssues * 0.75)) {
                correctnessScore += 0.45;
            } else if (closedIssues >= (totalIssues * 0.6)) {
                correctnessScore += 0.4;
            } else {
                correctnessScore += 0.38;
            }
        } else if (closedIssues < openIssues) {
            if (openIssues >= (totalIssues * 0.9)) {
                correctnessScore += 0.1;
            } else if (openIssues >= (totalIssues * 0.75)) {
                correctnessScore += 0.15;
            } else if (openIssues >= (totalIssues * 0.6)) {
                correctnessScore += 0.2;
            } else {
                correctnessScore += 0.25;
            }
        } else {
            correctnessScore += 0.35;
        }

        // Calculate based on number of open, closed, and merged pull requests
        if ((mergedAndClosed + openRequests) === 0) {
            correctnessScore += 0.5;
        } else if (mergedAndClosed > openRequests) {
            if (mergedAndClosed >= (totalRequests * 0.9)) {
                correctnessScore += 0.5;
            } else if (mergedAndClosed >= (totalRequests * 0.75)) {
                correctnessScore += 0.45;
            } else if (mergedAndClosed >= (totalRequests * 0.6)) {
                correctnessScore += 0.4;
            } else {
                correctnessScore += 0.38;
            }
        } else if (mergedAndClosed < openRequests) {
            if (openRequests >= (totalRequests * 0.9)) {
                correctnessScore += 0.1;
            } else if (openRequests >= (totalRequests * 0.75)) {
                correctnessScore += 0.2;
            } else if (openRequests >= (totalRequests * 0.6)) {
                correctnessScore += 0.25;
            } else {
                correctnessScore += 0.3
            }
        } else {
            correctnessScore += 0.35;
        }

        return correctnessScore;
    }


    /**
     * Calculates the ramp up score for a GitHub repository
     *
     * @param rampUpData
     */
    async calculateRampUp(rampUpData: any): Promise<number> {

        //Initializes the RampUpScore
        let RampUpScore = 0;

        //Scores the Readme Length as a factor of the total Ramp Up
        if (rampUpData.readmeLength === 0) {
            RampUpScore = 0;
            return RampUpScore;
        } else if (rampUpData.readmeLength < 1000) { // You can adjust the threshold as needed
            RampUpScore += 0.25;
        } else {
            RampUpScore += 0.5;
        }

        //Assigns Half of the RampUpScore to how far apart the Readme Update and the Last Commit Are
        //The Score goes from 0-0.5 for a range of 1 year apart to the same
        const lastUpdatedDate = new Date(rampUpData.lastUpdated);
        const lastCommitDate = rampUpData.lastCommit ? new Date(rampUpData.lastCommit) : null;
        if (lastCommitDate) {
            // Calculate the absolute time difference in milliseconds
            const timeDifference = Math.abs(lastUpdatedDate.getTime() - lastCommitDate.getTime());

            // Define a maximum time difference (adjust as needed)
            const maxTimeDifference = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds

            // Calculate the score based on the time difference
            RampUpScore += Math.max(0, 0.5 - timeDifference / maxTimeDifference);
        }

        return RampUpScore;
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

        const lambda = 1 / (30 * 24 * 60 * 60 * 1000); // Using 30 days as a benchmark in milliseconds for scaling 

        // Calculate the score using the exponential scale
        const score = Math.exp(-lambda * responsiveMaintainerData.averageTimeInMillis);

        return Math.max(0, Math.min(1, score));  // Ensuring the score is within [0, 1]
    }

    async calculatePercentPullRequest(pullRequestData: any): Promise<number> {
        //TO IMPLEMENT:
        //Equations calculating the pull request score
        return 0
    }


    async dependency(owner: string, repo: string): Promise<number> {
        try {
          const response = await octokit.repos.getContent({
            owner,
            repo,
            path: "package.json"
          });
    

        }
        return 0
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
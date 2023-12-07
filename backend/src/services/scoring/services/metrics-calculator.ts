/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from "tsyringe";
import { LicenseVerifier } from "./license-verifier";
import { PackageRating } from "../../../models/api_schemas";
import {PinningPractice} from "./pinning";

import logger from "../../../utils/logger";
import { pull } from "isomorphic-git";
import { MetricsDataRetriever } from "./metrics-data-retriever";
import { ExtractedMetadata } from "../../../models/other_schemas";


@injectable()
export class MetricsCalculator {
    constructor(
        @inject("LicenseVerifier") private licenseVerifier: LicenseVerifier,
        @inject("MetricsDataRetrieverToken") private metricsDataRetriever: MetricsDataRetriever,
        @inject("PinningPractice") private pinningPractice: PinningPractice
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
                this.calculateRampUp(pkg_metadata["README"]),
                this.calculateResponsiveMaintainer(data.responsiveMaintainerData),
                this.calculatePercentPullRequest(data.pullRequestData)
            ]);

            //Pretty sure license is seperate here bc it clones the repo locally instead of reading from the API
            const license = await this.licenseVerifier.verifyLicense(pkg_metadata);


            //*********** TO DO: Implement scoring method for pinning practice ***********
            //Similar to license, pinning practice will require a local clone of the repo
            const pinning = await this.pinningPractice.pinningDependencies(pkg_metadata);

            //Net score does NOT factor in the 2 new metrics
            const netScore = await this.calculateNetScore(busFactor, correctness, rampUp, responsiveMaintainer, license);

            return {
                BusFactor: busFactor,
                Correctness: correctness,
                RampUp: rampUp,
                ResponsiveMaintainer: responsiveMaintainer,
                LicenseScore: license,
                GoodPinningPractice: pinning,
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
        //New method: of the last 100 commits to the main branch, what percentage of them were made by the top 3 contributors


        if (!busFactorData || !busFactorData.contributorCommits) {
            throw new Error("busFactorData or contributorCommits is undefined");
        }
    

        // Convert the busFactorData Map to an array and sort by number of commits in descending order
        const contributorArray = Array.from(busFactorData.contributorCommits.entries() as [string, number][]);
        contributorArray.sort((a, b) => b[1] - a[1]);

        if(contributorArray.length < 3) { //If there are less than 3 contributors, automatic 0
            return 0
        }

        // // Calculate the overall total number of commits for the main branch
        const overallTotalCommits = contributorArray.reduce((acc, [, commitCount]) => acc + commitCount, 0);
        // const threshold = overallTotalCommits * 0.5; // Threshold is 50% of the total number of commits
    
        //Calculate the percentage of commits that were made by the top 3 contributors out of the last 500
        const percent_top_3 = (contributorArray[0][1] + contributorArray[1][1] + contributorArray[2][1]) / overallTotalCommits;
        //logger.debug(`Percent of commits made by top 3 contributors: ${percent_top_3}%`)

        if(percent_top_3 <= 0.6) { //If the top 3 make up less than 60%, automatic 1
            return 1
        }
        else {
            //Find how much the top 1 contributor makes up
            const percent_top_1 = contributorArray[0][1] / overallTotalCommits;
            //logger.debug(`Percent of commits made by top contributor: ${percent_top_1}%`)

            //This was arbitrary
            return Math.round(Math.min(Math.max(1 - (percent_top_3 - .6) - (percent_top_1 - .4), 0), 1) * 1000) / 1000

        }



        // // Calculate the number of contributors needed to surpass the threshold
        // let accumulatedCommits = 0;
        // let count = 0;
    
        // //This code essentially states "what how many contributors make up over 50% of the commits?"
        // for (const [, commitCount] of contributorArray) {
        //     accumulatedCommits += commitCount;
        //     count++;
    
        //     if (accumulatedCommits >= threshold) {
        //         break;
        //     }
        // }
    
        // Normalize the count to a score between 0 and 1, with lower scores for fewer maintainers
        // const normalizedScore = Math.min(Math.max(1 - count / contributorArray.length,0),1);
        
        // // Ensure the score is between 0 and 1
        // return normalizedScore
    }
    


    /**
     * Calculates the correctness score for a GitHub repository
     *
     * @param correctnessData
     */
    async calculateCorrectness(correctnessData: any): Promise<number> {
        // Handle potential error

        //This implementation is bad and basically always gives a 1 but we don't have time to do it properly

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
        if ((closedIssues + openIssues) === 0) { //If there have been no open issues just assume the repo sucks
            return 0;
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

        return Math.round(correctnessScore * 1000) / 1000;
    }

    /**
     * Calculates the ramp up score for a GitHub repository
     *
     * @param rampUpData
     */
    async calculateRampUp(readme_buffer: Buffer | undefined): Promise<number> {
        if(readme_buffer == undefined) {
            return 0
            //Return 0 if we didnt find a readme
        }
        else {
            //Convert the buffer to a string
            const readme_contents = readme_buffer.toString('utf-8')

            const doc_regex = /\[(.*?)\]\((.*?)\)/gi //Regex that matches a hyperlink (denoted by brackets) and a URL that comes after the brackets
            const matches = readme_contents.match(doc_regex);
            var hasDocumentation = 0; //0 by default
    
            if(matches) {  //If any valid links exist
                matches.forEach((match) => {
                    if (match.toLowerCase().includes('documentation') || match.toLowerCase().includes('docs') || match.toLowerCase().includes('wiki') || match.toLowerCase().includes('document')) {
                        //If there's a documentation link, set it to one
                        //logger.debug(`Found external documentation link: ${match}`)
                        hasDocumentation = 1
                    }
                })
            }
            if(hasDocumentation == 1) {
                //If there's a documentation link, return 1
                return 1
            }
            //Calculate the length of the readme
            const readme_length = readme_contents.length

            //Calculate the score using a linear scale
            const score = Math.min(readme_length / 5000, 1)

            // Log the readme length
            logger.debug(`Readme length: ${readme_length}`);

            // Log the scaled RampUpScore
            // logger.debug(`Scaled RampUpScore: ${score}`);

            return Math.round(score * 1000) / 1000
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
        else if(responsiveMaintainerData.closedIssuesExist == false) {
            logger.debug("Could not calculate responsive maintainer score because there are no closed issues")
            return 0
        }
    
        const maxBenchmark = 120 * 24 * 60 * 60 * 1000; // Using 60 days as a benchmark in milliseconds for scaling 
        
        // Calculate the score using a linear scale
        const score =  1 - (responsiveMaintainerData.averageTimeInMillis / maxBenchmark);
        //logger.debug("Median response time in days: " + responsiveMaintainerData.averageTimeInMillis / (24 * 60 * 60 * 1000))
        return Math.round(Math.max(0, Math.min(1, score) * 1000)) / 1000;  // Ensuring the score is within [0, 1] and rounds it to 3 decimal places
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async calculatePercentPullRequest(percentPullRequestData: any): Promise<number> { //pullRequestData: any
        //TO IMPLEMENT:
        //Equations calculating the pull request score
        try {


            if (percentPullRequestData.pull_requests.length === 0) {
                return 0; // No pull requests made, score is 0 all pushes were to main and unreviewed
            }

            // let numReviewedPullRequests = 0;
            
            // for (const pull of percentPullRequestData.data) {
            //     //checking if pull request has been merged 
            //     if (pull.merged_at !== null) {
            //         //checking for reviews on pull request 

            //         const reviewsResponse = await this.metricsDataRetriever.fetchReviewComments(pull.url);//octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {

            //         if (reviewsResponse.data.length > 0) {
            //             numReviewedPullRequests += 1;
            //         }
            //     }
            // }
            // //calculate fraction 
            // const fractionReviewed = numReviewedPullRequests / percentPullRequestData.data.length;
            let reviewed_commits = 0;
            for (const pull of percentPullRequestData.pull_requests) {
                if (pull.reviews.totalCount > 0) {
                    reviewed_commits += pull.commits.totalCount;
                }
            }
            return Math.round(reviewed_commits / percentPullRequestData.num_commits * 1000) / 1000;

        } catch (error) {
            console.error(error);
            throw error;
        }
    
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
        //idk what to make for the formula, just guessing                     
        const NetScore = ((responsiveMaintainer * 0.28) + (busFactor * 0.28) + (rampUp * 0.22) + (correctness * 0.22)) * (license);

        return Math.round(NetScore * 1000) / 1000;
    }


}
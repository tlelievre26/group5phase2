"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCalculator = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const tsyringe_1 = require("tsyringe");
const license_verifier_1 = require("./license-verifier");
const logger_1 = __importDefault(require("../utils/logger"));
let MetricsCalculator = class MetricsCalculator {
    constructor(licenseVerifier) {
        this.licenseVerifier = licenseVerifier;
    }
    /**
     * Calculates metrics for a list of GitHub URLs.
     *
     *
     * @param urlsPromise
     * @param data
     */
    calculateMetrics(urlsPromise, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const urls = yield urlsPromise;
                logger_1.default.debug(`Calculating metrics for ${urls.length} URLs...`);
                // Calculate metrics for each URL in parallel and return the results
                return yield Promise.all(urls.map((url, index) => __awaiter(this, void 0, void 0, function* () {
                    const urlData = data[index];
                    try {
                        const [busFactor, correctness, rampUp, responsiveMaintainer] = yield Promise.all([
                            this.calculateBusFactor(urlData.busFactorData),
                            this.calculateCorrectness(urlData.correctnessData),
                            this.calculateRampUp(urlData.rampUpData),
                            this.calculateResponsiveMaintainer(urlData.responsiveMaintainerData)
                        ]);
                        const license = yield this.licenseVerifier.verifyLicense(url);
                        const netScore = yield this.calculateNetScore(busFactor, correctness, rampUp, responsiveMaintainer, license);
                        return {
                            URL: url,
                            BUS_FACTOR_SCORE: busFactor,
                            CORRECTNESS_SCORE: correctness,
                            RAMP_UP_SCORE: rampUp,
                            RESPONSIVE_MAINTAINER_SCORE: responsiveMaintainer,
                            LICENSE_SCORE: license,
                            NET_SCORE: netScore
                        };
                    }
                    catch (error) {
                        logger_1.default.error(`Error calculating metrics for URL ${url}:`, error);
                        throw error;
                    }
                })));
            }
            catch (error) {
                logger_1.default.error("Error in calculateMetrics:", error);
                throw error;
            }
        });
    }
    /**
     * Calculates the bus factor for a GitHub repository
     *
     *
     * @param busFactorData
     */
    calculateBusFactor(busFactorData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!busFactorData || !busFactorData.contributorCommits) {
                throw new Error("busFactorData or contributorCommits is undefined");
            }
            // Convert the busFactorData Map to an array and sort by number of commits in descending order
            const contributorArray = Array.from(busFactorData.contributorCommits.entries());
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
            return count === 0 ? 0 : count / contributorArray.length;
        });
    }
    /**
     * Calculates the correctness score for a GitHub repository
     *
     * @param correctnessData
     */
    calculateCorrectness(correctnessData) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else if (closedIssues > openIssues) {
                if (closedIssues >= (totalIssues * 0.9)) {
                    correctnessScore += 0.5;
                }
                else if (closedIssues >= (totalIssues * 0.75)) {
                    correctnessScore += 0.45;
                }
                else if (closedIssues >= (totalIssues * 0.6)) {
                    correctnessScore += 0.4;
                }
                else {
                    correctnessScore += 0.38;
                }
            }
            else if (closedIssues < openIssues) {
                if (openIssues >= (totalIssues * 0.9)) {
                    correctnessScore += 0.1;
                }
                else if (openIssues >= (totalIssues * 0.75)) {
                    correctnessScore += 0.15;
                }
                else if (openIssues >= (totalIssues * 0.6)) {
                    correctnessScore += 0.2;
                }
                else {
                    correctnessScore += 0.25;
                }
            }
            else {
                correctnessScore += 0.35;
            }
            // Calculate based on number of open, closed, and merged pull requests
            if ((mergedAndClosed + openRequests) === 0) {
                correctnessScore += 0.5;
            }
            else if (mergedAndClosed > openRequests) {
                if (mergedAndClosed >= (totalRequests * 0.9)) {
                    correctnessScore += 0.5;
                }
                else if (mergedAndClosed >= (totalRequests * 0.75)) {
                    correctnessScore += 0.45;
                }
                else if (mergedAndClosed >= (totalRequests * 0.6)) {
                    correctnessScore += 0.4;
                }
                else {
                    correctnessScore += 0.38;
                }
            }
            else if (mergedAndClosed < openRequests) {
                if (openRequests >= (totalRequests * 0.9)) {
                    correctnessScore += 0.1;
                }
                else if (openRequests >= (totalRequests * 0.75)) {
                    correctnessScore += 0.2;
                }
                else if (openRequests >= (totalRequests * 0.6)) {
                    correctnessScore += 0.25;
                }
                else {
                    correctnessScore += 0.3;
                }
            }
            else {
                correctnessScore += 0.35;
            }
            return correctnessScore;
        });
    }
    /**
     * Calculates the ramp up score for a GitHub repository
     *
     * @param rampUpData
     */
    calculateRampUp(rampUpData) {
        return __awaiter(this, void 0, void 0, function* () {
            //Initializes the RampUpScore
            let RampUpScore = 0;
            //Scores the Readme Length as a factor of the total Ramp Up
            if (rampUpData.readmeLength === 0) {
                RampUpScore = 0;
                return RampUpScore;
            }
            else if (rampUpData.readmeLength < 1000) { // You can adjust the threshold as needed
                RampUpScore += 0.25;
            }
            else {
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
        });
    }
    /**
     * Calculates the responsive maintainer score for a GitHub repository
     *
     * @param responsiveMaintainerData
     */
    calculateResponsiveMaintainer(responsiveMaintainerData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Error if the responsive data is not fetched properly
            if (!responsiveMaintainerData || (!responsiveMaintainerData.averageTimeInMillis && responsiveMaintainerData.closedIssuesExist)) {
                throw new Error("responsiveMaintainerData or averageTimeInMillis is undefined");
            }
            const lambda = 1 / (30 * 24 * 60 * 60 * 1000); // Using 30 days as a benchmark in milliseconds for scaling 
            // Calculate the score using the exponential scale
            const score = Math.exp(-lambda * responsiveMaintainerData.averageTimeInMillis);
            return Math.max(0, Math.min(1, score)); // Ensuring the score is within [0, 1]
        });
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
    calculateNetScore(busFactor, correctness, rampUp, responsiveMaintainer, license) {
        return __awaiter(this, void 0, void 0, function* () {
            // Formulae for the Net Score                        
            const NetScore = ((responsiveMaintainer * 0.28) + (busFactor * 0.28) + (rampUp * 0.22) + (correctness * 0.22)) * (license ? 1 : 0);
            return NetScore;
        });
    }
};
exports.MetricsCalculator = MetricsCalculator;
exports.MetricsCalculator = MetricsCalculator = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("LicenseVerifier")),
    __metadata("design:paramtypes", [license_verifier_1.LicenseVerifier])
], MetricsCalculator);
//# sourceMappingURL=metrics-calculator.js.map
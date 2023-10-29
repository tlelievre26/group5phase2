"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
jest.mock("../../../services/license-verifier");
describe("MetricsCalculator", () => {
    // let metricsCalculator: MetricsCalculator;
    // let mockLicenseVerifier: jest.Mocked<LicenseVerifier>;
    // beforeEach(() => {
    //     mockLicenseVerifier = new LicenseVerifier() as jest.Mocked<LicenseVerifier>;
    //     mockLicenseVerifier.verifyLicense.mockResolvedValue(true);
    //     metricsCalculator = new MetricsCalculator(mockLicenseVerifier);
    // });
    // describe("calculateMetrics", () => {
    //     it("should calculate metrics for provided GitHub data", async () => {
    //         // Mocking calculate methods
    //         metricsCalculator.calculateBusFactor = jest.fn().mockResolvedValue(0.25);
    //         metricsCalculator.calculateCorrectness = jest.fn().mockResolvedValue(0.50);
    //         metricsCalculator.calculateRampUp = jest.fn().mockResolvedValue(0.75);
    //         metricsCalculator.calculateResponsiveMaintainer = jest.fn().mockResolvedValue(0.15);
    //         metricsCalculator.calculateNetScore = jest.fn().mockResolvedValue(0.60);
    //         const mockData = [
    //             {
    //                 busFactorData: {contributorCommits: new Map([["user1", 50], ["user2", 50]])},
    //                 correctnessData: {},
    //                 rampUpData: {},
    //                 responsiveMaintainerData: {averageTimeInMillis: 1000, closedIssuesExist: true}
    //             }
    //         ];
    //         const urlsPromise = Promise.resolve(["https://github.com/mockOwner/mockRepo"]);
    //         const result = await metricsCalculator.calculateMetrics(urlsPromise, mockData);
    //         expect(result).toEqual([
    //             {
    //                 URL: "https://github.com/mockOwner/mockRepo",
    //                 BUS_FACTOR_SCORE: 0.25,
    //                 CORRECTNESS_SCORE: 0.50,
    //                 RAMP_UP_SCORE: 0.75,
    //                 RESPONSIVE_MAINTAINER_SCORE: 0.15,
    //                 LICENSE_SCORE: true,
    //                 NET_SCORE: 0.60
    //             }
    //         ]);
    //     });
    // });
    // describe("calculateBusFactor", () => {
    //     it("should calculate for 2 contributors with equal commits", async () => {
    //         const busFactorData = {contributorCommits: new Map([["user1", 50], ["user2", 50]])};
    //         const result = await metricsCalculator.calculateBusFactor(busFactorData);
    //         expect(result).toBeCloseTo(0.5);
    //     });
    //     it("should calculate for 3 contributors with varied commits", async () => {
    //         const busFactorData = {contributorCommits: new Map([["user1", 20], ["user2", 30], ["user3", 50]])};
    //         const result = await metricsCalculator.calculateBusFactor(busFactorData);
    //         expect(result).toBeCloseTo(0.33);
    //     });
    //     it("should throw error for undefined contributorCommits", async () => {
    //         await expect(metricsCalculator.calculateBusFactor({}))
    //             .rejects.toThrow("busFactorData or contributorCommits is undefined");
    //     });
    // });
    // describe("calculateResponsiveMaintainer", () => {
    //     it("should calculate for averageTimeInMillis = 1000 and closedIssuesExist = true", async () => {
    //         // Mock average time in milliseconds (15 days)
    //         const responsiveMaintainerData = {averageTimeInMillis: 1296000000, closedIssuesExist: true};
    //         const result = await metricsCalculator.calculateResponsiveMaintainer(responsiveMaintainerData);
    //         expect(result).toBeCloseTo(Math.exp(-0.5));
    //     });
    // });
    // describe("calculateCorrectness", () => {
    //     it("should calculate for more closed issues (than open issues) and more closed/merged requests (than open requests)", async () => {
    //         const correctnessData = {openIssues: 24, closedIssues: 58, openRequests: 88, closedRequests: 91, mergedRequests: 122};
    //         const result = await metricsCalculator.calculateCorrectness(correctnessData);
    //         expect(result).toEqual(0.8);
    //     });
    //     it("should calculate for more open issues (than closed issues) and more open requests (than closed/merged requests)", async () => {
    //         const correctnessData = {openIssues: 101, closedIssues: 56, openRequests: 88, closedRequests: 22, mergedRequests: 40};
    //         const result = await metricsCalculator.calculateCorrectness(correctnessData);
    //         expect(result).toEqual(0.5);
    //     });
    //     it("should calculate for more closed issues (than open issues) and more open requests (than closed/merged requests)", async () => {
    //         const correctnessData = {openIssues: 4, closedIssues: 13, openRequests: 42, closedRequests: 10, mergedRequests: 12};
    //         const result = await metricsCalculator.calculateCorrectness(correctnessData);
    //         expect(result).toEqual(0.7);
    //     });
    //     it("should calculate for 0 issues (open and closed) and 0 requests (open, closed, and merged)", async () => {
    //         const correctnessData = {openIssues: 0, closedIssues: 0, openRequests: 0, closedRequests: 0, mergedRequests: 0};
    //         const result = await metricsCalculator.calculateCorrectness(correctnessData);
    //         expect(result).toEqual(1);
    //     });
    // });
    // //Ramp Up Calculation Testing
    // describe("calculateRampUp", () => {
    //     it("should calculate RampUpScore for a repository with a short README and close commit and update", async () => {
    //         const rampUpData = {
    //             readmeLength: 500, // Short README
    //             lastUpdated: new Date("2023-09-01"), // Recent update
    //             lastCommit: new Date("2023-09-01"), // Recent commit
    //         };
    //         const result = await metricsCalculator.calculateRampUp(rampUpData);
    //         expect(result).toBeCloseTo(0.75); // Gets Partial Readme Points, and Full Commit/Update Closeness
    //     });
    //     it("should calculate RampUpScore for a repository with a long README and very far apart commit and update", async () => {
    //         const rampUpData = {
    //             readmeLength: 1500, // Long README
    //             lastUpdated: new Date("2023-08-01"), // Older update
    //             lastCommit: new Date("2022-08-01"), // Older commit
    //         };
    //         const result = await metricsCalculator.calculateRampUp(rampUpData);
    //         expect(result).toBeCloseTo(0.5); // Gets Full Readme Points, but No Commit/Update Closeness 
    //     });
    //     it("should calculate RampUpScore for a repository with missing README", async () => {
    //         const rampUpData = {
    //             readmeLength: 0, // Missing README
    //             lastUpdated: new Date("2023-09-01"), // Recent update
    //             lastCommit: new Date("2023-09-01"), // Recent commit
    //         };
    //         const result = await metricsCalculator.calculateRampUp(rampUpData);
    //         expect(result).toBe(0); // No README, so score should be 0
    //     });
    // });
    // //Netscore Testing
    // describe("calculateNetScore", () => {
    //     it("should calculate NetScore when all metrics have high values and a license is present", async () => {
    //         const result = await metricsCalculator.calculateNetScore(0.9, 0.9, 0.9, 0.9, true);
    //         expect(result).toBeCloseTo(0.9); // Adjust expected score as needed
    //     });
    //     it("should calculate NetScore when all metrics have low values and a license is present", async () => {
    //         const result = await metricsCalculator.calculateNetScore(0.1, 0.1, 0.1, 0.1, true);
    //         expect(result).toBeCloseTo(0.1); // Adjust expected score as needed
    //     });
    //     it("should calculate NetScore when some metrics have high values and some have low values, and a license is present", async () => {
    //         const result = await metricsCalculator.calculateNetScore(0.5, 0.7, 0.3, 0.6, true);
    //         expect(result).toBeCloseTo(0.528); // Adjust expected score as needed
    //     });-
    //     it("should calculate NetScore when all metrics have high values but no license is present", async () => {
    //         const result = await metricsCalculator.calculateNetScore(0.9, 0.9, 0.9, 0.9, false);
    //         expect(result).toBe(0); // No license, so score should be 0
    //     });
    //     it("should calculate NetScore when all metrics have low values and no license is present", async () => {
    //         const result = await metricsCalculator.calculateNetScore(0.1, 0.1, 0.1, 0.1, false);
    //         expect(result).toBe(0); // No license, so score should be 0
    //     });
    // });
});
//# sourceMappingURL=metrics-calculator.test.js.map
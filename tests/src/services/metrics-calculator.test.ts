import "reflect-metadata";
import { MetricsCalculator } from "../../../src/services/metrics-calculator";
import { LicenseVerifier } from "../../../src/services/license-verifier";


jest.mock("../../../src/services/license-verifier");

describe("MetricsCalculator", () => {
    let metricsCalculator: MetricsCalculator;
    let mockLicenseVerifier: jest.Mocked<LicenseVerifier>;

    beforeEach(() => {
        mockLicenseVerifier = new LicenseVerifier() as jest.Mocked<LicenseVerifier>;
        mockLicenseVerifier.verifyLicense.mockResolvedValue(true);
        metricsCalculator = new MetricsCalculator(mockLicenseVerifier);
    });

    describe("calculateMetrics", () => {
        it("should calculate metrics for provided GitHub data", async () => {

            // Mocking calculate methods
            metricsCalculator.calculateBusFactor = jest.fn().mockResolvedValue(0.25);
            metricsCalculator.calculateCorrectness = jest.fn().mockResolvedValue(0.50);
            metricsCalculator.calculateRampUp = jest.fn().mockResolvedValue(0.75);
            metricsCalculator.calculateResponsiveMaintainer = jest.fn().mockResolvedValue(0.15);
            metricsCalculator.calculateNetScore = jest.fn().mockResolvedValue(0.60);

            const mockData = [
                {
                    busFactorData: {contributorCommits: new Map([["user1", 50], ["user2", 50]])},
                    correctnessData: {},
                    rampUpData: {},
                    responsiveMaintainerData: {averageTimeInMillis: 1000, closedIssuesExist: true}
                }
            ];

            const urlsPromise = Promise.resolve(["https://github.com/mockOwner/mockRepo"]);

            const result = await metricsCalculator.calculateMetrics(urlsPromise, mockData);

            expect(result).toEqual([
                {
                    Url: "https://github.com/mockOwner/mockRepo",
                    BusFactor: 0.25,
                    Correctness: 0.50,
                    RampUp: 0.75,
                    ResponsiveMaintainer: 0.15,
                    License: true,
                    NetScore: 0.60
                }
            ]);
        });
    });


    describe("calculateBusFactor", () => {
        it("should calculate for 2 contributors with equal commits", async () => {
            const busFactorData = {contributorCommits: new Map([["user1", 50], ["user2", 50]])};
            const result = await metricsCalculator.calculateBusFactor(busFactorData);
            expect(result).toBeCloseTo(0.5);
        });

        it("should calculate for 3 contributors with varied commits", async () => {
            const busFactorData = {contributorCommits: new Map([["user1", 20], ["user2", 30], ["user3", 50]])};
            const result = await metricsCalculator.calculateBusFactor(busFactorData);
            expect(result).toBeCloseTo(0.33);
        });

        it("should throw error for undefined contributorCommits", async () => {
            await expect(metricsCalculator.calculateBusFactor({}))
                .rejects.toThrow("busFactorData or contributorCommits is undefined");
        });
    });

    describe("calculateResponsiveMaintainer", () => {
        it("should calculate for averageTimeInMillis = 1000 and closedIssuesExist = true", async () => {
            // Mock average time in milliseconds (15 days)
            const responsiveMaintainerData = {averageTimeInMillis: 1296000000, closedIssuesExist: true};
            const result = await metricsCalculator.calculateResponsiveMaintainer(responsiveMaintainerData);
            expect(result).toBeCloseTo(Math.exp(-0.5));
        });
    });

    //Ramp Up Calculation Testing
    describe("calculateRampUp", () => {
        it("should calculate RampUpScore for a repository with a short README and close commit and update", async () => {
            const rampUpData = {
                readmeLength: 500, // Short README
                lastUpdated: new Date("2023-09-01"), // Recent update
                lastCommit: new Date("2023-09-01"), // Recent commit
            };
            const result = await metricsCalculator.calculateRampUp(rampUpData);
            expect(result).toBeCloseTo(0.75); // Gets Partial Readme Points, and Full Commit/Update Closeness
        });
    
        it("should calculate RampUpScore for a repository with a long README and very far apart commit and update", async () => {
            const rampUpData = {
                readmeLength: 1500, // Long README
                lastUpdated: new Date("2023-08-01"), // Older update
                lastCommit: new Date("2022-08-01"), // Older commit
            };
            const result = await metricsCalculator.calculateRampUp(rampUpData);
            expect(result).toBeCloseTo(0.5); // Gets Full Readme Points, but No Commit/Update Closeness 
        });
    
        it("should calculate RampUpScore for a repository with missing README", async () => {
            const rampUpData = {
                readmeLength: 0, // Missing README
                lastUpdated: new Date("2023-09-01"), // Recent update
                lastCommit: new Date("2023-09-01"), // Recent commit
            };
            const result = await metricsCalculator.calculateRampUp(rampUpData);
            expect(result).toBe(0); // No README, so score should be 0
        });
    });
    
    //Netscore Testing
    describe("calculateNetScore", () => {
        it("should calculate NetScore when all metrics have high values and a license is present", async () => {
            const result = await metricsCalculator.calculateNetScore(0.9, 0.9, 0.9, 0.9, true);
            expect(result).toBeCloseTo(0.9); // Adjust expected score as needed
        });

        it("should calculate NetScore when all metrics have low values and a license is present", async () => {
            const result = await metricsCalculator.calculateNetScore(0.1, 0.1, 0.1, 0.1, true);
            expect(result).toBeCloseTo(0.1); // Adjust expected score as needed
        });

        it("should calculate NetScore when some metrics have high values and some have low values, and a license is present", async () => {
            const result = await metricsCalculator.calculateNetScore(0.5, 0.7, 0.3, 0.6, true);
            expect(result).toBeCloseTo(0.528); // Adjust expected score as needed
        });-

        it("should calculate NetScore when all metrics have high values but no license is present", async () => {
            const result = await metricsCalculator.calculateNetScore(0.9, 0.9, 0.9, 0.9, false);
            expect(result).toBe(0); // No license, so score should be 0
        });

        it("should calculate NetScore when all metrics have low values and no license is present", async () => {
            const result = await metricsCalculator.calculateNetScore(0.1, 0.1, 0.1, 0.1, false);
            expect(result).toBe(0); // No license, so score should be 0
        });
    });
    // TODO: Add tests for calculateCorrectness, calculateRampUp, calculateResponsiveMaintainer, calculateNetScore
});

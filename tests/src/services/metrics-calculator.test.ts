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


    // TODO: Add tests for calculateCorrectness, calculateRampUp, calculateResponsiveMaintainer, calculateNetScore
});
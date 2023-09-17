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
            const urlsPromise = Promise.resolve(["https://github.com/sample1", "https://github.com/sample2"]);

            const mockData = [
                {
                    busFactorData: {contributorCommits: new Map([["user1", 50], ["user2", 50]])},
                    correctnessData: {},
                    rampUpData: {},
                    responsiveMaintainerData: {}
                },
                {
                    busFactorData: {contributorCommits: new Map([["user1", 20], ["user2", 30], ["user3", 50]])},
                    correctnessData: {},
                    rampUpData: {},
                    responsiveMaintainerData: {}
                }
            ];

            const results = await metricsCalculator.calculateMetrics(urlsPromise, mockData);

            // TODO Add other expected metrics for the URLs once implementation is done
            const expectedResults = [
                {
                    Url: "https://github.com/sample1",
                    BusFactor: 0.5,
                    Correctness: 0,
                    License: true,
                    NetScore: 0,
                    RampUp: 0,
                    ResponsiveMaintainer: 0
                },
                {
                    Url: "https://github.com/sample2",
                    BusFactor: 0.33,
                    Correctness: 0,
                    License: true,
                    NetScore: 0,
                    RampUp: 0,
                    ResponsiveMaintainer: 0
                }
            ];

            expect(results).toEqual(expectedResults);
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
            await expect(metricsCalculator.calculateBusFactor({})).rejects.toThrow("busFactorData or contributorCommits is undefined");
        });
    });


    // TODO: Add tests for calculateCorrectness, calculateRampUp, calculateResponsiveMaintainer, calculateNetScore
});
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const metrics_calculator_1 = require("../../../services/metrics-calculator");
const license_verifier_1 = require("../../../services/license-verifier");
jest.mock("../../../services/license-verifier");
describe("MetricsCalculator", () => {
    let metricsCalculator;
    let mockLicenseVerifier;
    beforeEach(() => {
        mockLicenseVerifier = new license_verifier_1.LicenseVerifier();
        mockLicenseVerifier.verifyLicense.mockResolvedValue(true);
        metricsCalculator = new metrics_calculator_1.MetricsCalculator(mockLicenseVerifier);
    });
    describe("calculateMetrics", () => {
        it("should calculate metrics for provided GitHub data", () => __awaiter(void 0, void 0, void 0, function* () {
            // Mocking calculate methods
            metricsCalculator.calculateBusFactor = jest.fn().mockResolvedValue(0.25);
            metricsCalculator.calculateCorrectness = jest.fn().mockResolvedValue(0.50);
            metricsCalculator.calculateRampUp = jest.fn().mockResolvedValue(0.75);
            metricsCalculator.calculateResponsiveMaintainer = jest.fn().mockResolvedValue(0.15);
            metricsCalculator.calculateNetScore = jest.fn().mockResolvedValue(0.60);
            const mockData = [
                {
                    busFactorData: { contributorCommits: new Map([["user1", 50], ["user2", 50]]) },
                    correctnessData: {},
                    rampUpData: {},
                    responsiveMaintainerData: { averageTimeInMillis: 1000, closedIssuesExist: true }
                }
            ];
            const urlsPromise = Promise.resolve(["https://github.com/mockOwner/mockRepo"]);
            const result = yield metricsCalculator.calculateMetrics(urlsPromise, mockData);
            expect(result).toEqual([
                {
                    URL: "https://github.com/mockOwner/mockRepo",
                    BUS_FACTOR_SCORE: 0.25,
                    CORRECTNESS_SCORE: 0.50,
                    RAMP_UP_SCORE: 0.75,
                    RESPONSIVE_MAINTAINER_SCORE: 0.15,
                    LICENSE_SCORE: true,
                    NET_SCORE: 0.60
                }
            ]);
        }));
    });
    describe("calculateBusFactor", () => {
        it("should calculate for 2 contributors with equal commits", () => __awaiter(void 0, void 0, void 0, function* () {
            const busFactorData = { contributorCommits: new Map([["user1", 50], ["user2", 50]]) };
            const result = yield metricsCalculator.calculateBusFactor(busFactorData);
            expect(result).toBeCloseTo(0.5);
        }));
        it("should calculate for 3 contributors with varied commits", () => __awaiter(void 0, void 0, void 0, function* () {
            const busFactorData = { contributorCommits: new Map([["user1", 20], ["user2", 30], ["user3", 50]]) };
            const result = yield metricsCalculator.calculateBusFactor(busFactorData);
            expect(result).toBeCloseTo(0.33);
        }));
        it("should throw error for undefined contributorCommits", () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(metricsCalculator.calculateBusFactor({}))
                .rejects.toThrow("busFactorData or contributorCommits is undefined");
        }));
    });
    describe("calculateResponsiveMaintainer", () => {
        it("should calculate for averageTimeInMillis = 1000 and closedIssuesExist = true", () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock average time in milliseconds (15 days)
            const responsiveMaintainerData = { averageTimeInMillis: 1296000000, closedIssuesExist: true };
            const result = yield metricsCalculator.calculateResponsiveMaintainer(responsiveMaintainerData);
            expect(result).toBeCloseTo(Math.exp(-0.5));
        }));
    });
    describe("calculateCorrectness", () => {
        it("should calculate for more closed issues (than open issues) and more closed/merged requests (than open requests)", () => __awaiter(void 0, void 0, void 0, function* () {
            const correctnessData = { openIssues: 24, closedIssues: 58, openRequests: 88, closedRequests: 91, mergedRequests: 122 };
            const result = yield metricsCalculator.calculateCorrectness(correctnessData);
            expect(result).toEqual(0.8);
        }));
        it("should calculate for more open issues (than closed issues) and more open requests (than closed/merged requests)", () => __awaiter(void 0, void 0, void 0, function* () {
            const correctnessData = { openIssues: 101, closedIssues: 56, openRequests: 88, closedRequests: 22, mergedRequests: 40 };
            const result = yield metricsCalculator.calculateCorrectness(correctnessData);
            expect(result).toEqual(0.5);
        }));
        it("should calculate for more closed issues (than open issues) and more open requests (than closed/merged requests)", () => __awaiter(void 0, void 0, void 0, function* () {
            const correctnessData = { openIssues: 4, closedIssues: 13, openRequests: 42, closedRequests: 10, mergedRequests: 12 };
            const result = yield metricsCalculator.calculateCorrectness(correctnessData);
            expect(result).toEqual(0.7);
        }));
        it("should calculate for 0 issues (open and closed) and 0 requests (open, closed, and merged)", () => __awaiter(void 0, void 0, void 0, function* () {
            const correctnessData = { openIssues: 0, closedIssues: 0, openRequests: 0, closedRequests: 0, mergedRequests: 0 };
            const result = yield metricsCalculator.calculateCorrectness(correctnessData);
            expect(result).toEqual(1);
        }));
    });
    //Ramp Up Calculation Testing
    describe("calculateRampUp", () => {
        it("should calculate RampUpScore for a repository with a short README and close commit and update", () => __awaiter(void 0, void 0, void 0, function* () {
            const rampUpData = {
                readmeLength: 500,
                lastUpdated: new Date("2023-09-01"),
                lastCommit: new Date("2023-09-01"), // Recent commit
            };
            const result = yield metricsCalculator.calculateRampUp(rampUpData);
            expect(result).toBeCloseTo(0.75); // Gets Partial Readme Points, and Full Commit/Update Closeness
        }));
        it("should calculate RampUpScore for a repository with a long README and very far apart commit and update", () => __awaiter(void 0, void 0, void 0, function* () {
            const rampUpData = {
                readmeLength: 1500,
                lastUpdated: new Date("2023-08-01"),
                lastCommit: new Date("2022-08-01"), // Older commit
            };
            const result = yield metricsCalculator.calculateRampUp(rampUpData);
            expect(result).toBeCloseTo(0.5); // Gets Full Readme Points, but No Commit/Update Closeness 
        }));
        it("should calculate RampUpScore for a repository with missing README", () => __awaiter(void 0, void 0, void 0, function* () {
            const rampUpData = {
                readmeLength: 0,
                lastUpdated: new Date("2023-09-01"),
                lastCommit: new Date("2023-09-01"), // Recent commit
            };
            const result = yield metricsCalculator.calculateRampUp(rampUpData);
            expect(result).toBe(0); // No README, so score should be 0
        }));
    });
    //Netscore Testing
    describe("calculateNetScore", () => {
        it("should calculate NetScore when all metrics have high values and a license is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield metricsCalculator.calculateNetScore(0.9, 0.9, 0.9, 0.9, true);
            expect(result).toBeCloseTo(0.9); // Adjust expected score as needed
        }));
        it("should calculate NetScore when all metrics have low values and a license is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield metricsCalculator.calculateNetScore(0.1, 0.1, 0.1, 0.1, true);
            expect(result).toBeCloseTo(0.1); // Adjust expected score as needed
        }));
        it("should calculate NetScore when some metrics have high values and some have low values, and a license is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield metricsCalculator.calculateNetScore(0.5, 0.7, 0.3, 0.6, true);
            expect(result).toBeCloseTo(0.528); // Adjust expected score as needed
        }));
        -it("should calculate NetScore when all metrics have high values but no license is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield metricsCalculator.calculateNetScore(0.9, 0.9, 0.9, 0.9, false);
            expect(result).toBe(0); // No license, so score should be 0
        }));
        it("should calculate NetScore when all metrics have low values and no license is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield metricsCalculator.calculateNetScore(0.1, 0.1, 0.1, 0.1, false);
            expect(result).toBe(0); // No license, so score should be 0
        }));
    });
});
//# sourceMappingURL=metrics-calculator.test.js.map
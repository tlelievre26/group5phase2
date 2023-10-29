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
/* eslint-disable @typescript-eslint/no-explicit-any */
require("reflect-metadata");
const graphql_1 = require("@octokit/graphql");
const metrics_data_retriever_1 = require("../../../services/metrics-data-retriever");
jest.mock("@octokit/graphql");
describe("MetricsDataRetriever", () => {
    const mockToken = "GITHUB_TOKEN";
    let dataRetriever;
    beforeEach(() => {
        graphql_1.graphql.defaults.mockReturnValue(jest.fn());
        dataRetriever = new metrics_data_retriever_1.MetricsDataRetriever(mockToken);
    });
    // TODO: Add tests for error cases
    describe("retrieveMetricsData", () => {
        it("should retrieve data for each provided GitHub URL", () => __awaiter(void 0, void 0, void 0, function* () {
            // Mocking fetch methods
            dataRetriever.fetchBusFactorData = jest.fn().mockResolvedValue("busFactorDataMock");
            dataRetriever.fetchRampUpData = jest.fn().mockResolvedValue("rampUpDataMock");
            dataRetriever.fetchCorrectnessData = jest.fn().mockResolvedValue("correctnessDataMock");
            dataRetriever.fetchResponsiveMaintainerData = jest.fn().mockResolvedValue("responsiveMaintainerDataMock");
            const result = yield dataRetriever.retrieveMetricsData(Promise.resolve(["https://github.com/mockOwner/mockRepo"]));
            expect(result).toEqual([
                {
                    url: "https://github.com/mockOwner/mockRepo",
                    busFactorData: "busFactorDataMock",
                    rampUpData: "rampUpDataMock",
                    correctnessData: "correctnessDataMock",
                    responsiveMaintainerData: "responsiveMaintainerDataMock"
                }
            ]);
        }));
    });
    describe("fetchBusFactorData", () => {
        it("should fetch bus factor data correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sample mock data for the graphql query
            const mockGraphqlResponse = {
                repository: {
                    defaultBranchRef: {
                        target: {
                            history: {
                                edges: [
                                    { node: { author: { user: { login: "user1" } } } },
                                    { node: { author: { user: { login: "user1" } } } },
                                    { node: { author: { user: { login: "user2" } } } },
                                    { node: { author: null } } // Add case for an edge without a user
                                ]
                            }
                        }
                    }
                }
            };
            dataRetriever.graphqlWithAuth.mockResolvedValueOnce(mockGraphqlResponse);
            const expectedOutput = {
                repo: "mockRepo",
                contributorCommits: new Map([
                    ["user1", 2],
                    ["user2", 1] // user2 made 1 commit
                ])
            };
            const result = yield dataRetriever.fetchBusFactorData("mockOwner", "mockRepo");
            expect(result.repo).toEqual(expectedOutput.repo);
            expect([...result.contributorCommits.entries()])
                .toEqual([...expectedOutput.contributorCommits.entries()]);
        }));
    });
    describe("fetchCorrectnessData", () => {
        it("should fetch correctness data correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sample mock data for the GraphQl query
            const mockGraphqlResponse = {
                repository: {
                    openIssues: { totalCount: 200 },
                    closedIssues: { totalCount: 436 },
                    openRequests: { totalCount: 177 },
                    closedRequests: { totalCount: 245 },
                    mergedRequests: { totalCount: 304 }
                }
            };
            dataRetriever.graphqlWithAuth.mockResolvedValueOnce(mockGraphqlResponse);
            // Define expected output
            const expectedOutput = {
                openIssues: 200,
                closedIssues: 436,
                openRequests: 177,
                closedRequests: 245,
                mergedRequests: 304
            };
            // Call fetchCorrectnessData method with mock arguments
            const result = yield dataRetriever.fetchCorrectnessData("mockOwner", "mockRepo");
            // Assert that returned results match the expected output
            expect(result.openIssues).toEqual(expectedOutput.openIssues);
            expect(result.closedIssues).toEqual(expectedOutput.closedIssues);
            expect(result.openRequests).toEqual(expectedOutput.openRequests);
            expect(result.closedRequests).toEqual(expectedOutput.closedRequests);
            expect(result.mergedRequests).toEqual(expectedOutput.mergedRequests);
        }));
    });
    //Unit Test for fetchRampUpData
    describe("fetchRampUpData", () => {
        it("should fetch ramp-up data correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sample mock data for the graphql query
            const mockGraphqlResponse = {
                repository: {
                    updatedAt: "2023-09-15T12:00:00Z",
                    object: {
                        text: "Sample README content" // Sample README Content
                    },
                    defaultBranchRef: {
                        target: {
                            history: {
                                edges: [
                                    { node: { committedDate: "2023-09-16T12:00:00Z" } },
                                    { node: { committedDate: "2023-09-15T12:00:00Z" } },
                                ]
                            }
                        }
                    }
                }
            };
            // Mock the graphqlWithAuth function to return the mock response
            dataRetriever.graphqlWithAuth.mockResolvedValueOnce(mockGraphqlResponse);
            // Define the expected output based on the mock data
            const expectedOutput = {
                repo: "mockRepo",
                readmeContent: "Sample README content",
                readmeLength: 21,
                lastUpdated: "2023-09-15T12:00:00Z",
                lastCommit: "2023-09-16T12:00:00Z" // Sample Expected Last Commit
            };
            // Call the fetchRampUpData method with sample arguments
            const result = yield dataRetriever.fetchRampUpData("mockOwner", "mockRepo");
            // Assert that the result matches the expected output
            expect(result.repo).toEqual(expectedOutput.repo);
            expect(result.readmeContent).toEqual(expectedOutput.readmeContent);
            expect(result.readmeLength).toEqual(expectedOutput.readmeLength);
            expect(result.lastUpdated).toEqual(expectedOutput.lastUpdated);
            expect(result.lastCommit).toEqual(expectedOutput.lastCommit);
        }));
    });
    describe("fetchResponsiveMaintainerData", () => {
        it("should fetch responsive maintainer data correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            // Sample mock data for the GraphQL query
            const mockGraphqlResponse = {
                repository: {
                    issues: {
                        edges: [
                            { node: { createdAt: "2022-01-01T00:00:00Z", closedAt: "2022-01-02T00:00:00Z" } },
                            { node: { createdAt: "2022-01-02T00:00:00Z", closedAt: "2022-01-03T00:00:00Z" } },
                            { node: { createdAt: "2022-01-03T00:00:00Z", closedAt: null } } // Open issue
                        ]
                    }
                }
            };
            dataRetriever.graphqlWithAuth.mockResolvedValueOnce(mockGraphqlResponse);
            // Expected output: average time to close an issue should be 24 hours (in milliseconds)
            const expectedOutput = {
                averageTimeInMillis: 24 * 60 * 60 * 1000,
                closedIssuesExist: true
            };
            const result = yield dataRetriever.fetchResponsiveMaintainerData("mockOwner", "mockRepo");
            expect(result).toEqual(expectedOutput);
        }));
    });
});
//# sourceMappingURL=metrics-data-retriever.test.js.map
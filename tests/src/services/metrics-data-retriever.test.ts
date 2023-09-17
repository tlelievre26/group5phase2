import "reflect-metadata";
import { graphql } from "@octokit/graphql";

import { MetricsDataRetriever } from "../../../src/services/metrics-data-retriever";


jest.mock("@octokit/graphql");


describe("MetricsDataRetriever", () => {

    const mockToken = "GITHUB_TOKEN";
    let dataRetriever: MetricsDataRetriever;

    beforeEach(() => {
        (graphql.defaults as jest.Mock).mockReturnValue(jest.fn());
        dataRetriever = new MetricsDataRetriever(mockToken);
    });


    // TODO: Add tests for error cases
    describe("retrieveMetricsData", () => {
        it("should retrieve data for each provided GitHub URL", async () => {
            // Mocking fetch methods
            dataRetriever.fetchBusFactorData = jest.fn().mockResolvedValue("busFactorDataMock");
            dataRetriever.fetchRampUpData = jest.fn().mockResolvedValue("rampUpDataMock");
            dataRetriever.fetchCorrectnessData = jest.fn().mockResolvedValue("correctnessDataMock");
            dataRetriever.fetchResponsiveMaintainerData = jest.fn().mockResolvedValue("responsiveMaintainerDataMock");

            const result = await dataRetriever.retrieveMetricsData(Promise.resolve(["https://github.com/mockOwner/mockRepo"]));

            expect(result).toEqual([
                {
                    url: "https://github.com/mockOwner/mockRepo",
                    busFactorData: "busFactorDataMock",
                    rampUpData: "rampUpDataMock",
                    correctnessData: "correctnessDataMock",
                    responsiveMaintainerData: "responsiveMaintainerDataMock"
                }
            ]);
        });
    });


    describe("fetchBusFactorData", () => {
        it("should fetch bus factor data correctly", async () => {
            // Sample mock data for the graphql query
            const mockGraphqlResponse = {
                repository: {
                    defaultBranchRef: {
                        target: {
                            history: {
                                edges: [
                                    {node: {author: {user: {login: "user1"}}}},
                                    {node: {author: {user: {login: "user1"}}}},
                                    {node: {author: {user: {login: "user2"}}}},
                                    {node: {author: null}} // Add case for an edge without a user
                                ]
                            }
                        }
                    }
                }
            };

            (dataRetriever as any).graphqlWithAuth.mockResolvedValueOnce(mockGraphqlResponse);

            const expectedOutput = {
                repo: "mockRepo",
                contributorCommits: new Map([
                    ["user1", 2], // user1 made 2 commits
                    ["user2", 1]  // user2 made 1 commit
                ])
            };

            const result = await dataRetriever.fetchBusFactorData("mockOwner", "mockRepo");

            expect(result.repo).toEqual(expectedOutput.repo);
            expect([...result.contributorCommits.entries()])
                .toEqual([...expectedOutput.contributorCommits.entries()]);
        });
    });


    // TODO: Add unit tests for fetchRampUpData, fetchCorrectnessData, fetchResponsiveMaintainerData


    describe("fetchResponsiveMaintainerData", () => {
        it("should fetch responsive maintainer data correctly", async () => {
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

            (dataRetriever as any).graphqlWithAuth.mockResolvedValueOnce(mockGraphqlResponse);

            // Expected output: average time to close an issue should be 24 hours (in milliseconds)
            const expectedOutput = {
                averageTimeInMillis: 24 * 60 * 60 * 1000,  // 24 hours in milliseconds
                closedIssuesExist: true
            };

            const result = await dataRetriever.fetchResponsiveMaintainerData("mockOwner", "mockRepo");

            expect(result).toEqual(expectedOutput);
        });
    });
});
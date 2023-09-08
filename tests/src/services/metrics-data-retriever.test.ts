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

            const result = await dataRetriever.retrieveMetricsData(["https://github.com/mockOwner/mockRepo"]);

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
                contributorCommitFrequency: new Map([
                    ["user1", 2], // user1 made 2 commits
                    ["user2", 1]  // user2 made 1 commit
                ])
            };

            const result = await dataRetriever.fetchBusFactorData("mockOwner", "mockRepo");

            expect(result.repo).toEqual(expectedOutput.repo);
            expect([...result.contributorCommitFrequency.entries()])
                .toEqual([...expectedOutput.contributorCommitFrequency.entries()]);
        });
    });


    // TODO: Add unit tests for fetchRampUpData, fetchCorrectnessData, fetchResponsiveMaintainerData
});
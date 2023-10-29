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
exports.MetricsDataRetriever = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const tsyringe_1 = require("tsyringe");
const graphql_1 = require("@octokit/graphql");
const parseURL_1 = require("./parseURL");
const logger_1 = __importDefault(require("../../../utils/logger"));
let MetricsDataRetriever = class MetricsDataRetriever {
    /**
     * Creates a new instance of the MetricsDataRetriever class.
     *
     * @param token
     */
    constructor(token) {
        this.GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
        this.graphqlWithAuth = graphql_1.graphql.defaults({
            headers: {
                authorization: `token ${token}`
            }
        });
    }
    /**
     * Retrieves metrics data for a list of GitHub URLs.
     *
     * TODO:
     *   - Implement retries
     *
     * @param urls List of GitHub repository URLs.
     */
    retrieveMetricsData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract owner and repo from GitHub URL
                const { owner, repo } = yield (0, parseURL_1.extractGitHubInfo)(url);
                const busFactorData = yield this.fetchBusFactorData(owner, repo);
                const rampUpData = yield this.fetchRampUpData(owner, repo);
                const correctnessData = yield this.fetchCorrectnessData(owner, repo);
                const responsiveMaintainerData = yield this.fetchResponsiveMaintainerData(owner, repo);
                //Note we do NOT include pinning data here, as its obtained by parsing the package.json from a local clone
                const pullRequestData = yield this.fetchPullRequestData(owner, repo);
                return {
                    url,
                    busFactorData,
                    rampUpData,
                    correctnessData,
                    responsiveMaintainerData,
                    pullRequestData
                };
            }
            catch (error) {
                logger_1.default.error(`Error retrieving metrics data for URL ${url}:`, error);
                throw error;
            }
        });
    }
    /**
     * Fetches bus factor data for a GitHub repository.
     *
     *
     * @param owner The owner of the repository.
     * @param repo The name of the repository.
     */
    fetchBusFactorData(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get date one year ago
            const currentDate = new Date();
            const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)).toISOString();
            // Query GitHub API for contributors in the last year
            const query = `
        {
          repository(owner: "${owner}", name: "${repo}") {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(since: "${oneYearAgo}") {
                    totalCount
                    edges {
                      node {
                        author {
                          user {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
            const { repository } = yield this.graphqlWithAuth(query);
            // Count the number of commits for each unique contributor using a map
            const contributorCommits = new Map();
            repository.defaultBranchRef.target.history.edges.forEach((edge) => {
                var _a;
                // Check author is not null before adding contributor to map
                if ((_a = edge.node.author) === null || _a === void 0 ? void 0 : _a.user) {
                    const contributor = edge.node.author.user.login;
                    // Increment commit count for contributor
                    contributorCommits.set(contributor, (contributorCommits.get(contributor) || 0) + 1);
                }
            });
            return {
                repo: repo,
                contributorCommits: contributorCommits
            };
        });
    }
    /**
     * Fetches correctness data for a GitHub repository.
     *
     * @param owner
     * @param repo
     */
    fetchCorrectnessData(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Query GitHub API for issues and pull requests
            const query = `{
        repository(owner: "${owner}", name: "${repo}") {
          openIssues: issues(states: OPEN) {
            totalCount
          }
          closedIssues: issues(states: CLOSED) {
            totalCount
          },
          openRequests: pullRequests(states: OPEN) {
            totalCount
          },
          closedRequests: pullRequests(states: CLOSED) {
            totalCount
          },
          mergedRequests: pullRequests(states: MERGED) {
            totalCount
          }
        }
      }`;
            const { repository } = yield this.graphqlWithAuth(query);
            // Check if repository is defined
            if (repository) {
                // Get total counts for issues
                const openIssues = repository.openIssues.totalCount;
                const closedIssues = repository.closedIssues.totalCount;
                // Get total counts for pull requests
                const openRequests = repository.openRequests.totalCount;
                const closedRequests = repository.closedRequests.totalCount;
                const mergedRequests = repository.mergedRequests.totalCount;
                return {
                    openIssues: openIssues,
                    closedIssues: closedIssues,
                    openRequests: openRequests,
                    closedRequests: closedRequests,
                    mergedRequests: mergedRequests
                };
            }
            else {
                return null;
            }
        });
    }
    /**
     * Fetches ramp up data for a GitHub repository.
     *
     * @param owner The owner of the repository.
     * @param repo The name of the repository.
     */
    fetchRampUpData(owner, repo) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            //Queries Github for Readme and Last Version Date
            const query = `
        {
        repository(owner: "${owner}", name: "${repo}") {
            updatedAt
            object(expression: "master:README.md") {
              ... on Blob {
                text
              }
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    edges {
                      node {
                        committedDate
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `;
            const { repository } = yield this.graphqlWithAuth(query);
            //Checks if Readme Exists and when it was Last Updated
            let readmeContent = "";
            let readmeLength = 0;
            let lastUpdated = "";
            if ((_a = repository === null || repository === void 0 ? void 0 : repository.object) === null || _a === void 0 ? void 0 : _a.text) {
                readmeContent = repository.object.text;
                readmeLength = readmeContent.length;
                lastUpdated = repository.updatedAt;
            }
            //The Last Version Commit of the Project or NULL
            const lastCommit = ((_d = (_c = (_b = repository.defaultBranchRef) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.history.edges[0]) === null || _d === void 0 ? void 0 : _d.node.committedDate) || null;
            return {
                repo: repo,
                readmeContent: readmeContent,
                readmeLength: readmeLength,
                lastUpdated: lastUpdated,
                lastCommit: lastCommit
            };
        });
    }
    fetchResponsiveMaintainerData(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Query for the last 100 issues of the repository and their creation and closure dates
            const query = `
      {
          repository(owner: "${owner}", name: "${repo}") {
            issues(last: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
              edges {
                node {
                  id
                  title
                  createdAt
                  closedAt
                }
              }
            }
          }
        }
      `;
            const response = yield this.graphqlWithAuth(query);
            const issues = response.repository.issues.edges;
            // Initialize an array to store the time taken for each closed issue
            const timeTakenForIssues = [];
            issues.forEach((issue) => {
                if (issue.node.closedAt) {
                    const createdAt = new Date(issue.node.createdAt).getTime();
                    const closedAt = new Date(issue.node.closedAt).getTime();
                    const timeTaken = closedAt - createdAt;
                    timeTakenForIssues.push(timeTaken);
                }
            });
            // If no issues have been closed in the repository, return null and set flag to false
            if (timeTakenForIssues.length === 0) {
                return {
                    averageTimeInMillis: null,
                    closedIssuesExist: false
                };
            }
            // Calculate total time for issues to be closed in milliseconds
            const totalMillis = timeTakenForIssues.reduce((acc, time) => acc + time, 0);
            // Return average time in milliseconds
            return {
                averageTimeInMillis: totalMillis / timeTakenForIssues.length,
                closedIssuesExist: true
            };
        });
    }
    fetchPullRequestData(owner, repo) {
        return __awaiter(this, void 0, void 0, function* () {
            //TO IMPLEMENT:
            //GitHub API calls within this function that get relevant data for pull requests metric
            return null;
        });
    }
};
exports.MetricsDataRetriever = MetricsDataRetriever;
exports.MetricsDataRetriever = MetricsDataRetriever = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [String])
], MetricsDataRetriever);
//# sourceMappingURL=metrics-data-retriever.js.map
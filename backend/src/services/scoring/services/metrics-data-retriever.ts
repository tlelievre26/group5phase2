/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from "tsyringe";
import { graphql } from "@octokit/graphql";

import { extractGitHubInfo } from "./parseURL";
import logger from "../../../utils/logger";


@injectable()
export class MetricsDataRetriever {

  private GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
  private graphqlWithAuth: any;


  /**
   * Creates a new instance of the MetricsDataRetriever class.
   *
   * @param token
   */
  constructor(token: string) {
    this.graphqlWithAuth = graphql.defaults({
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
  async retrieveMetricsData(owner: string, repo: string): Promise<any> {
    try {
      // Extract owner and repo from GitHub URL
      const busFactorData = await this.fetchBusFactorData(owner, repo);
      const rampUpData = await this.fetchRampUpData(owner, repo);
      const correctnessData = await this.fetchCorrectnessData(owner, repo);
      const responsiveMaintainerData = await this.fetchResponsiveMaintainerData(owner, repo);

      //Note we do NOT include pinning data here, as its obtained by parsing the package.json from a local clone
      const pullRequestData = await this.fetchPullRequestData(owner, repo);

      return {
        repo,
        busFactorData,
        rampUpData,
        correctnessData,
        responsiveMaintainerData,
        pullRequestData
      };
    } catch (error) {
      logger.error(`Error retrieving metrics data for repo ${repo}:`, error);
      throw error;
    }
  }


  /**
   * Fetches bus factor data for a GitHub repository.
   *
   *
   * @param owner The owner of the repository.
   * @param repo The name of the repository.
   */
  async fetchBusFactorData(owner: string, repo: string): Promise<any> {

        // Get date one year ago

        const contributorCommits = new Map();
        // Query GitHub API for contributors in the last year

        let cursor = null
        let query;
        //Get the last 500 commits
        for(let i = 0; i < 5; i++) {
  
          if(cursor == null) {
            query = `
            {
              repository(owner: "${owner}", name: "${repo}") {
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history {
                        totalCount
                        edges {
                          node {
                            author {
                              user {
                                login
                              }
                            }
                          }
                          cursor
                        }
                      }
                    }
                  }
                }
              }
            }
            `;
          }
        
        else {
          query = `
          {
            repository(owner: "${owner}", name: "${repo}") {
              defaultBranchRef {
                target {
                  ... on Commit {
                    history (first: 100 after: "${cursor}") {
                      totalCount
                      edges {
                        node {
                          author {
                            user {
                              login
                            }
                          }
                        }
                        cursor
                      }
                    }
                  }
                }
              }
            }
          }
          `;
        }
        const {repository} = await this.graphqlWithAuth(query);

        // Count the number of commits for each unique contributor using a map

        let count = 0; //Used to track the amount of commits to return in order to break early if its less than 100

        repository.defaultBranchRef.target.history.edges.forEach((edge: { node: { author: { user: { login: string; }; }; }, cursor: string }) => {
            // Check author is not null before adding contributor to map
            if (edge.node.author?.user) {
                const contributor = edge.node.author.user.login;
                // Increment commit count for contributor
                contributorCommits.set(contributor, (contributorCommits.get(contributor) || 0) + 1);
            }
            cursor = edge.cursor //Need to constantly update cursor before the next query
            count++
        });
        if(count < 100) {
          logger.debug("Less than 100 commits returned, breaking early")
          break;
        }
      }



    return {
      repo: repo,
      contributorCommits: contributorCommits
    };
  }


  /**
   * Fetches correctness data for a GitHub repository.
   *
   * @param owner
   * @param repo
   */
  async fetchCorrectnessData(owner: string, repo: string): Promise<any> {
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

    const { repository } = await this.graphqlWithAuth(query);

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
    } else {
      return null;
    }
  }


  /**
   * Fetches ramp up data for a GitHub repository.
   *
   * @param owner The owner of the repository.
   * @param repo The name of the repository.
   */
  async fetchRampUpData(owner: string, repo: string): Promise<any> {

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

    const { repository } = await this.graphqlWithAuth(query);

    //Checks if Readme Exists and when it was Last Updated
    let readmeContent = "";
    let readmeLength = 0;
    let lastUpdated = "";

    if (repository?.object?.text) {
      readmeContent = repository.object.text;
      readmeLength = readmeContent.length;
      lastUpdated = repository.updatedAt;
    }
    //The Last Version Commit of the Project or NULL
    const lastCommit = repository.defaultBranchRef?.target?.history.edges[0]?.node.committedDate || null;

    return {
      repo: repo,
      readmeContent: readmeContent,
      readmeLength: readmeLength,
      lastUpdated: lastUpdated,
      lastCommit: lastCommit
    };
  }


  async fetchResponsiveMaintainerData(owner: string, repo: string): Promise<any> {

      //This rly doesn't work very well but its good enough for now
        // Query for the last 100 issues of the repository and their creation and closure dates
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1)).toISOString();

        const query = `
      {
          repository(owner: "${owner}", name: "${repo}") {
            issues(first: 50 states: CLOSED, orderBy: {field: CREATED_AT, direction: DESC}) {
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

    const response = await this.graphqlWithAuth(query);

    const issues = response.repository.issues.edges;

        // Initialize an array to store the time taken for each closed issue
        var timeTakenForIssues: number[] = [];

        issues.forEach((issue: any) => {
            if (issue.node.closedAt) {
                const createdAt = new Date(issue.node.createdAt).getTime();

                const closedAt = new Date(issue.node.closedAt).getTime();
                const timeTaken = closedAt - createdAt;
                timeTakenForIssues.push(timeTaken);
                //logger.debug("Issue created at: " + new Date(createdAt).toLocaleDateString() + " and closed at: " + new Date(issue.node.closedAt).toLocaleDateString() + ", total response time in days: " + timeTaken/ (24 * 60 * 60 * 1000))
            }

        });

        // If no issues have been closed in the repository, return null and set flag to false

        if (timeTakenForIssues.length === 0) {
          return {
              averageTimeInMillis: null,
              closedIssuesExist: false
          };
      }

        timeTakenForIssues.sort((a, b) => a - b);
        //console.log(timeTakenForIssues)
        
        //Remove exceptional outliers in the returned issues
        if(timeTakenForIssues.length > 3) {
          timeTakenForIssues = timeTakenForIssues.slice(Math.floor(timeTakenForIssues.length / 5), Math.floor(timeTakenForIssues.length * 4 / 5));
        }


        const totalMillis = timeTakenForIssues.reduce((acc, time) => acc + time, 0);

    // Return average time in milliseconds
    return {
      averageTimeInMillis: totalMillis / timeTakenForIssues.length,
      closedIssuesExist: true
    };
  }

  /**
   * Fetches pull review data from Github.
   *
   *
   * @param owner The owner of the repository.
   * @param repo The name of the repository.
   */

  //TO IMPLEMENT:
  //GitHub API calls within this function that get relevant data for pull requests metric
  //return null

  async fetchPullRequestData(owner: string, repo: string): Promise<any> {
    try {
      const repo_data_query = `
          {
            repository(owner: "${owner}", name: "${repo}") {
              defaultBranchRef {
                name
                target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
                }
              }
            }
          }`
      // console.log(repo_data_query)
      const { repository } = await this.graphqlWithAuth(repo_data_query);
      // console.log(repository)
      const default_branch = repository.defaultBranchRef?.name;
      const num_commits = repository.defaultBranchRef?.target.history.totalCount;

      const pull_requests = [];
      let hasNextPage = true;
      let endCursor: string | null = null;
      let pull_req_query: string;
      while (hasNextPage) {
        if (endCursor == null) {
          pull_req_query = `
              {
                repository(owner: "${owner}", name: "${repo}") {
                  pullRequests(baseRefName: "${default_branch}" states: [MERGED] first: 100) {
                    nodes {
                      commits {
                        totalCount
                      }
                      reviews (first: 1) {
                        totalCount
                        }
                      }
                      pageInfo {
                        hasNextPage
                        endCursor
                      }
                    }
                  }
              }
            `;
        }
        else {
          pull_req_query = `
            {
              repository(owner: "${owner}", name: "${repo}") {
                pullRequests(baseRefName: "${default_branch}" states: [MERGED] first: 100 after: "${endCursor}") {
                  nodes {
                    commits {
                      totalCount
                    }
                    reviews (first: 1) {
                      totalCount
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
            }
          `;
        }
        //console.log(pull_req_query)
        const { repository } = await this.graphqlWithAuth(pull_req_query);
        const pull_req_data = repository.pullRequests;
        if (pull_req_data?.nodes) {
          for (const pr of pull_req_data.nodes) {
            pull_requests.push(pr);
          }
        }

        hasNextPage = pull_req_data.pageInfo.hasNextPage || false;
        endCursor = pull_req_data.pageInfo.endCursor || null;
      }

      return { pull_requests, num_commits }
    } catch (error) {
      console.error("Pull request data error: ", error);
      throw error;
    }
  }

  async fetchReviewComments(pullRequestId: string): Promise<any> {
    try {
      const query = `
            {
              node(id: "${pullRequestId}") {
                ... on PullRequest {
                  reviews(last: 1) {
                    nodes {
                      comments(last: 10) {
                        nodes {
                          body
                          author {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

      const { node } = await this.graphqlWithAuth(query);

      return node.reviews.nodes[0].comments.nodes || [];
    } catch (error) {
      console.error(`Error fetching review comments for pull request ${pullRequestId}`, error);
      throw error;
    }
  }


  // async extractGitHubInfo(url: string): Promise<RepoIdentifier> {
  //     const urlMatch = url.match(this.GITHUB_URL_REGEX);
  //     if (!urlMatch) {
  //         throw new Error(`Invalid GitHub URL: ${url}`);
  //     }
  //     const {1: owner, 2: repo} = urlMatch;
  //     return {owner, repo};
  // }

  //Moved this to its own file, other things want to call this outside this class
}
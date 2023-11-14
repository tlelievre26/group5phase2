import { graphql } from "@octokit/graphql";
import * as dotenv from 'dotenv';
dotenv.config();

interface RepositoryObject {
  text: string;
}

interface RepositoryResponse {
  repository: {
    object: RepositoryObject;
  };
}

const octokit = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

async function processDependencies(owner: string, repo: string, filename: string): Promise<number> {
  try {
    //fetching content of the github repo 
    const query = `
      query($owner: String!, $repo: String!, $filename: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: $filename) {
            ... on Blob {
              text
            }
          }
        }
      }
    `;
    
    //holding data from query 
    const response = await octokit<RepositoryResponse>(query, {
      owner,
      repo,
      filename,
    });

    const content = response.repository.object.text;
    const packageJson = JSON.parse(content);
    const dependencies = packageJson.dependencies;

    let notPinned = 0;
    let pinned = 0;
    //iterating dependencies 
    for (const [dependencyName, version] of Object.entries(dependencies)) {
      const versionJSON = JSON.parse(JSON.stringify(version));
      const [major, med, minor] = versionJSON.toString().split('.');
      const finder = versionJSON.toString().indexOf("-");
      const carrot = versionJSON.toString().indexOf("^");

      // Check if version in acceptable format
      if ((med == undefined && minor == undefined) || finder != -1 || (carrot != -1 && major != undefined)) {
        notPinned++;
      } else {
        pinned++;
      }
    }

    const numberOfDependencies = Object.keys(dependencies).length;

    if (numberOfDependencies === 0) {
      return filename === "package.json" ? 1.0 : 0.0;
    }

    return pinned / numberOfDependencies;
  } catch (error) {
    // Log or handle the error appropriately
    console.error(`Error processing ${filename}`);
    return -1;
  }
}

//wraps for exporting, probably need to structure this another way with phase 1
export async function dependency(owner: string, repo: string): Promise<number> {
  const jsonResult = await processDependencies(owner, repo, "package.json");
  if (jsonResult !== -1) {
    return jsonResult;
  }

  // If package.json processing failed, try package-lock.json
  return processDependencies(owner, repo, "package-lock.json");
}
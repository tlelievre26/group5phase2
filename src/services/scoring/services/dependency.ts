import { Octokit } from "@octokit/rest";
import * as dotenv from 'dotenv';
dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  version: "latest",
});

async function processDependencies(owner: string, repo: string, filename: string): Promise<number> {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filename,
    });

    const responseJSON = JSON.parse(JSON.stringify(response.data));
    const packageJson = JSON.parse(Buffer.from(responseJSON.content, 'base64').toString('utf8'));
    const dependencies = packageJson.dependencies;

    let notPinned = 0;
    let pinned = 0;

    for (const [dependencyName, version] of Object.entries(dependencies)) {
      const versionJSON = JSON.parse(JSON.stringify(version));
      const [large, med, small] = versionJSON.toString().split('.');
      const finder = versionJSON.toString().indexOf("-");
      const carrot = versionJSON.toString().indexOf("^");

      // Check if the version is in an acceptable format
      if ((med == undefined && small == undefined) || finder != -1 || (carrot != -1 && large != undefined)) {
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

export async function dependency(owner: string, repo: string): Promise<number> {
  const jsonResult = await processDependencies(owner, repo, "package.json");
  if (jsonResult !== -1) {
    return jsonResult;
  }

  // If package.json processing failed, try package-lock.json
  return processDependencies(owner, repo, "package-lock.json");
}
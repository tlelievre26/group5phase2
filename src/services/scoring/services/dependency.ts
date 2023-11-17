import { injectable } from "tsyringe";
import { graphql } from "@octokit/graphql";
import * as dotenv from 'dotenv';
import { ExtractedMetadata } from "../../../models/other_schemas";
dotenv.config();

@injectable()
export class RepositoryProcessor {
  private octokit;

  constructor() {
    this.octokit = graphql.defaults({
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
  }

  private async fetchData(owner: string, repo: string, filename: string): Promise<string> {
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

    const response = await this.octokit<{ repository: { object: { text: string } } }>(query, {
      owner,
      repo,
      filename,
    });

    return response.repository.object.text;
  }

  public async processDependencies(owner: string, repo: string, metadata_files: ExtractedMetadata): Promise<number> {
    try {
      const pkgjson_data = JSON.parse(metadata_files["package.json"].toString());
    
      //const content = await this.fetchData(owner, repo, filename);
      //const packageJson = JSON.parse(content);
      const dependencies = pkgjson_data.dependencies;

      let notPinned = 0;
      let pinned = 0;

      for (const [dependencyName, version] of Object.entries(dependencies)) {
        const versionJSON = JSON.parse(JSON.stringify(version));
        const versionString = versionJSON.toString();
        const isExactVersion = /^\d+\.\d+\.\d+$/.test(versionString);

        if (!isExactVersion) {
          notPinned++;
        } else {
          pinned++;
        }
      }

      const dependencyNum = Object.keys(dependencies).length;

      if (dependencyNum === 0) {
        return 1;
        //return filename === "package.json" ? 1.0 : 0.0;
      }

      return pinned / dependencyNum;
    } catch (error) {
      console.error(`Error processing dependencies`);
      return -1;
    }
  }
}

/*
//wraps for exporting, probably need to structure this another way with phase 1
export async function dependency(owner: string, repo: string): Promise<number> {
  const jsonResult = await processDependencies(owner, repo, "package.json");
  if (jsonResult !== -1) {
    return jsonResult;
  }

  // If package.json processing failed, try package-lock.json
  return processDependencies(owner, repo, "package-lock.json");
} */
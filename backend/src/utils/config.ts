//Checks on the environment variables from the .env file

if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is required");
}
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
import { injectable } from "tsyringe";


@injectable()
export class NpmUrlResolver {

    private PACKAGE_NAME_REGEX = /^https:\/\/www\.npmjs\.com\/package\/([a-z0-9\-_]+)/;
    private GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;


    async resolveNpmToGitHub(npmUrl: string): Promise<string> {

        const npmPackageName = npmUrl.match(this.PACKAGE_NAME_REGEX);

        if (!npmPackageName) {
            throw new Error(`Invalid npm URL: ${npmUrl}`);
        }
        const response = await fetch(`https://registry.npmjs.org/${npmPackageName[1]}`);
        const data = await response.json();

        if (!data.repository?.url) {
            throw new Error(`No repository URL found for package: ${npmPackageName}`);
        }

        return data.repository.url.match(this.GITHUB_URL_REGEX)[0];
    }
}
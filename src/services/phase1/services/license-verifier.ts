import { injectable } from "tsyringe";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { promises as fsPromises } from "fs";
import { join } from "path";


@injectable()
export class LicenseVerifier {

    /**
     * Verifies if a GitHub repository has a license.
     *
     * @param url
     */
    public async verifyLicense(url: string): Promise<boolean> {
        if (!this.isValidGitHubURL(url)) {
            console.error("GitHub URL was invalid in verifyLicense");
            throw new Error("GitHub URL was invalid in verifyLicense");
        }

        const uniqueId = this.extractRepoIdFromUrl(url);
        const dirPath = `./tmp_repo/${uniqueId}`;

        try {
            await git.clone({
                fs: fsPromises, http,
                dir: dirPath,
                url: `${url.endsWith(".git") ? url : `${url}.git`}`,
                singleBranch: true,
                depth: 1
            });


            const licenseFilePath = join(dirPath, "LICENSE.md");
            const readmeFilePath = join(dirPath, "README.md");

            return await this.repoHasLicense(licenseFilePath) || await this.repoHasLicense(readmeFilePath);

        } catch (error) {
            console.error("An error occurred in verifyLicense: ", error);
            return false;
        } finally {
            // Cleanup
            await this.deleteDirectory(dirPath);
        }
    }


    /**
     * Checks if a repository has a license file.
     *
     * @param filePath
     */
    async repoHasLicense(filePath: string): Promise<boolean> {
        try {
            // List of licenses compatible with GNU Lesser General Public License v2.1
            const licenses = [
                "GNU Lesser General Public License v2.1",
                "GNU General Public License",
                "MIT License",
                "BSD"
            ];

            // Check if file exists
            await fsPromises.stat(filePath);
            const fileText = await fsPromises.readFile(filePath, "utf8");

            // Check if file contains any of the licenses
            return licenses.some(license => {
                const licenseRegExp = new RegExp(license, "i");
                return licenseRegExp.test(fileText);
            });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.code === "ENOENT") return false;
            throw new Error("An error occurred in repoHasLicense: " + error);
        }
    }


    /**
     * Checks if a URL is a valid GitHub URL.
     *
     * @param url
     * @private
     */
    private isValidGitHubURL(url: string): boolean {
        return /^https?:\/\/github\.com\/[^/]+\/[^/]+(\/)?$/.test(url);
    }


    /**
     * Extracts the owner and repo from a GitHub URL.
     *
     * @param url
     * @private
     */
    private extractRepoIdFromUrl(url: string): string {
        const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
        return match ? match[1].replace(/\//g, "_") : "default";
    }


    /**
     * Deletes a directory recursively.
     *
     * @param dir
     * @private
     */
    private async deleteDirectory(dir: string): Promise<void> {
        const entries = await fsPromises.readdir(dir, {withFileTypes: true});
        await Promise.all(entries.map(entry => {
            const fullPath = join(dir, entry.name);
            return entry.isDirectory() ? this.deleteDirectory(fullPath) : fsPromises.unlink(fullPath);
        }));
        await fsPromises.rmdir(dir);
    }
}
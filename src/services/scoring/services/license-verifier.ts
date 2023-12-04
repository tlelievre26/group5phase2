import { injectable } from "tsyringe";
import { ExtractedMetadata } from "../../../models/other_schemas";



@injectable()
/**
 * Verifies if a GitHub repository has a license.
 */
export class LicenseVerifier {

    /**
     * Verifies if a GitHub repository has a license.
     *
     * @param metadata_files - The metadata files extracted from package, including package.json, README, and LICENSE
     * @returns A promise that resolves to 1 if the repository has a compatible license, or 0 otherwise.
     */
    public async verifyLicense(metadata_files: ExtractedMetadata): Promise<number> {
        
        //Completely reworked from phase 1 to instead process the buffers of license, package.json, and readme extracted from the zip

        //They give everything you could need from them anyways

        //Git cloning would require too much memory probably and is unnecessary

        const pkgjson_data = JSON.parse(metadata_files["package.json"].toString());

        //Checks if the license is defined in the package.json first
        if(pkgjson_data.license != undefined) {
            if(this.checkCompatibleLicense(pkgjson_data.license)) {
                return 1
            }
            else {
                return 0
            }
        }
        //If it isn't check the readme and license using the phase 1 code
        else {
            if(await this.repoHasLicense(metadata_files["README"]) || await this.repoHasLicense(metadata_files["LICENSE"])) {
                return 1;
            }
            else { 
                return 0;
            }

        }
    }

    /**
     * Checks if a license is compatible with the SPDI index.
     *
     * @param pkg_license - The license to check as a string extracted from the package.json
     * @returns True if the license is compatible, false otherwise.
     */
    private checkCompatibleLicense(pkg_license: string): boolean {
        //SPDI index for all compatible licenses
        //I THINK this is all of them based on google searching, it said that sometimes apache was compatible but not everywhere said that? It's very confusing
        //These are based off the following diagram that seemed to be the most commonly cited: https://en.wikipedia.org/wiki/License_compatibility#/media/File:Floss-license-slide-image.svg
        const valid_licenses = ['MIT', 'BSD-3-Clause', 'Apache-2.0', 'MPL-2.0', 'LGPL-2.1', 'ISC']

        return valid_licenses.some(license => {
            const licenseRegExp = new RegExp(license, "i");
            return licenseRegExp.test(pkg_license);
        });

    }

    /**
     * Checks if a repository has a license file.
     *
     * @param fileContents - The contents of the file to check (or undefined if the file wasn't found in the zip)
     * @returns A promise that resolves to true if the repository has a license file, or false otherwise (also false if the file is undefined).
     */
    async repoHasLicense(fileContents: Buffer | undefined ): Promise<boolean> {
        try {
            // List of licenses compatible with GNU Lesser General Public License v2.1
            const licenses = [
                "GNU Lesser General Public License v2.1",
                "GNU General Public License",
                "MIT License",
                "BSD",
                "ISC"
            ];

            //If the README/LICENSE file wasn't found in the zip, return false
            if(fileContents == undefined) {
                return false
            }

            const fileText = fileContents.toString();

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
}
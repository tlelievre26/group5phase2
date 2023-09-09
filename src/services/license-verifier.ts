import { injectable } from "tsyringe";


@injectable()
export class LicenseVerifier {

    /**
     * Verifies the license of a given GitHub repo is compatible with LGPLv2.1.
     *
     * TODO: Implement function
     *
     * @param url
     */
    public async verifyLicense(url: string): Promise<boolean> {

        return true;
    }
}
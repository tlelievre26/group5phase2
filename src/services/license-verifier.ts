import { injectable } from "tsyringe";

@injectable()
export class LicenseVerifier {

    verifyLicense(): boolean {
        return true;
    }
}
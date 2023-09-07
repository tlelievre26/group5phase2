import { injectable } from "tsyringe";

@injectable()
export class LicenseVerifier {
    public verifyLicense(url: string): boolean {

        return true;
    }
}
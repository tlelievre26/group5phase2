import { inject, injectable } from "tsyringe";
import { LicenseVerifier } from "./license-verifier";

import { Metrics } from "../types/metrics";

@injectable()
export class MetricsCalculator {
    constructor(
        @inject("LicenseVerifier") private licenseVerifier: LicenseVerifier
    ) {
    }

    public calculateMetrics(data: any): Metrics {
        const busFactor = this.calculateBusFactor();
        const correctness = this.calculateCorrectness();
        const rampUp = this.calculateRampUp();
        const responsiveMaintainer = this.calculateResponsiveMaintainer();
        const license = this.licenseVerifier.verifyLicense(data.license);
        const netScore = this.calculateNetScore(busFactor, correctness, rampUp, responsiveMaintainer, license);

        return {
            BusFactor: busFactor, Correctness: correctness, RampUp: rampUp,
            ResponsiveMaintainer: responsiveMaintainer, License: license, NetScore: netScore
        };
    }

    calculateBusFactor(): number {

        return 0;
    }

    calculateCorrectness(): number {

        return 0;
    }

    calculateRampUp(): number {

        return 0;
    }

    calculateResponsiveMaintainer(): number {

        return 0;
    }

    calculateNetScore(busFactor: number, correctness: number, rampUp: number,
                      responsiveMaintainer: number, license: boolean): number {

        return 0;
    }
}
import { injectable, inject } from "tsyringe";

import { UrlFileProcessor } from "../services/url-file-processor";
import { MetricsDataRetriever } from "../services/metrics-data-retriever";
import { MetricsCalculator } from "../services/metrics-calculator";
import { LicenseVerifier } from "../services/license-verifier";

@injectable()
export class MetricsController {
    constructor(
        @inject("UrlFileProcessor") private urlProcessor: UrlFileProcessor,
        @inject("MetricsDataRetriever") private metricsDataRetriever: MetricsDataRetriever,
        @inject("MetricsCalculator") private metricsCalculator: MetricsCalculator,
        @inject("LicenseVerifier") private licenseVerifier: LicenseVerifier
    ) {
    }

    generateMetrics(urlFilePath: string): void {

    }
}
import { MetricsController } from "./controllers/metrics-controller";
import { UrlFileProcessor } from "./legacy/url-file-processor";
import { NpmUrlResolver } from "./legacy/npm-url-resolver";
import { MetricsDataRetriever } from "./services/metrics-data-retriever";
import { MetricsCalculator } from "./services/metrics-calculator";
import { LicenseVerifier } from "./services/license-verifier";

import { container } from "tsyringe";
import { GITHUB_TOKEN } from "../../utils/config";


container.register("MetricsController", {useClass: MetricsController});
container.register("UrlFileProcessor", {useClass: UrlFileProcessor});
container.register("NpmUrlResolver", {useClass: NpmUrlResolver});
container.register("MetricsDataRetrieverToken", {
    useFactory: () => {
        return new MetricsDataRetriever(GITHUB_TOKEN);
    }
});
container.register("MetricsCalculator", {useClass: MetricsCalculator});
container.register("LicenseVerifier", {useClass: LicenseVerifier});

export { container };

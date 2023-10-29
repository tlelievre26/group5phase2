"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const metrics_controller_1 = require("./controllers/metrics-controller");
const url_file_processor_1 = require("./services/url-file-processor");
const npm_url_resolver_1 = require("./services/npm-url-resolver");
const metrics_data_retriever_1 = require("./services/metrics-data-retriever");
const metrics_calculator_1 = require("./services/metrics-calculator");
const license_verifier_1 = require("./services/license-verifier");
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
const config_1 = require("./config");
tsyringe_1.container.register("MetricsController", { useClass: metrics_controller_1.MetricsController });
tsyringe_1.container.register("UrlFileProcessor", { useClass: url_file_processor_1.UrlFileProcessor });
tsyringe_1.container.register("NpmUrlResolver", { useClass: npm_url_resolver_1.NpmUrlResolver });
tsyringe_1.container.register("MetricsDataRetrieverToken", {
    useFactory: () => {
        return new metrics_data_retriever_1.MetricsDataRetriever(config_1.GITHUB_TOKEN);
    }
});
tsyringe_1.container.register("MetricsCalculator", { useClass: metrics_calculator_1.MetricsCalculator });
tsyringe_1.container.register("LicenseVerifier", { useClass: license_verifier_1.LicenseVerifier });
//# sourceMappingURL=container.js.map
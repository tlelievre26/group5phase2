"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const metrics_controller_1 = require("../../../controllers/metrics-controller");
const url_file_processor_1 = require("../../../services/url-file-processor");
const metrics_data_retriever_1 = require("../../../services/metrics-data-retriever");
const metrics_calculator_1 = require("../../../services/metrics-calculator");
const npm_url_resolver_1 = require("../../../services/npm-url-resolver");
const license_verifier_1 = require("../../../services/license-verifier");
jest.mock("../../../services/url-file-processor");
jest.mock("../../../services/npm-url-resolver");
jest.mock("../../../services/metrics-data-retriever");
jest.mock("../../../services/metrics-calculator");
jest.mock("../../../services/license-verifier");
describe("MetricsController", () => {
    let metricsController;
    const mockUrls = ["url1", "url2"];
    const mockData = [{}, {}];
    const mockToken = "GITHUB_TOKEN";
    const mockUrlFile = "URL_FILE";
    const mockMetrics = {
        URL: "url",
        BUS_FACTOR_SCORE: 0.5,
        CORRECTNESS_SCORE: 0.9,
        RAMP_UP_SCORE: 0.3,
        RESPONSIVE_MAINTAINER_SCORE: 0.5,
        LICENSE_SCORE: true,
        NET_SCORE: 1
    };
    beforeEach(() => {
        const mockNpmUrlResolver = new npm_url_resolver_1.NpmUrlResolver();
        const mockUrlFileProcessor = new url_file_processor_1.UrlFileProcessor(mockNpmUrlResolver);
        const mockMetricsDataRetriever = new metrics_data_retriever_1.MetricsDataRetriever(mockToken);
        const mockLicenseVerifier = new license_verifier_1.LicenseVerifier();
        const mockMetricsCalculator = new metrics_calculator_1.MetricsCalculator(mockLicenseVerifier);
        url_file_processor_1.UrlFileProcessor.prototype.processUrlFile.mockReturnValue(mockUrls);
        metrics_data_retriever_1.MetricsDataRetriever.prototype.retrieveMetricsData.mockReturnValue(mockData);
        metrics_calculator_1.MetricsCalculator.prototype.calculateMetrics.mockReturnValue([mockMetrics]);
        metricsController = new metrics_controller_1.MetricsController(mockUrlFileProcessor, mockMetricsDataRetriever, mockMetricsCalculator);
    });
    describe("generateMetrics", () => {
        it("should process, retrieve and calculate metrics, then output them in NDJSON format", () => __awaiter(void 0, void 0, void 0, function* () {
            const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
            yield metricsController.generateMetrics(mockUrlFile);
            expect(url_file_processor_1.UrlFileProcessor.prototype.processUrlFile).toHaveBeenCalledWith(mockUrlFile);
            expect(metrics_data_retriever_1.MetricsDataRetriever.prototype.retrieveMetricsData).toHaveBeenCalledWith(mockUrls);
            expect(metrics_calculator_1.MetricsCalculator.prototype.calculateMetrics).toHaveBeenCalledWith(mockUrls, mockData);
            expect(stdoutSpy).toHaveBeenCalledWith([JSON.stringify(mockMetrics)].join("\n"));
            stdoutSpy.mockRestore();
        }));
    });
});
//# sourceMappingURL=metrics-controller.test.js.map
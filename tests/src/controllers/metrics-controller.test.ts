import "reflect-metadata";

import { MetricsController } from "../../../src/controllers/metrics-controller";
import { UrlFileProcessor } from "../../../src/services/url-file-processor";
import { MetricsDataRetriever } from "../../../src/services/metrics-data-retriever";
import { MetricsCalculator } from "../../../src/services/metrics-calculator";
import { Metrics } from "../../../src/types/metrics";
import { NpmUrlResolver } from "../../../src/services/npm-url-resolver";
import { LicenseVerifier } from "../../../src/services/license-verifier";


jest.mock("../../../src/services/url-file-processor")
jest.mock("../../../src/services/npm-url-resolver");
jest.mock("../../../src/services/metrics-data-retriever");
jest.mock("../../../src/services/metrics-calculator");
jest.mock("../../../src/services/license-verifier");


describe("MetricsController", () => {

    let metricsController: MetricsController;

    const mockUrls = ["url1", "url2"];
    const mockData = [{}, {}];
    const mockToken = "GITHUB_TOKEN";
    const mockUrlFile = "URL_FILE";
    const mockMetrics: Metrics = {
        Url: "url",
        BusFactor: 5,
        Correctness: 95,
        RampUp: 3,
        ResponsiveMaintainer: 4,
        License: true,
        NetScore: 80
    };


    beforeEach(() => {
        const mockNpmUrlResolver = new NpmUrlResolver();
        const mockUrlFileProcessor = new UrlFileProcessor(mockNpmUrlResolver);
        const mockMetricsDataRetriever = new MetricsDataRetriever(mockToken);
        const mockLicenseVerifier = new LicenseVerifier();
        const mockMetricsCalculator = new MetricsCalculator(mockLicenseVerifier);

        (UrlFileProcessor.prototype.processUrlFile as jest.Mock).mockReturnValue(mockUrls);
        (MetricsDataRetriever.prototype.retrieveMetricsData as jest.Mock).mockReturnValue(mockData);
        (MetricsCalculator.prototype.calculateMetrics as jest.Mock).mockReturnValue([mockMetrics, mockMetrics]);

        metricsController = new MetricsController(
            mockUrlFileProcessor,
            mockMetricsDataRetriever,
            mockMetricsCalculator
        );
    });


    // TODO: Add tests for error cases
    describe("generateMetrics", () => {
        it("should process, retrieve and calculate metrics, then output them in NDJSON format", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

            await metricsController.generateMetrics(mockUrlFile);

            expect(UrlFileProcessor.prototype.processUrlFile).toHaveBeenCalledWith(mockUrlFile);
            expect(MetricsDataRetriever.prototype.retrieveMetricsData).toHaveBeenCalledWith(mockUrls);
            expect(MetricsCalculator.prototype.calculateMetrics).toHaveBeenCalledWith(mockUrls, mockData);
            expect(consoleLogSpy).toHaveBeenCalledWith([JSON.stringify(mockMetrics), JSON.stringify(mockMetrics)].join("\n"));


            consoleLogSpy.mockRestore();
        });
    });
});
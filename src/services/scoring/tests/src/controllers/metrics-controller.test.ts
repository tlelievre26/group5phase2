import "reflect-metadata";

import { MetricsController } from "../../../controllers/metrics-controller";
import { UrlFileProcessor } from "../../../legacy/url-file-processor";
import { MetricsDataRetriever } from "../../../services/metrics-data-retriever";
import { MetricsCalculator } from "../../../services/metrics-calculator";
//import { Metrics } from "../../../types/metrics";
import { NpmUrlResolver } from "../../../legacy/npm-url-resolver";
import { LicenseVerifier } from "../../../services/license-verifier";


jest.mock("../../../services/url-file-processor")
jest.mock("../../../services/npm-url-resolver");
jest.mock("../../../services/metrics-data-retriever");
jest.mock("../../../services/metrics-calculator");
jest.mock("../../../services/license-verifier");


describe("MetricsController", () => {

    // let metricsController: MetricsController;

    // const mockUrls = ["url1", "url2"];
    // const mockData = [{}, {}];
    // const mockToken = "GITHUB_TOKEN";
    // const mockUrlFile = "URL_FILE";
    // const mockMetrics: Metrics = {
    //     URL: "url",
    //     BUS_FACTOR_SCORE: 0.5,
    //     CORRECTNESS_SCORE: 0.9,
    //     RAMP_UP_SCORE: 0.3,
    //     RESPONSIVE_MAINTAINER_SCORE: 0.5,
    //     LICENSE_SCORE: true,
    //     NET_SCORE: 1
    // };



    // beforeEach(() => {
    //     const mockNpmUrlResolver = new NpmUrlResolver();
    //     const mockUrlFileProcessor = new UrlFileProcessor(mockNpmUrlResolver);
    //     const mockMetricsDataRetriever = new MetricsDataRetriever(mockToken);
    //     const mockLicenseVerifier = new LicenseVerifier();
    //     const mockMetricsCalculator = new MetricsCalculator(mockLicenseVerifier);

    //     (UrlFileProcessor.prototype.processUrlFile as jest.Mock).mockReturnValue(mockUrls);
    //     (MetricsDataRetriever.prototype.retrieveMetricsData as jest.Mock).mockReturnValue(mockData);
    //     (MetricsCalculator.prototype.calculateMetrics as jest.Mock).mockReturnValue([mockMetrics]);

    //     metricsController = new MetricsController(
    //         mockUrlFileProcessor,
    //         mockMetricsDataRetriever,
    //         mockMetricsCalculator
    //     );
    // });

    // describe("generateMetrics", () => {
    //     it("should process, retrieve and calculate metrics, then output them in NDJSON format", async () => {
    //         const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

    //         await metricsController.generateMetrics(mockUrlFile);

    //         expect(UrlFileProcessor.prototype.processUrlFile).toHaveBeenCalledWith(mockUrlFile);
    //         expect(MetricsDataRetriever.prototype.retrieveMetricsData).toHaveBeenCalledWith(mockUrls);
    //         expect(MetricsCalculator.prototype.calculateMetrics).toHaveBeenCalledWith(mockUrls, mockData);
    //         expect(stdoutSpy).toHaveBeenCalledWith([JSON.stringify(mockMetrics)].join("\n"));


    //        stdoutSpy.mockRestore();
    //     });
    // });
});

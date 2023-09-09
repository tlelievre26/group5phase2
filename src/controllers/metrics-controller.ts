import { injectable, inject } from "tsyringe";

import { UrlFileProcessor } from "../services/url-file-processor";
import { MetricsDataRetriever } from "../services/metrics-data-retriever";
import { MetricsCalculator } from "../services/metrics-calculator";
import { Metrics } from "../types/metrics";


@injectable()
export class MetricsController {
    constructor(
        @inject("UrlFileProcessor") private urlFileProcessor: UrlFileProcessor,
        @inject("MetricsDataRetrieverToken") private metricsDataRetriever: MetricsDataRetriever,
        @inject("MetricsCalculator") private metricsCalculator: MetricsCalculator
    ) {
    }


    /**
     * Generates metrics for a list of GitHub URLs in a given file.
     * @param urlFilePath
     */
    async generateMetrics(urlFilePath: string): Promise<void> {
        // Process URL file to get list of GitHub URLs
        const urls = this.urlFileProcessor.processUrlFile(urlFilePath);

        // Retrieve metrics data from GitHub
        const data = this.metricsDataRetriever.retrieveMetricsData(urls);

        // Calculate metrics using retrieved data
        const metrics = await this.metricsCalculator.calculateMetrics(urls, await data);

        // Output metrics to console in NDJSON format
        console.log(metrics.map(metric => JSON.stringify(metric)).join("\n"));
    }
}
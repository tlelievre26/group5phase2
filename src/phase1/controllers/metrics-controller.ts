import { injectable, inject } from "tsyringe";

import { UrlFileProcessor } from "../services/url-file-processor";
import { MetricsDataRetriever } from "../services/metrics-data-retriever";
import { MetricsCalculator } from "../services/metrics-calculator";
import { Metrics } from "../types/metrics";
import logger from "../utils/logger";


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
        if (!urlFilePath) {
            logger.error("URL file path is empty");
            throw new Error("URL file path is empty");
        }

        logger.info(`Generating metrics for URLs in file ${urlFilePath}`);

        logger.debug("Processing URL file...");
        const urls = this.urlFileProcessor.processUrlFile(urlFilePath);

        logger.debug("Retrieving metrics data...");
        // Retrieve metrics data from GitHub API
        const data = this.metricsDataRetriever.retrieveMetricsData(urls);

        logger.debug("Calculating metrics scores...")
        const metrics = await this.metricsCalculator.calculateMetrics(urls, await data);

        logger.debug("Outputting metrics...")
        // Output metrics in NDJSON format
        process.stdout.write(
            metrics.map(metric => {
                return JSON.stringify({
                    ...metric,
                    BUS_FACTOR_SCORE: parseFloat(metric.BUS_FACTOR_SCORE.toFixed(1)),
                    CORRECTNESS_SCORE: parseFloat(metric.CORRECTNESS_SCORE.toFixed(1)),
                    RAMP_UP_SCORE: parseFloat(metric.RAMP_UP_SCORE.toFixed(1)),
                    RESPONSIVE_MAINTAINER_SCORE: parseFloat(metric.RESPONSIVE_MAINTAINER_SCORE.toFixed(1)),
                    NET_SCORE: parseFloat(metric.NET_SCORE.toFixed(1))
                });
            }).join("\n")
        );
    }
}
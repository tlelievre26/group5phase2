import { injectable, inject } from "tsyringe";

import { UrlFileProcessor } from "../legacy/url-file-processor";
import { MetricsDataRetriever } from "../services/metrics-data-retriever";
import { MetricsCalculator } from "../services/metrics-calculator";

import { PackageRating } from "../../../models/api_schemas";
import logger from "../../../utils/logger";
import { ExtractedMetadata } from "../../../models/other_schemas";


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

    //Modifying this to accomodate new format, basically just removing the file parsing and jumping straight to the list of URLs
    async generateMetrics(owner: string, repo: string, pkg_metadata: ExtractedMetadata): Promise<PackageRating> {

        /* Unneeded code from phase 1, now we just want to take in a single

        if (!urlFilePath) {
            logger.error("URL file path is empty");
            throw new Error("URL file path is empty");
        }

        logger.info(`Generating metrics for URLs in file ${urlFilePath}`);

        logger.debug("Processing URL file...");
        const urls = this.urlFileProcessor.processUrlFile(urlFilePath);

        */

        //logger.debug("Retrieving metrics data...");
        // Retrieve metrics data from GitHub API
        const data = this.metricsDataRetriever.retrieveMetricsData(owner, repo);


        //logger.debug("Calculating metrics scores...")
        const metrics = await this.metricsCalculator.calculateMetrics(owner, repo, await data, pkg_metadata);

        //logger.debug("Outputting metrics...")
        // Output metrics in NDJSON format
        /*
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
        */
       return metrics
    }
}
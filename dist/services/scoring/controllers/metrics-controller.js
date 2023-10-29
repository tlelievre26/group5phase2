"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const tsyringe_1 = require("tsyringe");
//import { UrlFileProcessor } from "../legacy/url-file-processor";
const metrics_data_retriever_1 = require("../services/metrics-data-retriever");
const metrics_calculator_1 = require("../services/metrics-calculator");
const logger_1 = __importDefault(require("../../../utils/logger"));
let MetricsController = class MetricsController {
    constructor(metricsDataRetriever, metricsCalculator) {
        this.metricsDataRetriever = metricsDataRetriever;
        this.metricsCalculator = metricsCalculator;
    }
    /**
     * Generates metrics for a list of GitHub URLs in a given file.
     * @param urlFilePath
     */
    //Modifying this to accomodate new format, basically just removing the file parsing and jumping straight to the list of URLs
    generateMetrics(repo_url) {
        return __awaiter(this, void 0, void 0, function* () {
            /* Unneeded code from phase 1, now we just want to take in a single
    
            if (!urlFilePath) {
                logger.error("URL file path is empty");
                throw new Error("URL file path is empty");
            }
    
            logger.info(`Generating metrics for URLs in file ${urlFilePath}`);
    
            logger.debug("Processing URL file...");
            const urls = this.urlFileProcessor.processUrlFile(urlFilePath);
    
            */
            logger_1.default.debug("Retrieving metrics data...");
            // Retrieve metrics data from GitHub API
            const data = this.metricsDataRetriever.retrieveMetricsData(repo_url);
            logger_1.default.debug("Calculating metrics scores...");
            const metrics = yield this.metricsCalculator.calculateMetrics(repo_url, yield data);
            logger_1.default.debug("Outputting metrics...");
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
            return metrics;
        });
    }
};
exports.MetricsController = MetricsController;
exports.MetricsController = MetricsController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("MetricsDataRetrieverToken")),
    __param(1, (0, tsyringe_1.inject)("MetricsCalculator")),
    __metadata("design:paramtypes", [metrics_data_retriever_1.MetricsDataRetriever,
        metrics_calculator_1.MetricsCalculator])
], MetricsController);
//# sourceMappingURL=metrics-controller.js.map
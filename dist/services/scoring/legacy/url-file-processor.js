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
exports.UrlFileProcessor = void 0;
const tsyringe_1 = require("tsyringe");
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../../../utils/logger"));
const npm_url_resolver_1 = require("./npm-url-resolver");
let UrlFileProcessor = class UrlFileProcessor {
    /**
     * Creates a new instance of the UrlFileProcessor class.
     *
     * @param npmUrlResolver
     */
    constructor(npmUrlResolver) {
        this.npmUrlResolver = npmUrlResolver;
    }
    /**
     * Processes a file containing a list of GitHub or npm URLs.
     *
     * @param urlFilePath
     */
    processUrlFile(urlFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const urls = yield this.extractUrlsFromFile(urlFilePath);
                const processedUrls = [];
                for (const url of urls) {
                    if (yield this.isGitHubUrl(url)) {
                        processedUrls.push(url); // No processing needed
                    }
                    else if (yield this.isNpmUrl(url)) {
                        logger_1.default.debug(`Resolving npm URL to GitHub URL: ${url}`);
                        const gitHubUrl = yield this.npmUrlResolver.resolveNpmToGitHub(url);
                        processedUrls.push(gitHubUrl); // Resolve npm URL to GitHub URL
                    }
                    else {
                        logger_1.default.error(`Unsupported URL type: ${url}`);
                        throw new Error(`Unsupported URL type: ${url}`);
                    }
                }
                return processedUrls;
            }
            catch (error) {
                logger_1.default.error(`Error processing URL file ${urlFilePath}:`, error);
                throw error;
            }
        });
    }
    /**
     * Checks if a URL is a GitHub URL.
     *
     * @param url
     */
    isGitHubUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!url) {
                throw new Error("URL is empty in isGitHubUrl");
            }
            const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
            return githubRegex.test(url);
        });
    }
    /**
     * Checks if a URL is a npm URL.
     *
     * @param url
     */
    isNpmUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!url) {
                throw new Error("URL is empty in isNpmUrl");
            }
            const npmRegex = /^https:\/\/www\.npmjs\.com\/package\/[a-zA-Z0-9_-]+$/;
            return npmRegex.test(url);
        });
    }
    /**
     * Extracts a list of URLs from a file.
     *
     * @param urlFilePath
     */
    extractUrlsFromFile(urlFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileContents = fs_1.default.readFileSync(urlFilePath, "utf-8");
            return fileContents.split("\n").map(line => line.trim()).filter(Boolean);
        });
    }
};
exports.UrlFileProcessor = UrlFileProcessor;
exports.UrlFileProcessor = UrlFileProcessor = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("NpmUrlResolver")),
    __metadata("design:paramtypes", [npm_url_resolver_1.NpmUrlResolver])
], UrlFileProcessor);
//# sourceMappingURL=url-file-processor.js.map
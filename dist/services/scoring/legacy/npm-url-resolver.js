"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.NpmUrlResolver = void 0;
const tsyringe_1 = require("tsyringe");
const logger_1 = __importDefault(require("../../../utils/logger"));
let NpmUrlResolver = class NpmUrlResolver {
    constructor() {
        this.PACKAGE_NAME_REGEX = /^https:\/\/www\.npmjs\.com\/package\/([a-z0-9\-_]+)/;
        this.GITHUB_URL_REGEX = /github\.com\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
    }
    /**
     * Resolves a npm URL to a GitHub URL.
     *
     * @param npmUrl
     */
    resolveNpmToGitHub(npmUrl) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.debug(`Resolving npm URL to GitHub URL: ${npmUrl}`);
            // Extract package name from npm URL
            const npmPackageName = npmUrl.match(this.PACKAGE_NAME_REGEX);
            if (!npmPackageName) {
                throw new Error(`Invalid npm URL: ${npmUrl}`);
            }
            // Fetch package data from npm registry
            const response = yield fetch(`https://registry.npmjs.org/${npmPackageName[1]}`);
            const data = yield response.json();
            if (!((_a = data.repository) === null || _a === void 0 ? void 0 : _a.url)) {
                throw new Error(`No repository URL found for package: ${npmPackageName[1]}`);
            }
            // Extract owner and repo from GitHub URL
            const resolvedUrl = "https://" + data.repository.url.match(this.GITHUB_URL_REGEX)[0];
            logger_1.default.debug(`Successfully resolved npm URL to GitHub URL: ${resolvedUrl}`);
            return resolvedUrl;
        });
    }
};
exports.NpmUrlResolver = NpmUrlResolver;
exports.NpmUrlResolver = NpmUrlResolver = __decorate([
    (0, tsyringe_1.injectable)()
], NpmUrlResolver);
//# sourceMappingURL=npm-url-resolver.js.map
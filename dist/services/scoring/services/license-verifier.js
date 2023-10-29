"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.LicenseVerifier = void 0;
const tsyringe_1 = require("tsyringe");
const git = __importStar(require("isomorphic-git"));
const node_1 = __importDefault(require("isomorphic-git/http/node"));
const fs_1 = require("fs");
const path_1 = require("path");
let LicenseVerifier = class LicenseVerifier {
    /**
     * Verifies if a GitHub repository has a license.
     *
     * @param url
     */
    verifyLicense(url) {
        return __awaiter(this, void 0, void 0, function* () {
            //NEED TO REPLACE THIS WITH LOOKING FOR THE FILE IN THE S3 BUCKET
            if (!this.isValidGitHubURL(url)) {
                console.error("GitHub URL was invalid in verifyLicense");
                throw new Error("GitHub URL was invalid in verifyLicense");
            }
            const uniqueId = this.extractRepoIdFromUrl(url);
            const dirPath = `./tmp_repo/${uniqueId}`;
            try {
                yield git.clone({
                    fs: fs_1.promises, http: node_1.default,
                    dir: dirPath,
                    url: `${url.endsWith(".git") ? url : `${url}.git`}`,
                    singleBranch: true,
                    depth: 1
                });
                const licenseFilePath = (0, path_1.join)(dirPath, "LICENSE.md");
                const readmeFilePath = (0, path_1.join)(dirPath, "README.md");
                if ((yield this.repoHasLicense(licenseFilePath)) || (yield this.repoHasLicense(readmeFilePath))) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
            catch (error) {
                console.error("An error occurred in verifyLicense: ", error);
                return 0;
            }
            finally {
                // Cleanup
                yield this.deleteDirectory(dirPath);
            }
        });
    }
    /**
     * Checks if a repository has a license file.
     *
     * @param filePath
     */
    repoHasLicense(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // List of licenses compatible with GNU Lesser General Public License v2.1
                const licenses = [
                    "GNU Lesser General Public License v2.1",
                    "GNU General Public License",
                    "MIT License",
                    "BSD"
                ];
                // Check if file exists
                yield fs_1.promises.stat(filePath);
                const fileText = yield fs_1.promises.readFile(filePath, "utf8");
                // Check if file contains any of the licenses
                return licenses.some(license => {
                    const licenseRegExp = new RegExp(license, "i");
                    return licenseRegExp.test(fileText);
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (error) {
                if (error.code === "ENOENT")
                    return false;
                throw new Error("An error occurred in repoHasLicense: " + error);
            }
        });
    }
    /**
     * Checks if a URL is a valid GitHub URL.
     *
     * @param url
     * @private
     */
    isValidGitHubURL(url) {
        return /^https?:\/\/github\.com\/[^/]+\/[^/]+(\/)?$/.test(url);
    }
    /**
     * Extracts the owner and repo from a GitHub URL.
     *
     * @param url
     * @private
     */
    extractRepoIdFromUrl(url) {
        const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
        return match ? match[1].replace(/\//g, "_") : "default";
    }
    /**
     * Deletes a directory recursively.
     *
     * @param dir
     * @private
     */
    deleteDirectory(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = yield fs_1.promises.readdir(dir, { withFileTypes: true });
            yield Promise.all(entries.map(entry => {
                const fullPath = (0, path_1.join)(dir, entry.name);
                return entry.isDirectory() ? this.deleteDirectory(fullPath) : fs_1.promises.unlink(fullPath);
            }));
            yield fs_1.promises.rmdir(dir);
        });
    }
};
exports.LicenseVerifier = LicenseVerifier;
exports.LicenseVerifier = LicenseVerifier = __decorate([
    (0, tsyringe_1.injectable)()
], LicenseVerifier);
//# sourceMappingURL=license-verifier.js.map
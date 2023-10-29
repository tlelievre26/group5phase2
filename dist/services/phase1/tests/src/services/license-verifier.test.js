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
require("reflect-metadata");
const license_verifier_1 = require("../../../services/license-verifier");
const git = __importStar(require("isomorphic-git"));
const fs_1 = __importDefault(require("fs"));
// Mocks
jest.mock("isomorphic-git");
// Mocking the fs module to avoid writing to the file system
jest.mock("fs", () => ({
    promises: {
        readFile: jest.fn(),
        readdir: jest.fn().mockResolvedValue([]),
        unlink: jest.fn(),
        rmdir: jest.fn(),
        stat: jest.fn().mockResolvedValue(true)
    }
}));
const { promises: fsPromises } = fs_1.default;
describe("LicenseVerifier", () => {
    let licenseVerifier;
    beforeEach(() => {
        licenseVerifier = new license_verifier_1.LicenseVerifier();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should verify a repo with LGPLv2.1 license correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        git.clone.mockResolvedValue(true);
        // Mocking the readFile method to return a mock license text
        fsPromises.readFile.mockResolvedValue("This is a mock GNU Lesser General Public License v2.1 content");
        const result = yield licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeTruthy();
    }));
    it("should return false for a repo without LGPLv2.1 license", () => __awaiter(void 0, void 0, void 0, function* () {
        git.clone.mockResolvedValue(true);
        fsPromises.readFile.mockResolvedValue("This is some other mock license content");
        const result = yield licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeFalsy();
    }));
    it("should throw an error for an invalid GitHub URL", () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(licenseVerifier.verifyLicense("https://invalid.com/mockOwner/mockRepo"))
            .rejects.toThrow("GitHub URL was invalid in verifyLicense");
    }));
    it("should verify a repo with LGPLv2.1 license in README.md correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        git.clone.mockResolvedValue(true);
        // Mock `readFile` to first reject for LICENSE.md and then return mock license for README.md
        fsPromises.readFile
            .mockRejectedValueOnce({ code: "ENOENT" })
            .mockResolvedValue("This is a mock GNU Lesser General Public License v2.1 content in README");
        const result = yield licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeTruthy();
    }));
    it("should return false when neither LICENSE.md nor README.md exist", () => __awaiter(void 0, void 0, void 0, function* () {
        git.clone.mockResolvedValue(true);
        // Mock both files to not exist
        fsPromises.readFile.mockRejectedValue({ code: "ENOENT" });
        const result = yield licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeFalsy();
    }));
    it("should handle an error other than ENOENT in repoHasLicense", () => __awaiter(void 0, void 0, void 0, function* () {
        // Suppress the console.error messages for this test
        const originalConsoleError = console.error;
        console.error = jest.fn();
        git.clone.mockResolvedValue(true);
        fsPromises.readFile.mockRejectedValue(new Error("Some random error"));
        const result = yield licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeFalsy();
        // Restore the original console.error function after the test
        console.error = originalConsoleError;
    }));
    it("should handle nested directories during cleanup", () => __awaiter(void 0, void 0, void 0, function* () {
        git.clone.mockResolvedValue(true);
        // Mock nested directories
        const directory = { name: "nested", isDirectory: jest.fn().mockReturnValue(true) };
        fsPromises.readdir.mockResolvedValueOnce([directory]).mockResolvedValueOnce([]);
        // Provide a mock license in LICENSE.md to ensure the code proceeds to cleanup
        fsPromises.readFile.mockResolvedValue("This is a mock GNU Lesser General Public License v2.1 content");
        const result = yield licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeTruthy();
    }));
});
//# sourceMappingURL=license-verifier.test.js.map
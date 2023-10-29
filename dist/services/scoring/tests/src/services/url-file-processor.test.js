"use strict";
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
const url_file_processor_1 = require("../../../legacy/url-file-processor");
const npm_url_resolver_1 = require("../../../legacy/npm-url-resolver");
const fs_1 = __importDefault(require("fs"));
// Mocks
jest.mock("../../../services/npm-url-resolver");
jest.mock("fs");
const mockNpmUrlResolver = new npm_url_resolver_1.NpmUrlResolver();
mockNpmUrlResolver.resolveNpmToGitHub = jest.fn();
const MOCK_GITHUB_URL = "https://github.com/user/repo";
const MOCK_NPM_URL = "https://www.npmjs.com/package/some-package";
const MOCK_RESOLVED_GITHUB_URL = "https://github.com/npmUser/npmRepo";
describe("UrlFileProcessor", () => {
    let processor;
    beforeEach(() => {
        processor = new url_file_processor_1.UrlFileProcessor(mockNpmUrlResolver);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should extract URLs and process them", () => __awaiter(void 0, void 0, void 0, function* () {
        fs_1.default.readFileSync.mockReturnValue(`${MOCK_GITHUB_URL}\n${MOCK_NPM_URL}`);
        mockNpmUrlResolver.resolveNpmToGitHub.mockResolvedValue(MOCK_RESOLVED_GITHUB_URL);
        const result = yield processor.processUrlFile("some-file-path");
        expect(result).toEqual([MOCK_GITHUB_URL, MOCK_RESOLVED_GITHUB_URL]);
    }));
});
//# sourceMappingURL=url-file-processor.test.js.map
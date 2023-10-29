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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
require("reflect-metadata");
const npm_url_resolver_1 = require("../../../legacy/npm-url-resolver");
const mockFetch = jest.fn();
global.fetch = mockFetch;
const MOCK_NPM_URL = "https://www.npmjs.com/package/some-package";
const MOCK_GITHUB_URL = "https://github.com/user/repo";
describe("NpmUrlResolver", () => {
    let resolver;
    beforeEach(() => {
        resolver = new npm_url_resolver_1.NpmUrlResolver();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it("should throw an error for invalid npm URLs", () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(resolver.resolveNpmToGitHub("invalid-url"))
            .rejects.toThrow("Invalid npm URL: invalid-url");
    }));
    it("should throw an error if no repository URL found", () => __awaiter(void 0, void 0, void 0, function* () {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({})));
        yield expect(resolver.resolveNpmToGitHub(MOCK_NPM_URL))
            .rejects.toThrow("No repository URL found for package: some-package");
    }));
    it("should return the correct GitHub URL", () => __awaiter(void 0, void 0, void 0, function* () {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({
            repository: {
                url: "git+https://github.com/user/repo.git"
            }
        })));
        const result = yield resolver.resolveNpmToGitHub(MOCK_NPM_URL);
        expect(result).toBe(MOCK_GITHUB_URL);
    }));
});
//# sourceMappingURL=npm-url-resolver.test.js.map
import "reflect-metadata";
import { UrlFileProcessor } from "../../../services/url-file-processor";
import { NpmUrlResolver } from "../../../services/npm-url-resolver";
import fs from "fs";

// Mocks
jest.mock("../../../services/npm-url-resolver");
jest.mock("fs");

const mockNpmUrlResolver = new NpmUrlResolver();
mockNpmUrlResolver.resolveNpmToGitHub = jest.fn();

const MOCK_GITHUB_URL = "https://github.com/user/repo";
const MOCK_NPM_URL = "https://www.npmjs.com/package/some-package";
const MOCK_RESOLVED_GITHUB_URL = "https://github.com/npmUser/npmRepo";

describe("UrlFileProcessor", () => {
    let processor: UrlFileProcessor;

    beforeEach(() => {
        processor = new UrlFileProcessor(mockNpmUrlResolver);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should extract URLs and process them", async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(`${MOCK_GITHUB_URL}\n${MOCK_NPM_URL}`);

        (mockNpmUrlResolver.resolveNpmToGitHub as jest.Mock).mockResolvedValue(MOCK_RESOLVED_GITHUB_URL);

        const result = await processor.processUrlFile("some-file-path");
        expect(result).toEqual([MOCK_GITHUB_URL, MOCK_RESOLVED_GITHUB_URL]);
    });
});

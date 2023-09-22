import "reflect-metadata";
import { NpmUrlResolver } from "../../../src/services/npm-url-resolver";


const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

const MOCK_NPM_URL = "https://www.npmjs.com/package/some-package";
const MOCK_GITHUB_URL = "https://github.com/user/repo";

describe("NpmUrlResolver", () => {
    let resolver: NpmUrlResolver;


    beforeEach(() => {
        resolver = new NpmUrlResolver();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should throw an error for invalid npm URLs", async () => {
        await expect(resolver.resolveNpmToGitHub("invalid-url"))
            .rejects.toThrow("Invalid npm URL: invalid-url");
    });

    it("should throw an error if no repository URL found", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({})));

        await expect(resolver.resolveNpmToGitHub(MOCK_NPM_URL))
            .rejects.toThrow("No repository URL found for package: some-package");
    });

    it("should return the correct GitHub URL", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({
                repository: {
                    url: "git+https://github.com/user/repo.git"
                }
            }))
        );

        const result = await resolver.resolveNpmToGitHub(MOCK_NPM_URL);
        expect(result).toBe(MOCK_GITHUB_URL);
    });
});
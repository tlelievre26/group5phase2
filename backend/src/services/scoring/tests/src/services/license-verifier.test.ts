import "reflect-metadata";
import { LicenseVerifier } from "../../../services/license-verifier";
import * as git from "isomorphic-git";
import fs from "fs";


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

const {promises: fsPromises} = fs;

describe("LicenseVerifier", () => {
    let licenseVerifier: LicenseVerifier;

    beforeEach(() => {
        licenseVerifier = new LicenseVerifier();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should verify a repo with LGPLv2.1 license correctly", async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);

        // Mocking the readFile method to return a mock license text
        (fsPromises.readFile as jest.Mock).mockResolvedValue("This is a mock GNU Lesser General Public License v2.1 content");

        const result = await licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");

        expect(result).toBeTruthy();
    });

    it("should return false for a repo without LGPLv2.1 license", async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);

        (fsPromises.readFile as jest.Mock).mockResolvedValue("This is some other mock license content");

        const result = await licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");

        expect(result).toBeFalsy();
    });

    it("should throw an error for an invalid GitHub URL", async () => {
        await expect(licenseVerifier.verifyLicense("https://invalid.com/mockOwner/mockRepo"))
            .rejects.toThrow("GitHub URL was invalid in verifyLicense");
    });

    it("should verify a repo with LGPLv2.1 license in README.md correctly", async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);
        // Mock `readFile` to first reject for LICENSE.md and then return mock license for README.md
        (fsPromises.readFile as jest.Mock)
            .mockRejectedValueOnce({code: "ENOENT"})
            .mockResolvedValue("This is a mock GNU Lesser General Public License v2.1 content in README");

        const result = await licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeTruthy();
    });

    it("should return false when neither LICENSE.md nor README.md exist", async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);
        // Mock both files to not exist
        (fsPromises.readFile as jest.Mock).mockRejectedValue({code: "ENOENT"});

        const result = await licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeFalsy();
    });

    it("should handle an error other than ENOENT in repoHasLicense", async () => {
        // Suppress the console.error messages for this test
        const originalConsoleError = console.error;
        console.error = jest.fn();

        (git.clone as jest.Mock).mockResolvedValue(true);
        (fsPromises.readFile as jest.Mock).mockRejectedValue(new Error("Some random error"));

        const result = await licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");

        expect(result).toBeFalsy();

        // Restore the original console.error function after the test
        console.error = originalConsoleError;
    });


    it("should handle nested directories during cleanup", async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);
        // Mock nested directories
        const directory = {name: "nested", isDirectory: jest.fn().mockReturnValue(true)};
        (fsPromises.readdir as jest.Mock).mockResolvedValueOnce([directory]).mockResolvedValueOnce([]);

        // Provide a mock license in LICENSE.md to ensure the code proceeds to cleanup
        (fsPromises.readFile as jest.Mock).mockResolvedValue("This is a mock GNU Lesser General Public License v2.1 content");

        const result = await licenseVerifier.verifyLicense("https://github.com/mockOwner/mockRepo");
        expect(result).toBeTruthy();
    });
});
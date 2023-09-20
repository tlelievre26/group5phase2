import "reflect-metadata";
import { LicenseVerifier } from "../../../src/services/license-verifier";
import * as git from "isomorphic-git";
import fs from "fs";


// Mocks
jest.mock('isomorphic-git');
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        readdir: jest.fn().mockResolvedValue([]),
        unlink: jest.fn(),
        rmdir: jest.fn(),
        stat: jest.fn().mockResolvedValue(true),
    }
}));

const { promises: fsPromises } = fs;

describe('LicenseVerifier', () => {
    let licenseVerifier: LicenseVerifier;

    beforeEach(() => {
        licenseVerifier = new LicenseVerifier();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should verify a repo with LGPLv2.1 license correctly', async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);

        // Mocking the readFile method to return a mock license text
        (fsPromises.readFile as jest.Mock).mockResolvedValue('This is a mock GNU Lesser General Public License v2.1 content');

        const result = await licenseVerifier.verifyLicense('https://github.com/mockOwner/mockRepo');

        expect(result).toBeTruthy();
    });

    it('should return false for a repo without LGPLv2.1 license', async () => {
        (git.clone as jest.Mock).mockResolvedValue(true);

        (fsPromises.readFile as jest.Mock).mockResolvedValue('This is some other mock license content');

        const result = await licenseVerifier.verifyLicense('https://github.com/mockOwner/mockRepo');

        expect(result).toBeFalsy();
    });
});
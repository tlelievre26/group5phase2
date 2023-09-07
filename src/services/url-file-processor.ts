import { injectable, inject } from "tsyringe";
import fs from "fs";

import { NpmUrlResolver } from "./npm-url-resolver";

@injectable()
export class UrlFileProcessor {
    constructor(
        @inject("NpmUrlResolver") private npmUrlResolver: NpmUrlResolver
    ) {
    }

    public processUrlFile(urlFilePath: string): string[] {
        const urls = this.extractUrlsFromFile(urlFilePath);
        // For each url,
        //     if GitHub url
        //         then insert in array
        //     else if npm url
        //         then resolve npm url to GitHub url by invoking NpmUrlResolver and insert in array
        //     else throw error
        return [];
    }

    extractUrlsFromFile(urlFilePath: string): string[] {
        return [];
    }
}
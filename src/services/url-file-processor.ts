import { injectable, inject } from "tsyringe";
import fs from "fs";

import { NpmUrlResolver } from "./npm-url-resolver";

@injectable()
export class UrlFileProcessor {
    constructor(
        @inject("NpmUrlResolver") private npmUrlResolver: NpmUrlResolver
    ) {
    }

    processUrlFile(urlFilePath: string): string[] {

        return [];
    }
}
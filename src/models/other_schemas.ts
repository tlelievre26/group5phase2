export type RepoIdentifier = {
    owner: string;
    repo: string;
};
export type ExtractedMetadata = {
    "package.json": Buffer;
    "README"?: Buffer;
    "LICENSE"?: Buffer;
}

export type ExtractedPackage = {
    metadata: ExtractedMetadata;
    contents: Buffer;
}
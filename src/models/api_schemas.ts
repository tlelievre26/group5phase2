//Wrote this entire thing with 1 GPT command, its kinda insane

/**
 * Package schema.
 */
export interface Package {
    metadata: PackageMetadata;
    data: PackageData;
}

/**
 * PackageMetadata schema.
 * The "Name" and "Version" are used as a unique identifier pair when uploading a package.
 * The "ID" is used as an internal identifier for interacting with existing packages.
 */
export interface PackageMetadata {
    Name: PackageName; // Package name
    Version: string; // Package version
    ID: PackageID; // Unique ID for use with the /package/{id} endpoint.
}

/**
 * PackageData schema.
 * This is a "union" type.
 * - On package upload, either Content or URL should be set. If both are set, returns 400.
 * - On package update, exactly one field should be set.
 * - On download, the Content field should be set.
 */
export interface PackageData {
    Content?: string; // Package contents
    URL?: string; // Package URL (for use in public ingest)
    JSProgram?: string; // A JavaScript program (for use with sensitive modules)
}

/**
 * User schema.
 */
export interface User {
    name: string;
    isAdmin: boolean; // Is this user an admin?
}

/**
 * UserAuthenticationInfo schema.
 * Authentication info for a user.
 */
export interface UserAuthenticationInfo {
    password: string; // Password for a user
}

/**
 * PackageID schema.
 */
export type PackageID = string;

/**
 * PackageRating schema.
 * Package rating (cf. Project 1).
 */
export interface PackageRating {
    BusFactor: number;
    Correctness: number;
    RampUp: number;
    ResponsiveMaintainer: number;
    LicenseScore: number;
    GoodPinningPractice: number; // The fraction of its dependencies that are pinned
    PullRequest: number; // The fraction of project code introduced through pull requests with a code review.
    NetScore: number; // Scores calculated from other seven metrics.
}

/**
 * PackageHistoryEntry schema.
 * One entry of the history of this package.
 */
export interface PackageHistoryEntry {
    User: User;
    Date: string; // Date of activity using ISO-8601 Datetime standard in UTC format.
    PackageMetadata: PackageMetadata;
    Action: 'CREATE' | 'UPDATE' | 'DOWNLOAD' | 'RATE';
}

/**
 * PackageName schema.
 * Name of a package.
 */
export type PackageName = string;

/**
 * AuthenticationToken schema.
 * The spec permits you to use any token format you like.
 */
export type AuthenticationToken = string;

/**
 * AuthenticationRequest schema.
 */
export interface AuthenticationRequest {
    User: User;
    Secret: UserAuthenticationInfo;
}

/**
 * SemverRange schema.
 */
export type SemverRange = string;

/**
 * PackageQuery schema.
 */
export interface PackageQuery {
    Version: SemverRange;
    Name: PackageName;
}

/**
 * EnumerateOffset schema.
 * Offset in pagination.
 */
export type EnumerateOffset = string;

/**
 * PackageRegEx schema.
 */
export interface PackageRegEx {
    RegEx: string; // A regular expression over package names and READMEs used for searching for a package
}
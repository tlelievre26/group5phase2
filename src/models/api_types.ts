//Wrote this entire thing with 1 GPT command, its kinda insane
import * as t from 'io-ts';


/**
 * PackageData schema.
 * This is a "union" type.
 * - On package upload, either Content or URL should be set. If both are set, returns 400.
 * - On package update, exactly one field should be set.
 * - On download, the Content field should be set.
 */
export const PackageData = t.partial( {
    Content: t.union([t.string, t.null]), // Package contents
    URL:   t.union([t.string, t.null]), // Package URL (for use in public ingest)
    JSProgram: t.union([t.string, t.null]) // A JavaScript program (for use with sensitive modules)
})
//NEED to use partial to have optional fields

/**
 * PackageMetadata schema.
 * The "Name" and "Version" are used as a unique identifier pair when uploading a package.
 * The "ID" is used as an internal identifier for interacting with existing packages.
 */

export const PackageMetadata = t.type({
    Name: t.string, // Package name
    Version: t.string, // Package version
    ID: t.string // Unique ID for use with the /package/{id} endpoint.
})

/**
 * Package schema.
 */
export const Package = t.type({ 
    metadata: PackageMetadata,
    data: PackageData
})

/**
 * User schema.
 */
export const User = t.type({
    name: t.string,
    isAdmin: t.boolean // Is this user an admin?
})


/**
 * UserAuthenticationInfo schema.
 * Authentication info for a user.
 */
export const UserAuthenticationInfo = t.type({
    password: t.string // Password for a user
})


/**
 * PackageRating schema.
 * Package rating (cf. Project 1).
 */
export const PackageRating = t.type({
    BusFactor: t.number,
    Correctness: t.number,
    RampUp: t.number,
    ResponsiveMaintainer: t.number,
    LicenseScore: t.number,
    GoodPinningPractice: t.number, // The fraction of its dependencies that are pinned
    PullRequest: t.number, // The fraction of project code introduced through pull requests with a code review.
    NetScore: t.number // Scores calculated from other seven metrics.
})


/**
 * AuthenticationRequest schema.
 */
export const AuthenticationRequest = t.type({
    User: User,
    Secret: UserAuthenticationInfo
})



const PackageQueryVersion = t.partial({
    Version: t.union([t.string, t.null])
})

const PackageQueryName = t.type({
    Name: t.string
})

/**
 * PackageQuery schema.
 */
export const PackageQuery = t.intersection([PackageQueryVersion, PackageQueryName])

//Have to do this with the seperate definitions in order to get only 1 field to be optional

/**
 * PackageRegEx schema.
 */
export const PackageRegEx = t.type({
    RegEx: t.string // A regular expression over package names and READMEs used for searching for a package
})

export const UserPermissions = t.type({
    canUpload: t.boolean,
    canSearch: t.boolean,
    canDownload: t.boolean
})

export const UserRegistrationInfo = t.type({
    User: User,
    Secret: UserAuthenticationInfo,
    Permissions: UserPermissions
})
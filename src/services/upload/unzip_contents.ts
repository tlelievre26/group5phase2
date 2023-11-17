import JSZip from 'jszip';
import { ExtractedMetadata, ExtractedPackage } from '../../models/other_schemas';
import logger from "../../utils/logger";

/**
 * Extracts package.json, README.md, and LICENSE.md files from a base64-encoded zip file, 
 * uploads the zip file to S3, and returns the contents of package.json as a dictionary.
 * @param contents - Base64-encoded string of the zip file contents
 * @returns A dictionary containing the contents of package.json, README.md, and LICENSE.md as Buffers in an object called metadata and the entire package contents as buffer
 */
export async function decodeB64ContentsToZip(contents: string): Promise<ExtractedPackage> {

    // Decode the base64 encoded zip content into a binary string
    const zipData = atob(contents);
    logger.debug("Decoded zip data successfully");

    // Create a JSZip instance and load the decoded data
    const pkg_zip = new JSZip();
    await pkg_zip.loadAsync(zipData, { base64: false });
    logger.debug("Loaded data into JSZip object successfully");

    // We have now loaded the zip file into memory

    //DEBLOATING HERE


    const extractedContents = await extractFromZip(pkg_zip);

    // Upload the zip file binary to S3
    const zipBinary = Buffer.from(zipData, 'binary') //Converts the binary string into a Buffer for upload to S3
    //await uploadToS3("group5phase2packages", `${package_info.name}/${package_info.name}.zip`, zipBinary);


    //Want to pass the package.json info all the way up so it can be used with scoring and create the metadata for the response object
    return { metadata: extractedContents, contents: zipBinary };
}


/**
 * Extracts package.json, README.md, and LICENSE.md files from a JSZip object and returns their contents as a dictionary.
 * @param zip - A JSZip object containing the zip file contents
 * @returns A dictionary containing the contents of package.json, README.md, and LICENSE.md as Buffers
 */
async function extractFromZip(zip: JSZip): Promise<ExtractedMetadata> {
    // Extracts the package.json, README.md, and LICENSE.md files from the zip
    //Returns a dictionary containing their contents as Buffers


    //NOTE: should use the above version once I figure out how to deal with the extra folder in there
    const package_json_match = /^[^/]*\/package\.json$/i //Regex to match the package.json file
    //Can only match file in the root directory

    const readme_match = [ //Regex for several possible names for a readme
        /^[^/]*\/readme\.md$/i,
        /^[^/]*\/readme\.txt$/i,
        /^[^/]*\/readme$/i,
        /^[^/]*\/readme_[a-z]{2}\.md$/i 
    ]
    const license_match = [ //Regex for several possible names of a license
        /^[^/]*\/license$/i,
        /^[^/]*\/license\.txt$/i,
        /^[^/]*\/license\.md$/i,
        /^[^/]*\/copying$/i,
        /^[^/]*\/copying\.txt$/i,
        /^[^/]*\/copying\.md$/i
    ]

    const retrieved_files: ExtractedMetadata = {
        "package.json": Buffer.from(""), //Empty placeholders
        //There might not always be a license or a readme, so don't want to specify those yet
    };

    let found_pkg_json = false;

    for (const [filename, file] of Object.entries(zip.files)) {
        //Iterates through file objects and their names, checking if they match one of the regexes
        //Stores it in our directionary if it does
        //console.log(filename)
        if (package_json_match.test(filename) && !found_pkg_json) {
            found_pkg_json = true
            const fileData = await file.async('nodebuffer');
            retrieved_files["package.json"] = fileData; //*****ideally should be using retrieved_files[filename]*****
            logger.debug(`Successfully retrieved package.json file called ${filename} from zip`);
        }
        else {
            if(!retrieved_files.hasOwnProperty("LICENSE")) {
                for (const pattern of license_match) {
                    if (pattern.test(filename)) {
                      const fileData = await file.async('nodebuffer');
                      retrieved_files["LICENSE"] = fileData;
                      logger.debug("Successfully retrieved LICENSE file from zip");
                      break;
                    }
                }
            }

            if(!retrieved_files.hasOwnProperty("README")) { //If we haven't matched the file to either of the previous 2 patterns
                for (const pattern of readme_match) {
                    if (pattern.test(filename)) {
                      const fileData = await file.async('nodebuffer');
                      retrieved_files["README"] = fileData;
                      logger.debug("Successfully retrieved README file from zip");
                      break;
                    }
                }
            }
        }
    }
    // const package_json_obj = JSON.parse(retrieved_files["package.json"].toString());
    // logger.debug("Successfully parsed package.json file into JSON object");

    // const dir_name = package_json_obj.name
    // for(const [filename, file] of Object.entries(retrieved_files)) {
    //     await uploadToS3("group5phase2packages", `${dir_name}/metadata/${filename}`, file);
    //     logger.debug(`Successfully uploaded ${filename} to S3 under key ${dir_name}/metadata/${filename}`);
    // }

    return retrieved_files;
}

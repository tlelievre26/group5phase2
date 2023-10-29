import JSZip from 'jszip';
import uploadToS3 from './s3upload';
import logger from "../../utils/logger";

//Probably have to add a TON of logging to this

export async function uploadBase64Contents(contents: string) {
    // Decode the base64 encoded zip content into a binary string
    const zipData = atob(contents);
    logger.debug("Decoded zip data successfully");

    // Create a JSZip instance and load the decoded data
    const zip = new JSZip();
    await zip.loadAsync(zipData, { base64: false });
    logger.debug("Loaded data into JSZip object successfully");

    // We have now loaded the zip file into memory

    //DEBLOATING HERE

    const package_info = await extractFromZip(zip);

    // Upload the zip file binary to S3
    const zipBinary = Buffer.from(zipData, 'binary') //Converts the binary string into a Buffer for upload to S3
    await uploadToS3("group5phase2packages", `${package_info.name}/${package_info.name}.zip`, zipBinary);

    //Want to pass the package.json info all the way up so it can be used with scoring and create the metadata for the response object
    return package_info;
    
}



async function extractFromZip(zip: JSZip) {
    // Extracts the package.json, README.md, and LICENSE.md files from the zip
    //Returns the name of the S3 directory where the full binary can be saved

    // const package_json_match = /^package\.json$/i //Regex to match the package.json file
    // const readme_match = [ //Regex for several possible names for a readme
    //     /^ readme\.md$/i,
    //     /^readme\.txt$/i,
    //     /^readme$/i,
    //     /^readme_[a-z]{2}\.md$/i 
    // ]
    // const license_match = [ //Regex for several possible names of a license
    //     /^license$/i,
    //     /^license\.txt$/i,
    //     /^license\.md$/i,
    //     /^copying$/i,
    //     /^copying\.txt$/i,
    //     /^copying\.md$/i
    // ]

    //NOTE: should use the above version once I figure out how to deal with the extra folder in there
    const package_json_match = /package\.json$/i //Regex to match the package.json file
    const readme_match = [ //Regex for several possible names for a readme
        /readme\.md$/i,
        /readme\.txt$/i,
        /readme$/i,
        /readme_[a-z]{2}\.md$/i 
    ]
    const license_match = [ //Regex for several possible names of a license
        /license$/i,
        /license\.txt$/i,
        /license\.md$/i,
        /copying$/i,
        /copying\.txt$/i,
        /copying\.md$/i
    ]

    const retrieved_files: { [key: string]: Buffer } = {}; //Dictionary that will store the filedata of each file we retrieve


    for (const [filename, file] of Object.entries(zip.files)) {
        //Iterates through file objects and their names, checking if they match one of the regexes
        //Stores it in our directionary if it does
        //console.log(filename)
        if (package_json_match.test(filename)) {
            const fileData = await file.async('nodebuffer');
            retrieved_files["package.json"] = fileData; //*****ideally should be using retrieved_files[filename]*****
            logger.debug("Successfully retrieved package.json file from zip");
        }
        else {
            for (const pattern of license_match) {
                if (pattern.test(filename)) {
                  const fileData = await file.async('nodebuffer');
                  retrieved_files["README"] = fileData;
                  console.log(filename)
                  logger.debug("Successfully retrieved LICENSE file from zip");
                  break;
                }
            }
            if(!retrieved_files.hasOwnProperty(filename)) { //If we haven't matched the file to either of the previous 2 patterns
                for (const pattern of readme_match) {
                    if (pattern.test(filename)) {
                      const fileData = await file.async('nodebuffer');
                      retrieved_files["LICENSE"] = fileData;
                      logger.debug("Successfully retrieved README file from zip");
                      break;
                    }
                }
            }
        }
    }
    const package_json_obj = JSON.parse(retrieved_files["package.json"].toString());
    logger.debug("Successfully parsed package.json file into JSON object");

    const dir_name = package_json_obj.name
    for(const [filename, file] of Object.entries(retrieved_files)) {
        await uploadToS3("group5phase2packages", `${dir_name}/metadata/${filename}`, file);
        logger.debug(`Successfully uploaded ${filename} to S3 under key ${dir_name}/metadata/${filename}`);
    }

    return package_json_obj;
}
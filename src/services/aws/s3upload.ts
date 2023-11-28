import { ExtractedPackage } from "../../models/other_schemas";
import aws_s3 from "../../utils/aws_sdk_setup";
import logger from "../../utils/logger";


export default async function uploadToS3(package_contents: ExtractedPackage, pkg_ID: string): Promise<string> {

    const bucketName = 'group5phase2packages';
    const dir_name = JSON.parse(package_contents.metadata["package.json"].toString()).name;
    logger.debug("Successfully parsed package.json file into JSON object");
    

    for(const [filename, file] of Object.entries(package_contents.metadata)) {
        const uploadParams = {
            Bucket: bucketName,
            Key: `${pkg_ID}/metadata/${filename}`,
            Body: file
        };
        aws_s3.upload(uploadParams, function(err: Error | null) {
            if (err) {
                logger.error('Error uploading file to S3:', err);
            } else {
                logger.debug(`Successfully uploaded ${filename} to S3 under key ${pkg_ID}/metadata/${filename}`);
            }
        });

    }

    const uploadParams = {
        Bucket: bucketName,
        Key: `${pkg_ID}/${dir_name}.zip`,
        Body: package_contents.contents
    };
    aws_s3.upload(uploadParams, function(err: Error | null) {
        if (err) {
            logger.error('Error uploading file to S3:', err);
        } else {
            logger.debug(`Successfully uploaded contents to S3 under key ${pkg_ID}/${dir_name}.zip`);
        }
    });

    return `${pkg_ID}/${dir_name}.zip`
}



// // Example usage
// const bucketName = 'my-bucket';
// const key = 'path/to/my/file.zip';
// const base64Zip = 'UEsDBAoAAAAA...'; // base64-encoded zip folder
// await saveToS3(bucketName, key, base64Zip);

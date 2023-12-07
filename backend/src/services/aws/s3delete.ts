import aws_s3 from "../../utils/aws_sdk_setup";
import logger from "../../utils/logger";

/**
 * Deletes a package from an S3 bucket.
 * @param pkg_ID - The ID of the package to delete.
 * @param pkg_name - The name of the package to delete.
 */
export async function deleteFromS3(pkg_ID: string, pkg_name: string) {

    const bucketName = 'group5phase2packages';
    const del_params = {
        Bucket: bucketName, /* required */
        Delete: { /* required */
          Objects: [ /* required */
            {
              Key: `${pkg_ID}/${pkg_name}.zip`, /* required */
            },
            {
                Key: `${pkg_ID}/metadata/LICENSE`, /* required */
            },
            {
                Key: `${pkg_ID}/metadata/package.json`, /* required */
            },
            {
                Key: `${pkg_ID}/metadata/README`, /* required */
            },
          ]
          
        }
      };
    aws_s3.deleteObjects(del_params, function(err, data) {
        if (err) logger.error(err, err.stack); // an error occurred
        else {
            // logger.debug(data);           // successful response
            logger.debug(`Successfully deleted ${pkg_ID} from S3`);
        }     
    });
}

/**
 * Deletes all packages from an S3 bucket.
 */
export async function wipeS3packages() {
  try {
    const bucketName = 'group5phase2packages';
    // List all objects in the bucket
    const objects = await aws_s3.listObjectsV2({ Bucket: bucketName }).promise();

    // Delete each object in the bucket
    if (objects.Contents) {
      for (const obj of objects.Contents) {
        await aws_s3.deleteObject({ Bucket: bucketName, Key: obj.Key! }).promise();
        logger.debug(`Deleted object: ${obj.Key}`);
      }
    }

    logger.debug('All objects deleted successfully.');
  } catch (error) {
    logger.error('Error deleting objects:', error);
  }
}
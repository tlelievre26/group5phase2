import aws_s3 from "../../utils/aws_sdk_setup";
import logger from "../../utils/logger";


export default async function deleteFromS3(pkg_ID: string) {

    const bucketName = 'group5phase2packages';
    const del_params = {
        Bucket: bucketName, /* required */
        Delete: { /* required */
          Objects: [ /* required */
            {
              Key: `${pkg_ID}/${pkg_ID}.zip`, /* required */
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
        if (err) console.log(err, err.stack); // an error occurred
        else {
            logger.debug(data);           // successful response
            logger.debug(`Successfully deleted ${pkg_ID} from S3`);
        }     
    });
}
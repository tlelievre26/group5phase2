import { PackageMetadata } from "../../models/api_schemas";
import aws_s3 from "../../utils/aws_sdk_setup";
import logger from "../../utils/logger";

export default async function searchReadmeFilesInS3(regex: RegExp): Promise<PackageMetadata[]> {
    const bucketName = 'group5phase2packages';
    const params = {
        Bucket: bucketName
    };


    //Unfortunately don't have a good way of filtering the responses from the S3 side
    //Have to filter down to just READMEs here instead

    //Note this WILL NOT WORK if we have more than 250 packages bc there is an 1000 key limit on the responses (4 files per package)

    //This also takes insanely long and is a super easy way to get DDOSed
    try {

        const data = await aws_s3.listObjectsV2(params).promise();
        // console.log(data)
        if(data.Contents === undefined){
            return [];
        }
        const readmeFiles = data.Contents!
                .filter((file) => file.Key && file.Key.endsWith('README'))
                .map((file) => file.Key as string);

        const matchingFiles: PackageMetadata[] = [];

        for (const file of readmeFiles) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: file
            };

            const fileData = await aws_s3.getObject(getObjectParams).promise();
            const fileContents = fileData.Body?.toString();

            if (fileContents && regex.test(fileContents)) {
                const id = file.split('/')[0]
                const name = id.split('_')[1]
                const version = id.split('_')[2]
                matchingFiles.push({
                    "Name": name,
                    "Version": version,
                    "ID": id
                });
            }
        }

        return matchingFiles;
    } catch (error) {
        logger.error('Error searching README files in S3:', error);
        throw error;
    }
}
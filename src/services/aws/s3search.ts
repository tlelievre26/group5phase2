import aws_s3 from "../../utils/aws_sdk_setup";
import logger from "../../utils/logger";

export default async function searchReadmeFilesInS3(regex: RegExp): Promise<string[]> {
    const bucketName = 'group5phase2packages';
    const params = {
        Bucket: bucketName,
        Prefix: 'metadata/README'
    };

    try {
        const data = await aws_s3.listObjectsV2(params).promise();
        const readmeFiles = data.Contents || [];

        const matchingFiles: string[] = [];

        for (const file of readmeFiles) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: file.Key as string
            };

            const fileData = await aws_s3.getObject(getObjectParams).promise();
            const fileContents = fileData.Body?.toString();

            if (fileContents && regex.test(fileContents)) {
                matchingFiles.push(file.Key as string);
            }
        }

        return matchingFiles;
    } catch (error) {
        logger.error('Error searching README files in S3:', error);
        throw error;
    }
}
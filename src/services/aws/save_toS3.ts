import AWS from 'aws-sdk';

const s3 = new AWS.S3();

async function saveToS3(bucketName: string, key: string, base64Zip: string): Promise<void> {
    const buffer = Buffer.from(base64Zip, 'base64');
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'application/zip',
    };
    await s3.upload(params).promise();
}

// // Example usage
// const bucketName = 'my-bucket';
// const key = 'path/to/my/file.zip';
// const base64Zip = 'UEsDBAoAAAAA...'; // base64-encoded zip folder
// await saveToS3(bucketName, key, base64Zip);

import aws_s3 from "../../utils/aws_sdk_setup";

export default async function uploadToS3(bucketName: string, key: string, uploadBody: Buffer): Promise<void> {
    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: uploadBody
    };
    aws_s3.upload(uploadParams, function(err: Error | null, data: AWS.S3.ManagedUpload.SendData) {
        if (err) {
            console.error('Error uploading file to S3:', err);
        } else {
            console.log('File uploaded successfully. S3 Location:', data.Location);
        }
    });
    
}

// // Example usage
// const bucketName = 'my-bucket';
// const key = 'path/to/my/file.zip';
// const base64Zip = 'UEsDBAoAAAAA...'; // base64-encoded zip folder
// await saveToS3(bucketName, key, base64Zip);

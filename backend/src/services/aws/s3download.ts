import aws_s3 from "../../utils/aws_sdk_setup";
import logger from "../../utils/logger";
import stream from "stream";

export default async function downloadFromS3(key: string): Promise<string> {
    const bucketName = 'group5phase2packages';
    const downloadParams = {
        Bucket: bucketName,
        Key: key
    };

    //Got this from chatGPT

    //Need to read into a data stream to not overload the memory on AWS

    // Perform the S3 getObject operation asynchronously
    // const contents = await aws_s3.getObject(downloadParams).promise();
    // const base64String = contents.Body?.toString('base64');
    // return base64String!;
    
    // return new Promise<string>((resolve, reject) => {
    //     const base64Data: string[] = [];

    try {
        // Perform the S3 getObject operation asynchronously
        const data = await aws_s3.getObject(downloadParams).promise();
    
        // Stream the S3 object data into a buffer
        const bufferStream = new stream.PassThrough();
        bufferStream.end(data.Body as Buffer);
    
        // Convert the buffer into a Base64 text string
        return new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          bufferStream.on('data', (chunk) => {
            chunks.push(chunk);
          });
    
          bufferStream.on('end', () => {
            const concatenatedBuffer = Buffer.concat(chunks);
            const base64String = concatenatedBuffer.toString('base64');
            resolve(base64String);
          });
    
          bufferStream.on('error', (err) => {
            reject(err);
          });
        });
      } catch (err) {
        console.error('Error fetching and processing file from S3:', err);
        throw err; // Rethrow the error to be handled by the caller
      }

}
import logger from "../../utils/logger";
import axios from "axios";


export async function extractBase64ContentsFromUrl(zipballUrl: string): Promise<string> {

    try {
        //Use axios to get the zipball binary from the URL

        const zipball_data = await axios.get(zipballUrl, { responseType: 'stream' })

        //Need to use a stream because otherwise the memory requirements are too much/the zip file corrupts

        return new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = [];
            zipball_data.data.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
        
            zipball_data.data.on('end', () => {
                const concatenatedBuffer = Buffer.concat(chunks);
                const base64Data = concatenatedBuffer.toString('base64');
                resolve(base64Data);
            });
        
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            zipball_data.data.on('error', (error: any) => {
                console.error('Error streaming data:', error);
                reject(error);
            });
            });



    } catch(error) {
        logger.error("Error retrieving zipball from URL provided by GitHub API:", error)
        throw error
    }              
}
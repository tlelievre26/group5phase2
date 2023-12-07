// apiCalls.js
import { pkgQuery } from "./PkgQuery";
import { pkgByRegEx } from './PkgByRegEx';


export const handleApiRequest = async (searchTerm: string) => {
    try {
        const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0OSwicm9sZXMiOlsic2VhcmNoIl0sImlhdCI6MTcwMTk4MTUxMywiZXhwIjoxNzAyMDE3NTEzfQ.QHmqwYTnJ7sWg8Z3MOeZjMwa0NIXoAugxXDr_UmhbSA';


        const [responseData1, responseData2] = await Promise.all([
            pkgQuery(searchTerm, TOKEN),
            pkgByRegEx(searchTerm, TOKEN)
        ]);

        // Remove null responses
        const validResponses = [responseData1, responseData2].filter(response => response !== null);

        // Concatenate the valid results
        const concatenatedData = validResponses.flat();
        const uniquePackageIds = new Set();

        // Filter out packages with duplicate IDs
        const uniquePackages = concatenatedData.filter(response => {
            if (!uniquePackageIds.has(response.ID)) {
                uniquePackageIds.add(response.ID);
                return true;
            }
            return false;
        });

        return uniquePackages;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

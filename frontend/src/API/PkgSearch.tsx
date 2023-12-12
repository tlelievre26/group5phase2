// apiCalls.js
import { pkgQuery } from "./PkgQuery";
import { pkgByRegEx } from './PkgByRegEx';
import { useAuth } from "../components/AuthContext";

export const handleApiRequest = async (searchTerm: string, TOKEN: string) => {
    try {
        // const { authResult } = useAuth();
        // const TOKEN = authResult?.token;
        const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0OSwicm9sZXMiOlsic2VhcmNoIl0sImlhdCI6MTcwMTk4MTUxMywiZXhwIjoxNzAyMDE3NTEzfQ.QHmqwYTnJ7sWg8Z3MOeZjMwa0NIXoAugxXDr_UmhbSA';

        let responseData
        if (searchTerm[0] == '/') {
            searchTerm = searchTerm.replace('/', '');
            responseData = await pkgByRegEx(searchTerm, TOKEN)
        } else {
            responseData = await pkgQuery(searchTerm, TOKEN);
        }
        // const [responseData1, responseData2] = await Promise.all([
        //     pkgQuery(searchTerm, TOKEN),
        //     pkgByRegEx(searchTerm, TOKEN)
        // ]);

        // Remove null responses
        const validResponses = [responseData].filter(response => response !== null);

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

// apiCall2.js
import { useAuth } from "../components/AuthContext";
export const pkgByID = async (searchTerm: string, TOKEN: string) => {
    try {
        const response = await fetch(`/package/${searchTerm}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': TOKEN,
            },
        });

        if (!response.ok) {
            console.error('Error in API call 2:', response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error in API call 2:', error);
        return null;
    }
};

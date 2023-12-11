import { useAuth } from "../components/AuthContext";
export const UploadPkg = async (searchTerm: string, isURL: string, TOKEN: string) => {

    const body = isURL == 'url' ? { "URL": searchTerm } : { "Content": searchTerm };
    try {
        const response = await fetch(`http://127.0.0.1:3000/package`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': TOKEN,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('Error in API call 3:', response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error in API call 3:', error);
        return null;
    }
};

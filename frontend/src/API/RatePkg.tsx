import { useAuth } from "../components/AuthContext";
export const RatePkg = async (pkgId: string, TOKEN: string) => {

    try {
        const response = await fetch(`http://127.0.0.1:3000/package/${pkgId}/rate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': TOKEN,
            },
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

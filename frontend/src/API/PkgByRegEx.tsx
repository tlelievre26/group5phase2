// apiCall3.js
export const pkgByRegEx = async (searchTerm: string, TOKEN: string) => {
    try {
        const response = await fetch(`/package/byRegEx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': TOKEN,
            },
            body: JSON.stringify({ "RegEx": searchTerm }),
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

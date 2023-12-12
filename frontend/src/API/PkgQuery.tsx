// apiCall1.js
export const pkgQuery = async (searchTerm: string, TOKEN: string) => {
    try {
        const response = await fetch(`/packages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': TOKEN,
            },
            body: JSON.stringify([{ "Name": searchTerm }]),
        });

        if (!response.ok) {
            console.error('Error in API call 1:', response.statusText);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error in API call 1:', error);
        return null;
    }
};

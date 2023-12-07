// apiCall1.js
export const pkgQuery = async (searchTerm: String, TOKEN: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/packages`, {
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

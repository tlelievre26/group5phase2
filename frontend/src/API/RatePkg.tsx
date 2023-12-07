export const RatePkg = async (pkgId: String) => {
    const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0OSwicm9sZXMiOlsic2VhcmNoIl0sImlhdCI6MTcwMTk4MTUxMywiZXhwIjoxNzAyMDE3NTEzfQ.QHmqwYTnJ7sWg8Z3MOeZjMwa0NIXoAugxXDr_UmhbSA';
    try {
        const response = await fetch(`http://127.0.0.1:8000/package/${pkgId}/rate`, {
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

// apiCall2.js
export const pkgByID = async (searchTerm: String) => {
    const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1MCwicm9sZXMiOlsiZG93bmxvYWQiXSwiaWF0IjoxNzAxOTgxNTE0LCJleHAiOjE3MDIwMTc1MTR9.wYYypz5PYKlO_7U6D4Jage3nj4tUgVu1kADzj83FUFE';
    try {
        const response = await fetch(`http://127.0.0.1:8000/package/${searchTerm}`, {
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

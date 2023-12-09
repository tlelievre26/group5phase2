export const ResetRegistry = async () => {
    const API_URL = `http://127.0.0.1:8000/package/reset`; 
    const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0Nywicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzAxOTc1MjMyLCJleHAiOjE3MDIwMTEyMzJ9.YJ_5y1blQlZWGWQxP6X0GAZEP37I2cCdQHcH7wXARX8'

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': TOKEN,
            },
        });

        if (!response.ok) {
            console.error('Error in API call to reset package registry:', response.statusText);
            return null;
        }

        return await response.text();
    } catch (error) {
        console.error('Error in API call to reset package registry:', error);
        return null;
    }
};


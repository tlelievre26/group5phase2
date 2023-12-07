export const DeletePkg = async (searchID: String) => {
    const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0Nywicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzAxOTc1MjMyLCJleHAiOjE3MDIwMTEyMzJ9.YJ_5y1blQlZWGWQxP6X0GAZEP37I2cCdQHcH7wXARX8'
    try {
        const response = await fetch(`http://127.0.0.1:8000/package/${searchID}`, {
            method: 'DELETE',
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

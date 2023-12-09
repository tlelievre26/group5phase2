export const Auth = async (name: String, password: String) => {
    const reqBody = { "User": { "name": name, "isAdmin": true }, "Secret": { "password": password } };
    try {
        const response = await fetch(`http://127.0.0.1:3000/authenticate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'authorization': '',
            },
            body: JSON.stringify(reqBody),
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
export const UploadPkg = async (searchTerm: String, isURL: String) => {
    const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0OCwicm9sZXMiOlsidXBsb2FkIl0sImlhdCI6MTcwMTk3NzMxOSwiZXhwIjoxNzAyMDEzMzE5fQ.yHiESGbOJUais114q5wASw6evQPoVTpFROZ38veeM7U'
    const body = isURL == 'url' ? { "URL": searchTerm } : { "content": searchTerm };
    try {
        const response = await fetch(`http://127.0.0.1:8000/package`, {
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

import { useAuth, AuthContext } from "../components/AuthContext";

const DeletePkg = async (searchID: String, TOKEN: string) => {
// const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1Niwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzAyMDUzOTMyLCJleHAiOjE3MDIwODk5MzJ9.ha1X69Kg3bofwmpi4QM1av79d6Hp500YBQEgBCpTTns'
// const { authResult } = useAuth();
// console.log(authResult);
// const TOKEN = authResult?.token;
    try {
        const response = await fetch(`http://127.0.0.1:3000/package/${searchID}`, {
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
export default DeletePkg;
export const Auth = async (name: string, password: string) => {
    const reqBody = { "User": { "name": name, "isAdmin": true }, "Secret": { "password": password } };
  
    try {
      const response = await fetch(`/authenticate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': '',
        },
        body: JSON.stringify(reqBody),
      });
  
      if (!response.ok) {
        // If the response status is not OK, throw an error with the status text
        throw new Error(`API error: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      // Log the error and return null or propagate the error further
      console.error('Error in API call:', error);
      throw error;
    }
  };
  
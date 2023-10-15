import * as schemas from "./models/api_schemas"
import express, { Application, Request, Response } from 'express';

//Built using chatGPT

const app: Application = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to get a list of packages
app.post('/packages', (req: Request, res: Response) => {

    //Get any packages fitting the query. Search for packages satisfying the indicated query.

    //If you want to enumerate all packages, provide an array with a single PackageQuery whose name is "*".

    //The response is paginated; the response header includes the offset to use in the next query.

    // Request body schema: schemas.PackageQuery[]
    // Response schema: schemas.PackageMetadata[]
    // Query parameter: offset (optional) - schemas.EnumerateOffset
    


    res.send('List of packages');
});

// Endpoint to reset the registry
app.delete('/reset', (req: Request, res: Response) => {
  // Handle the DELETE request for /reset
  // Check 'X-Authorization' header for permissions
  // Reset the registry to a default state

  // Replace with your implementation
  res.send('Registry is reset');
});

// Endpoint to retrieve a specific package by ID
app.get('/package/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // Handle the GET request for /package/:id
  // Retrieve the package with the given ID
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send(`Retrieve package with ID: ${id}`);
});

// Endpoint to update a package by ID
app.put('/package/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // Handle the PUT request for /package/:id
  // Update the package with the given ID
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send(`Update package with ID: ${id}`);
});

// Endpoint to delete a package by ID
app.delete('/package/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // Handle the DELETE request for /package/:id
  // Delete the package with the given ID
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send(`Delete package with ID: ${id}`);
});

// Endpoint to create a new package
app.post('/package', (req: Request, res: Response) => {
  // Handle the POST request for /package
  // Create a new package based on the request data
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send('Package is created');
});

// Endpoint to get the rating of a package by ID
app.get('/package/:id/rate', (req: Request, res: Response) => {
  const { id } = req.params;

  // Handle the GET request for /package/:id/rate
  // Retrieve the rating of the package with the given ID
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send(`Get rating for package with ID: ${id}`);
});

// Endpoint to authenticate and obtain an access token
app.put('/authenticate', (req: Request, res: Response) => {
  // Handle the PUT request for /authenticate
  // Authenticate the user and return an access token
  // Check 'X-Authorization' header for authentication support

  // Replace with your implementation
  res.send('Access token is obtained');
});

// Endpoint to get the history of a package by name
app.get('/package/byName/:name', (req: Request, res: Response) => {
  const { name } = req.params;

  // Handle the GET request for /package/byName/:name
  // Retrieve the history of the package with the given name
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send(`Get history for package with name: ${name}`);
});

// Endpoint to delete all versions of a package by name
app.delete('/package/byName/:name', (req: Request, res: Response) => {
  const { name } = req.params;

  // Handle the DELETE request for /package/byName/:name
  // Delete all versions of the package with the given name
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send(`Delete all versions of package with name: ${name}`);
});

// Endpoint to get packages based on a regular expression
app.post('/package/byRegEx', (req: Request, res: Response) => {
  // Handle the POST request for /package/byRegEx
  // Retrieve packages based on the provided regular expression
  // Check 'X-Authorization' header for authentication

  // Replace with your implementation
  res.send('Get packages based on regular expression');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
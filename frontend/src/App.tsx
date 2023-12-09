
import SearchBar from './components/SearchBar';
import React, { useState, useEffect, useContext } from 'react';
import NavigationBar from "./components/NavigationBar";
import ProjectCard from "./components/ProjectCard";
import ProjectDescriptionPage from "./components/ProjectDesc";
import LeftPanel from "./components/LeftPanel";
import * as schemas from "./models/api_schemas"
import { handleApiRequest } from './API/PkgSearch';
import { RatePkg } from './API/RatePkg';
import LoginForm from './components/LoginForm';
import { useAuth } from './components/AuthContext';
import { AuthContext } from './components/AuthContext';
function App() {

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<schemas.PackageMetadata[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const { authResult } = useAuth(); // Use the useAuth hook to get the authentication status
  let authResult1 = authResult;
  if (authResult) {
    authResult1 = authResult.replaceAll("\"", "");
  }
  // console.log("Deversh");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);



  const handleSearch = async (searchTerm: string) => {
    setSearchTerm(searchTerm);

    // Fetch package metadata
    const result = await handleApiRequest(searchTerm, authResult1);
    if (result !== null) {
      setData(result);

      // Fetch scores based on the ID from the result
      const scoresPromises = result.map(async (item) => {
        const response = await RatePkg(item?.ID, authResult1);
        return { ...response, ID: item?.ID }; // Add the ID field to the response
      });

      // Wait for all promises to resolve
      const scoresResponses = await Promise.all(scoresPromises);

      // Remove null responses and add ID field
      const validResponses = scoresResponses.filter(response => response !== null);

      // Concatenate the valid results
      const concatenatedData = validResponses.flat();

      setScores(concatenatedData);
    }
  };

  useEffect(() => {
    if (searchTerm !== '') {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);
  useEffect(() => {
    if (authResult) {
      setIsLoggedIn(true);
    }
  }, [authResult]);

  return (
    <div>
      <NavigationBar />
      <div className="container mx-auto mt-8 py-4">
        {isLoggedIn ? (
          // Render content only if the user is logged in
          <>
            <SearchBar onSearch={handleSearch} />
            <div className="container mx-auto mt-8 py-4">
              {/* Render ProjectCard components based on the data */}
              {data.map((item, index) => (
                <ProjectCard
                  key={index}
                  Name={item.Name}
                  Version={item.Version}
                  ID={item.ID}
                  Scores={scores.filter(score => score.ID === item.ID)} // Pass scores data to ProjectCard
                />
              ))}
            </div>
          </>
        ) : (
          // Render login form if the user is not logged in
          <div className="container mx-auto mt-8 py-4">
            <LoginForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
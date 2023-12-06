
import SearchBar from './components/SearchBar';
import React, { useState } from 'react';
import NavigationBar from "./components/NavigationBar";
import ProjectCard from "./components/ProjectCard";
import ProjectDescriptionPage from './components/ProjectDesc';
import LeftPanel from "./components/LeftPanel";
function App() {
  
  // let items = ["package1", "package2", "package3"];
  // let package_name = "GitHub Package Name";
  // let package_description = "this is a package";

  const handleSelectItem = (item: string) => {
    console.log(item);
  }
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };
  return <div>
    <NavigationBar ></NavigationBar>
    <div className="container mx-auto mt-8 py-4">
      <SearchBar onSearch={handleSearch} />
    </div>

    <ProjectCard />
    <ProjectCard />
    <ProjectCard />
    {/* <ProjectDescriptionPage /> */}


  </div >
}

export default App;
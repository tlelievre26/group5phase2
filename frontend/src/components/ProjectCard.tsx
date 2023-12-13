// Import statements for your dependencies and components
import React, { useState, MouseEvent } from 'react';
import UpdateForm from './UpdateForm';
import { pkgByID } from '../API/PkgbyID';
import { useAuth } from './AuthContext';
import JSZip from 'jszip';

interface ProjectCardProps {
  Name: string;
  Version: string;
  ID: string;
  Scores: {
    BusFactor: number;
    Correctness: number;
    RampUp: number;
    ResponsiveMaintainer: number;
    GoodPinningPractice: number;
    PullRequest: number;
    NetScore: number;
  }[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ Name, Version, ID, Scores }) => {
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState<boolean>(false);
  const { authResult } = useAuth();
  const authResult1 = authResult ? authResult.replaceAll("\"", "") : '';

  const handleUpdateClick = () => {
    setIsUpdateFormOpen(true);
  };

  const handleUpdateFormClose = () => {
    setIsUpdateFormOpen(false);
  };

  const handleDownloadClick = async () => {
    try {
      const result = await pkgByID(ID, authResult1);

      if (result !== null) {
        const bzip = atob(result.data.Content);
        const zip = new JSZip();

        zip.file('package.zip', atob(result.data.Content), { binary: true });

        const blob = await zip.generateAsync({ type: 'blob' });

        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = 'package.zip';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
      } else {
        console.error('Error in Download API call:', 'Failed to fetch package details.');
      }
    } catch (error) {
      console.error('Error in Download API call:', error);
    }
  };

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (event.currentTarget.id === 'updateButton') {
      handleUpdateClick();
    } else if (event.currentTarget.id === 'downloadButton') {
      handleDownloadClick();
    }
  };

  return (
    <div className="flex justify-end items-start px-5 py-4 relative">
      <div className="w-full bg-white p-6 rounded-lg shadow-md transition-transform hover:shadow-lg transform hover:scale-95 hover:bg-gray-200">
        <div className="absolute top-0 right-0 flex space-x-2 mt-2 mr-2">
          <button 
            id="updateButton"
            role="button"
            aria-label="Update Package"
            onClick={handleButtonClick}
            className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
          >
            Update
          </button>
          <button
            id="downloadButton"
            role="button"
            aria-label="Download Package"
            onClick={handleButtonClick}
            className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 focus:outline-none focus:shadow-outline-green"
          >
            Download
          </button>
        </div>
        <h2 className="text-xl font-bold mb-2">Name: {Name}</h2>
        <h2 className="text-xl font-bold mb-2">Version: {Version}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">Ratings:</span>
          <div className="flex items-center">
            {Scores.map((score, index) => (
              <div key={index} className="flex flex-row items-center space-y-1">
                <div className="text-sm p-2">{`Bus Factor: ${score.BusFactor}`}</div>
                {/* ... (your existing Score elements) */}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isUpdateFormOpen && (
        <UpdateForm
          onClose={handleUpdateFormClose}
          Name={Name}
          ID={ID}
          Version={Version}
        />
      )}
    </div>
  );
};

export default ProjectCard;

import React, { useState } from 'react';
import * as schemas from "../models/api_schemas";
import { pkgByID } from '../API/PkgbyID';
import UpdateForm from './UpdateForm';
import { useAuth } from './AuthContext';
import { FaAutoprefixer } from 'react-icons/fa';
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
    const handleUpdateClick = () => {
        setIsUpdateFormOpen(true);
    };
    const handleUpdateFormClose = () => {
        setIsUpdateFormOpen(false);
    };
    const { authResult } = useAuth();
    let authResult1 = authResult;
    if (authResult) {
        authResult1 = authResult.replaceAll("\"", "");
    }

    const handleDownloadClick = async () => {
        try {
            // Call the API to get package details by ID
            const result = await pkgByID(ID, authResult1);

            if (result !== null) {
                // Handle the API response as needed
                console.log('Download API Response:', result);
                const bzip = atob(result.data.Content)
                const zip = new JSZip();

                // Add the binary content to the zip file
                zip.file('package.zip', atob(result.data.Content), { binary: true });

                // Generate a Blob from the zip file
                const blob = await zip.generateAsync({ type: 'blob' });

                // Create a download link
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = 'package.zip'; // Specify the desired file name

                // Trigger the download
                document.body.appendChild(downloadLink);
                downloadLink.click();

                // Clean up
                document.body.removeChild(downloadLink);
                // Implement the logic to handle the download based on the API response
            } else {
                console.error('Error in Download API call:', 'Failed to fetch package details.');
            }
        } catch (error) {
            console.error('Error in Download API call:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter') {
        // Handle pressing Enter on the button
        if (e.currentTarget.id === 'updateButton') {
          handleUpdateClick();
        } else if (e.currentTarget.id === 'downloadButton') {
          handleDownloadClick();
        }
      }
    };

    return (
        <div className="flex justify-end items-start px-5 py-4 relative">
            {/* Update and Download buttons */}


            <div className="w-full bg-white p-6 rounded-lg shadow-md transition-transform hover:shadow-lg transform hover:scale-95 hover:bg-gray-200">
                {/* Project Name */}
                <div className="absolute top-0 right-0 flex space-x-2 mt-2 mr-2">
                <button
                    id="updateButton"
                    onClick={handleUpdateClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue"
                  >
                    Update
                  </button>
                  <button
                    id="downloadButton"
                    onClick={handleDownloadClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green"
                  >
                    Download
                  </button>
                </div>
                <h2 className="text-xl font-bold mb-2">Name: {Name}</h2>
                <h2 className="text-xl font-bold mb-2">Version: {Version}</h2>

                {/* Ratings */}
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">Ratings:</span>

                    <div className="flex items-center">
                        {/* Display the scores */}
                        {Scores.map((score, index) => (
                            <div key={index} className="flex flex-row items-center space-y-1">
                                {/* Display individual score properties */}
                                <div className="text-sm p-2">{`Bus Factor: ${score.BusFactor}`}</div>
                                <div className="text-sm p-2">{`Correctness: ${score.Correctness}`}</div>
                                <div className="text-sm p-2">{`Ramp Up: ${score.RampUp}`}</div>
                                <div className="text-sm p-2">{`Responsive Maintainer: ${score.ResponsiveMaintainer}`}</div>
                                <div className="text-sm p-2">{`Good Pinning Practice: ${score.GoodPinningPractice}`}</div>
                                <div className="text-sm p-2">{`Pull Request: ${score.PullRequest}`}</div>
                                <div className="text-sm p-2">{`Net Score: ${score.NetScore}`}</div>
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
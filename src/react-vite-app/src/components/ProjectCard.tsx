import React from 'react';

const ProjectCard = () => {
    return (
        <div className="flex  justify-end items-start px-5 py-4">
            <div className="w-full bg-white p-6 rounded-lg shadow-md transition-transform hover:shadow-lg transform hover:scale-95 hover:bg-gray-200">
                {/* Project Name */}
                <h2 className="text-xl font-bold mb-2">Project Name</h2>

                {/* Project Description */}
                <p className="text-gray-600 mb-4">
                    One line description of the project goes here.
                </p>

                {/* Ratings */}
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">Ratings:</span>
                    <div className="flex items-center">
                        {/* Replace the values (A, B, C) with your actual rating data */}
                        <span className="mr-2 px-1">A</span>
                        <div className="bg-gray-300 h-2 w-8"></div>

                        <span className="mx-2 px-1">B</span>
                        <div className="bg-gray-300 h-2 w-12"></div>

                        <span className="ml-2 px-1">C</span>
                        <div className="bg-gray-300 h-2 w-6"></div>
                    </div>
                </div>

                {/* Author */}
                <div className="mt-4">
                    <span className="text-gray-500">Author: John Doe</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
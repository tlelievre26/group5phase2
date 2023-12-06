import React from 'react';
import '../App.css';

const versions = [
    'v1.0.0',
    'v2.0.0',
    'v3.0.0'
    // Add more version numbers as needed
];

const ProjectDescriptionPage = () => {
    return (
        <div className="flex h-screen bg-white">
            {/* Readme Section */}
            <div className="w-4/5 bg-white p-6 overflow-y-auto border-r border-gray-300">
                {/* README content goes here */}
                <h1 className="text-2xl font-bold mb-4">Project Name</h1>
                <p className="text-gray-600 mb-4">
                    Welcome to the project! This is a brief overview of what the project is about.
                </p>
                {/* ... More README content */}

                {/* Versions Section */}
                <div className="text-center mt-6">
                    <h2 className="text-xl font-bold mb-2">Versions</h2>
                    <div className="flex justify-center">
                        {versions.map((version, index) => (
                            <a
                                key={index}
                                href={`https://github.com/your-username/your-project/releases/tag/${version}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-2 text-blue-600 hover:underline"
                            >
                                {version}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Project Information Section */}
            <div className="flex-1 p-6 flex flex-col">
                {/* GitHub Link */}
                <div className="mb-2 py-3 text-center hover:underline text-blue-600">
                    <a
                        href="https://github.com/your-username/your-project"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                        style={{ textDecoration: 'none' }}
                    >
                        GitHub Repository
                    </a>
                </div>

                {/* NPM Link */}
                <div className="mb-2 py-3 text-center hover:underline text-blue-600">
                    <a
                        href="https://www.npmjs.com/package/your-package"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                        style={{ textDecoration: 'none' }}
                    >
                        NPM Package
                    </a>
                </div>

                {/* Author Name */}
                <div className="text-center py-3">
                    <p className="font-bold">Author:</p>
                    <p className="text-gray-600">John Doe</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectDescriptionPage;
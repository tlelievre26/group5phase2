
import React, { useState } from 'react';
import "../App.css"
import UploadForm from './UploadForm';
import DeleteForm from './DeleteForm';
import Login from './LoginForm';
import { Auth } from '../API/Auth';
import { ResetPkg } from '../API/Reset';
import { useAuth } from './AuthContext';
const NavigationBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { authResult } = useAuth();
    let authResult1 = authResult;
    if (authResult) {
        authResult1 = authResult.replaceAll("\"", "");
    }
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogin = (result: { success: boolean; data?: any; error?: string }) => {
        // Add your login logic here
        if (result.success) {
            // Handle successful login
            console.log('User authenticated');

        } else {
            // Handle failed login
            console.error('Authentication failed:', result.error);
        }

    };

    const handleAddPackageClick = () => {
        // Set the state to true when "Add Package" is clicked
        setShowUploadForm(true);
    };
    const handleDeletePackageClick = () => {
        // Set the state to true when "Add Package" is clicked
        setShowDeleteForm(true);
    };
    const handleResetClick = async () => {
        // Call your reset endpoint here

        try {
            // Call the API to get package details by ID
            const result = await ResetPkg(authResult1);
            console.log(result);
            if (result !== null) {
                // Handle the API response as needed
                console.log('Successfully deleted:', result);
                // Implement the logic to handle the download based on the API response
            } else {
                console.error('Error in delete API call:', 'Failed to fetch package details.');
            }
        } catch (error) {
            console.error('Error in deleted API call:', error);
        }
    };
    return (
        <nav className="bg-gray-800 p-4 w-full">
            <div className="container mx-auto flex justify-between items-center w-full">
                <div className="text-white font-bold text-xl">ECE 461 REST APIs</div>

                {/* Mobile Menu Button */}
                <div className="block lg:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none focus:shadow-outline"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        </svg>
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-4">
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }} onClick={handleAddPackageClick}>
                        Add package
                    </a>
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }} onClick={handleDeletePackageClick}>
                        Delete Package
                    </a>
                    <button className="text-red-500" onClick={handleResetClick}>
                        Reset
                    </button>

                    {/* Conditionally render the upload form based on the state */}
                    {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
                    {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}
                    {/* <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white p-2 rounded">
                        Open Login Modal
                    </button>
                    {isOpen && (
                        <Login isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLogin={handleLogin} />
                    )} */}
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden">
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }} onClick={handleAddPackageClick}>
                        Add package
                    </a>
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }} onClick={handleDeletePackageClick}>
                        Delete Package
                    </a>
                    <button className="text-red-500" onClick={handleResetClick}>
                        Reset
                    </button>
                    {/* Conditionally render the upload form based on the state */}
                    {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
                    {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}
                </div>
            )
            }
        </nav >
    );
};


export default NavigationBar;

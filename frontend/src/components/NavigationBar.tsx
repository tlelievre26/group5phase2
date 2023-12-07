
import React, { useState } from 'react';
import "../App.css"
import UploadForm from './UploadForm';
import DeleteForm from './DeleteForm';
const NavigationBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);

    const handleAddPackageClick = () => {
        // Set the state to true when "Add Package" is clicked
        setShowUploadForm(true);
    };
    const handleDeletePackageClick = () => {
        // Set the state to true when "Add Package" is clicked
        setShowDeleteForm(true);
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

                    {/* Conditionally render the upload form based on the state */}
                    {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
                    {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}
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

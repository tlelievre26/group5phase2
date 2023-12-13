import React, { useState } from 'react';
import '../App.css';
import UploadForm from './UploadForm';
import DeleteForm from './DeleteForm';
import ResetForm from './ResetForm';
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
  const [showResetForm, setShowResetForm] = useState(false);  // Add state for ResetForm

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
    setShowUploadForm(true);
  };

  const handleDeletePackageClick = () => {
    setShowDeleteForm(true);
  };

  const handleResetClick = () => {
    // Set the state to true when "Reset" is clicked
    setShowResetForm(true);
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
         
          <button
            className="text-white bg-red-500 font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
            onClick={handleResetClick}
          >
            Reset
          </button>


          {/* Conditionally render the upload, delete, and reset forms based on the state */}
          {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
          {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}
          {showResetForm && <ResetForm />}

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
          <button
            className="text-white bg-red-500 font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
            onClick={handleResetClick}
          >
            Reset
          </button>

          {/* Conditionally render the upload, delete, and reset forms based on the state */}
          {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
          {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}
          {showResetForm && <ResetForm />}

        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
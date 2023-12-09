// src/components/NavigationBar.tsx
import React, { useState } from 'react';
import ResetForm from './ResetForm'; 
import UploadForm from './UploadForm';
import DeleteForm from './DeleteForm';
import "../App.css";

const NavigationBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAddPackageClick = () => {
    setShowUploadForm(true);
  };

  const handleDeletePackageClick = () => {
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
          <a
            href="#"
            className="text-white"
            style={{ textDecoration: 'none' }}
            onClick={handleAddPackageClick}
          >
            Add package
          </a>
          <a
            href="#"
            className="text-white"
            style={{ textDecoration: 'none' }}
            onClick={handleDeletePackageClick}
          >
            Delete Package
          </a>

          {/* Conditionally render the upload form based on the state */}
          {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
          {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}

          {/* Add the ResetButton component here */}
          <ResetForm />
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden">
          <a
            href="#"
            className="text-white"
            style={{ textDecoration: 'none' }}
            onClick={handleAddPackageClick}
          >
            Add package
          </a>
          <a
            href="#"
            className="text-white"
            style={{ textDecoration: 'none' }}
            onClick={handleDeletePackageClick}
          >
            Delete Package
          </a>

          {/* Conditionally render the upload form based on the state */}
          {showUploadForm && <UploadForm onClose={() => setShowUploadForm(false)} />}
          {showDeleteForm && <DeleteForm onClose={() => setShowDeleteForm(false)} />}
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;

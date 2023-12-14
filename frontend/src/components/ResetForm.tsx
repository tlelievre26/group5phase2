import React, { useState } from 'react';
import { ResetPkg } from '../API/Reset';
import { useAuth } from './AuthContext';

interface ResetFormProps {
  onClose: () => void;
}

const ResetForm: React.FC<ResetFormProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { authResult } = useAuth();
  let authResult1 = authResult;
  if (authResult) {
    authResult1 = authResult.replaceAll("\"", "");
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const handleReset = () => {
    // Open the confirmation pop-up when the button is clicked
    setConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    // Close the confirmation pop-up
    setConfirmationOpen(false);
  };

  const handleConfirmReset = async () => {
    try {
      // Call the API function to reset the package registry
      const result = await ResetPkg(authResult1);

      if (result) {
        // Handle success, e.g., display a success message
        console.log('Package registry reset successfully:', result);
      } else {
        // Handle failure, e.g., display an error message
        console.error('Failed to reset package registry.');
      }
    } catch (error) {
      console.error('Error resetting package registry:', error);
    }

    // Close the confirmation pop-up after confirming
    setConfirmationOpen(false);
    onClose(); // Close the ResetForm
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      handleCloseConfirmation();
    }
  };

  return (
    <div>
      <button
        className="text-white bg-red-600 font-bold py-2 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
        onClick={handleReset}
      >
        Reset Package Registry
      </button>

      {isConfirmationOpen && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <h2 className="text-2xl font-bold mb-4">Reset Confirmation</h2>
          <p>Are you sure you want to reset the package registry?</p>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleConfirmReset}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
            >
              Confirm
            </button>
            <button
              onClick={handleCloseConfirmation}
              className="ml-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetForm;

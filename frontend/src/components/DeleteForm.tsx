import React, { useState } from 'react';
import DeletePkg from '../API/DeletePkg';
import { useAuth } from './AuthContext';
interface DeleteFormProps {
  onClose: () => void;
}

const DeleteForm: React.FC<DeleteFormProps> = ({ onClose }) => {
  const [packageId, setPackageId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { authResult } = useAuth();
  let authResult1 = authResult;
  if (authResult) {
      authResult1 = authResult.replaceAll("\"", "");
  }

  const handleSubmit = async () => {
    try {
      if (packageId) {
        // Call the API to delete the package
        if(await DeletePkg(packageId, authResult1)) {
          alert('Successfully deleted!');
        }
        else {
          setErrorMessage('Failed to delete the given package');
        }
        // Display a success message or perform other actions


        onClose();
      } else {
        setErrorMessage('Please provide the package ID.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.'); // Provide a more user-friendly error message
      // Handle the error as needed
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0} // Make the div focusable
    >
      <h2 className="text-2xl font-bold mb-4">Delete Package</h2>

      <label className="block mb-4">
        Package ID:
        <input
          id="packageIdInput"
          type="text"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          aria-describedby="packageIdError"
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
        />
      </label>

      {errorMessage && (
        <p id="packageIdError" className="text-red-600 mb-4" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
        >
          Delete
        </button>
        <button
          onClick={onClose}
          className="ml-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DeleteForm;

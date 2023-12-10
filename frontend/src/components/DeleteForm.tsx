import React, { useState } from 'react';
import DeletePkg from '../API/DeletePkg';
import { useAuth } from './AuthContext';
interface DeleteFormProps {

    onClose: () => void;
}

const DeleteForm: React.FC<DeleteFormProps> = ({ onClose }) => {
    const [packageId, setPackageId] = useState('');
    const { authResult } = useAuth();
    let authResult1 = authResult;
    if (authResult) {
        authResult1 = authResult.replaceAll("\"", "");
    }
    const handleSubmit = async () => {
        try {
            if (packageId) {
                // Call the API to delete the package
                await DeletePkg(packageId, authResult1);

                // Display a success message or perform other actions
                alert('Successfully deleted!');

                onClose();
            } else {
                alert('Please provide the package ID.');
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle the error as needed
        }
    };

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50">
            <h2 className="text-2xl font-bold mb-4">Delete Package</h2>

            <label className="block mb-4">
                Package ID:
                <input
                    type="text"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
                />
            </label>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:shadow-outline-red"
                >
                    Delete
                </button>
                <button
                    onClick={onClose}
                    className="ml-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:shadow-outline-gray"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default DeleteForm;

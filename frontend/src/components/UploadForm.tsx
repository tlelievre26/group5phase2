import React, { useState } from 'react';
import { UploadPkg } from '../API/UploadPkg';
interface UploadFormProps {
    onClose: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onClose }) => {
    const [uploadOption, setUploadOption] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [contentInput, setContentInput] = useState('');

    const handleSubmit = async () => {
        try {
            if (uploadOption && (urlInput || contentInput)) {
                console.log(`Selected Option: ${uploadOption}`);
                console.log(`Input: ${uploadOption === 'url' ? urlInput : contentInput}`);

                // Call the API based on uploadOption and input
                const response = await UploadPkg(
                    uploadOption === 'url' ? urlInput : contentInput,
                    uploadOption
                );

                if (response !== null) {
                    // Handle the API response as needed
                    console.log('API Response:', response);
                    alert('Successfully uploaded!');
                }

                onClose();
            } else {
                alert('Please select an upload option and provide the required input.');
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle the error as needed
        }
    };


    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50">
            <h2 className="text-2xl font-bold mb-4">Upload Options</h2>

            <label className="block mb-4 px-2">
                <input
                    type="radio"
                    value="url"
                    checked={uploadOption === 'url'}
                    onChange={() => setUploadOption('url')}
                />
                Upload with URL
            </label>

            <label className="block mb-4 px-2">
                <input
                    type="radio"
                    value="content"
                    checked={uploadOption === 'content'}
                    onChange={() => setUploadOption('content')}
                />
                Upload with Content
            </label>

            {uploadOption === 'url' && (
                <label className="block mb-4">
                    URL:
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
                    />
                </label>
            )}

            {uploadOption === 'content' && (
                <label className="block mb-4">
                    Content:
                    <textarea
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
                    ></textarea>
                </label>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue"
                >
                    Submit
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

export default UploadForm;

import React, { useState, useEffect } from 'react';
import { UploadPkg } from '../API/UploadPkg';
import { useAuth } from './AuthContext';
interface UploadFormProps {
  onClose: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onClose }) => {
    const [uploadOption, setUploadOption] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [contentInput, setContentInput] = useState('');
    const [focusedElement, setFocusedElement] = useState<string | null>(null);
    const { authResult } = useAuth();
    let authResult1 = authResult;
    if (authResult) {
        authResult1 = authResult.replaceAll("\"", "");
    }
    const handleSubmit = async () => {
        try {
            if (uploadOption && (urlInput || contentInput)) {
                console.log(`Selected Option: ${uploadOption}`);
                console.log(`Input: ${uploadOption === 'url' ? urlInput : contentInput}`);

                // Call the API based on uploadOption and input
                const response = await UploadPkg(
                    uploadOption === 'url' ? urlInput : contentInput,
                    uploadOption,
                    authResult1
                );

                if (response !== null) {
                    // Handle the API response as needed
                    console.log('API Response:', response);
                    alert('Successfully uploaded!');
                }
        onClose();
      } else {
        setErrorMessage('Please select an upload option and provide the required input.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.'); // Provide a more user-friendly error message
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          handleSubmit();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit, onClose]);

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50"
      role="dialog"
      aria-labelledby="uploadFormTitle"
      aria-live="polite"
    >
      <h2 id="uploadFormTitle" className="text-2xl font-bold mb-4">
        Upload Options
      </h2>

      <fieldset className="mb-4">
        <legend className="sr-only">Upload Option</legend>
        <div>
          <input
            type="radio"
            id="uploadOptionUrl"
            value="url"
            checked={uploadOption === 'url'}
            onChange={() => setUploadOption('url')}
            onFocus={() => setFocusedElement('uploadOptionUrl')}
            onBlur={() => setFocusedElement(null)}
            aria-labelledby="uploadOptionUrlLabel"
          />
          <label
            htmlFor="uploadOptionUrl"
            id="uploadOptionUrlLabel"
            className={`${
              focusedElement === 'uploadOptionUrl' ? 'focus-visible' : ''
            } ${uploadOption === 'url' ? 'bg-gray-100' : ''}`}
          >
            Upload with URL
          </label>
        </div>

        <div>
          <input
            type="radio"
            id="uploadOptionContent"
            value="content"
            checked={uploadOption === 'content'}
            onChange={() => setUploadOption('content')}
            onFocus={() => setFocusedElement('uploadOptionContent')}
            onBlur={() => setFocusedElement(null)}
            aria-labelledby="uploadOptionContentLabel"
          />
          <label
            htmlFor="uploadOptionContent"
            id="uploadOptionContentLabel"
            className={`${
              focusedElement === 'uploadOptionContent' ? 'focus-visible' : ''
            } ${uploadOption === 'content' ? 'bg-gray-100' : ''}`}
          >
            Upload with Content
          </label>
        </div>
      </fieldset>

      {uploadOption === 'url' && (
        <label className="block mb-4">
          URL:
          <input
            type="text"
            id="urlInput"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
            aria-labelledby="urlInputLabel"
          />
        </label>
      )}

      {uploadOption === 'content' && (
        <label className="block mb-4">
          Content:
          <textarea
            id="contentInput"
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
            aria-labelledby="contentInputLabel"
          ></textarea>
        </label>
      )}

      {errorMessage && (
        <p id="errorMessage" className="text-red-600 mb-4" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          aria-label="Submit"
        >
          Submit
        </button>
        <button
          onClick={onClose}
          className="ml-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UploadForm;

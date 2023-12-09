import React, { useState } from 'react';
import { UpdatePkg } from '../API/UpdatePkg'; // Import the UpdatePkg API function

interface UpdateFormProps {
  onClose: () => void;
  Name: string;
  ID: string;
  Version: string;
}

const UpdateForm: React.FC<UpdateFormProps> = ({ onClose, Name, ID, Version }) => {
  const [updateOption, setUpdateOption] = useState<'url' | 'content'>('url'); // Updated to use a union type for updateOption
  const [updateInput, setUpdateInput] = useState<string>('');
  const [isUpdateButtonFocused, setIsUpdateButtonFocused] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      if (updateOption && updateInput) {
        const response = await UpdatePkg({ Name, Version, ID, value: updateInput, type: updateOption });

        if (response !== null) {
          console.log('Update API Response:', response);
        } else {
          console.error('Error in Update API call:', 'Failed to update package.');
        }
      } else {
        console.error('Error in Update API call:', 'Please select an update option and provide the required input.');
      }
    } catch (error) {
      console.error('Error in Update API call:', error);
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50">
      <h2 className="text-2xl font-bold mb-4">Update Options</h2>

      <label className="block mb-4">
        <input
          type="radio"
          value="url"
          checked={updateOption === 'url'}
          onChange={() => setUpdateOption('url')}
        />
        Update with URL
      </label>

      <label className="block mb-4">
        <input
          type="radio"
          value="content"
          checked={updateOption === 'content'}
          onChange={() => setUpdateOption('content')}
        />
        Update with Content
      </label>

      {updateOption === 'url' && (
        <label className="block mb-4">
          URL:
          <input
            type="text"
            value={updateInput}
            onChange={(e) => setUpdateInput(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
          />
        </label>
      )}

      {updateOption === 'content' && (
        <label className="block mb-4">
          Content:
          <textarea
            value={updateInput}
            onChange={(e) => setUpdateInput(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-blue-500"
          ></textarea>
        </label>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue ${isUpdateButtonFocused ? 'focus-visible' : ''}`}
          onFocus={() => setIsUpdateButtonFocused(true)}
          onBlur={() => setIsUpdateButtonFocused(false)}
        >
          Update
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

export default UpdateForm;
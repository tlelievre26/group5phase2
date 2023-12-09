import React, { useState } from 'react';

const ResetForm: React.FC = () => {
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const handleReset = () => {
    // Open the confirmation pop-up when the button is clicked
    setConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    // Close the confirmation pop-up
    setConfirmationOpen(false);
  };

  const handleConfirmReset = () => {
    // Add logic to reset the package here
    console.log('Resetting the package...');

    // Close the confirmation pop-up after confirming
    setConfirmationOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      handleCloseConfirmation();
    }
  };

  return (
    <div>
       <button
        className="bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus-visible:ring hover:bg-red-600"
        onClick={handleReset}
        role="button"
        aria-label="Reset Package Registry"
        tabIndex={0} // Ensure the button is focusable
      >
        Reset Package Registry
      </button>


      {isConfirmationOpen && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-md shadow-md z-50"
          onKeyDown={handleKeyDown}
          tabIndex={0} // Make the div focusable
        >
          <h2 className="text-2xl font-bold mb-4">Reset Confirmation</h2>
          <p>Are you sure you want to reset the package registry?</p>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleConfirmReset}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
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

import React, { ChangeEvent, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
  };

  const handleSearchButtonClick = () => {
    // Call the onSearch function only when the button is pressed
    onSearch(searchTerm);
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="text"
        placeholder="Search for packages use / before pkg name for regex"
        className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-blue-500 w-full"
        onChange={handleInputChange}
      />
      <button
        className="bg-blue-500 text-white px-3 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue flex items-center"
        onClick={handleSearchButtonClick} // Add click event handler
      >
        <FaSearch className="flex item-center" />
      </button>
    </div>
  );
};

export default SearchBar;

import React, { ChangeEvent, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [isLabelVisible, setLabelVisible] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    onSearch(searchTerm);
  };

  return (
    <div className="relative flex items-center space-x-4">
      <input
        type="text"
        placeholder="Search for packages"
        className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-blue-500 w-full"
        onChange={handleInputChange}
      />
      <button
        type="submit"
        aria-label="Search"
        aria-haspopup="true"
        role="tooltip"
        className="bg-blue-500 text-white px-3 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue flex items-center relative group"
        onClick={() => onSearch('')}
        onMouseEnter={() => setLabelVisible(true)}
        onMouseLeave={() => setLabelVisible(false)}
      >
        <FaSearch className="flex item-center" />
        {isLabelVisible && (
          <span className="absolute bg-white text-gray-600 p-2 opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2">
            Search
          </span>
        )}
      </button>
    </div>
  );
};

export default SearchBar;

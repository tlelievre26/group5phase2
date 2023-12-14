import React, { ChangeEvent, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLabelVisible, setLabelVisible] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
  };

  const handleSearchButtonClick = () => {
    onSearch(searchTerm);
  };

  const handleSearchButtonKeydown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchTerm);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      setLabelVisible(true);
    }
  };

  const handleSearchButtonFocus = () => {
    setLabelVisible(true);
  };

  const handleSearchButtonBlur = () => {
    setLabelVisible(false);
  };

  const handleSearchButtonMouseEnter = () => {
    setLabelVisible(true);
  };

  const handleSearchButtonMouseLeave = () => {
    setLabelVisible(false);
  };

  return (
    <div className="relative flex items-center space-x-4">
      <label htmlFor="searchInput" className="sr-only">
        Search for packages
      </label>
      <input
        id="searchInput"
        type="text"
        placeholder="Search for packages use / before pkg name for regex"
        className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300 w-full"
        onChange={handleInputChange}
        aria-labelledby="searchInput"
      />
      <button
        type="button"
        aria-label="Search"
        aria-haspopup="true"
        className="bg-blue-700 text-white px-3 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue focus:ring focus:ring-blue-300 flex items-center relative"
        onClick={handleSearchButtonClick}
        onKeyDown={handleSearchButtonKeydown}
        onFocus={handleSearchButtonFocus}
        onBlur={handleSearchButtonBlur}
        onMouseEnter={handleSearchButtonMouseEnter}
        onMouseLeave={handleSearchButtonMouseLeave}
        tabIndex={0} //button is focusable
      >
        <FaSearch className="flex item-center" />
        {isLabelVisible && (
          <span className="absolute bg-white text-black p-2 opacity-100 transition-opacity duration-300 bottom-full left-1/2 transform -translate-x-1/2">
            Search
          </span>
        )}
      </button>
    </div>
  );
};

export default SearchBar;

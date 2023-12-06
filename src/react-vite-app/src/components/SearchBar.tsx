
import React, { ChangeEvent } from 'react';
import "../App.css";
import { FaSearch } from 'react-icons/fa';
interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}


const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    onSearch(searchTerm);
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="text"
        placeholder="Search for packages"
        className="border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-blue-500 w-full" // Updated class to w-full
        onChange={handleInputChange}
      />
      <button
        className="bg-blue-500 text-white px-3 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue flex items-center"
        onClick={() => onSearch('')} // You can customize the behavior of the button click
      >
        <FaSearch className="flex item-center" />
      </button>
    </div>
  );
};

export default SearchBar;

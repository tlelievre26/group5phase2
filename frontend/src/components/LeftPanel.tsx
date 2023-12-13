import React from 'react';
import '../App.css';

const LeftPanel: React.FC = () => {
  return (
    <nav className="bg-black text-white p-4">
      <h2 className="text-xl font-bold mb-4">Package Management</h2>
      <ul>
        <li className="mb-2">
          <a href="#" className="hover:underline" role="menuitem">
            Add Packages
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:underline" role="menuitem">
            Delete Packages
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className="hover:underline" role="menuitem">
            Update Packages
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default LeftPanel;

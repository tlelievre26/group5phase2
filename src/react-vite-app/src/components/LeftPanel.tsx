import React from 'react';
import "../App.css";

const LeftPanel = () => {
    return (
        <div className="bg-black text-white p-4">
            <h2 className="text-xl font-bold mb-4">Package Management</h2>
            <ul>
                <li className="mb-2">
                    <a href="#" className="hover:underline">
                        Add Packages
                    </a>
                </li>
                <li className="mb-2">
                    <a href="#" className="hover:underline">
                        Delete Packages
                    </a>
                </li>
                <li className="mb-2">
                    <a href="#" className="hover:underline">
                        Update Packages
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default LeftPanel;
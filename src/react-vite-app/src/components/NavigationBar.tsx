
import React, { useState } from 'react';
import "../App.css"
const NavigationBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <nav className="bg-gray-800 p-4 w-full">
            <div className="container mx-auto flex justify-between items-center w-full">
                <div className="text-white font-bold text-xl">ECE 461 REST APIs</div>

                {/* Mobile Menu Button */}
                <div className="block lg:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none focus:shadow-outline"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            ></path>
                        </svg>
                    </button>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-4">
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }}>Add package</a>
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }}>Delete Package</a>
                    <a href="#" className="text-white" style={{ textDecoration: 'none' }}>Update Package</a>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden">
                    <a href="#" className="block py-2 px-4 text-white " style={{ textDecoration: 'none' }} >Add packages</a>
                    <a href="#" className="block py-2 px-4 text-white " style={{ textDecoration: 'none' }} >Delete packages</a>
                    <a href="#" className="block py-2 px-4 text-white" style={{ textDecoration: 'none' }}>Update packages</a>
                </div>
            )
            }
        </nav >
    );
};


export default NavigationBar;
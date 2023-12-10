// src/LoginForm.js

import React, { FormEvent, useState } from 'react';
import { useAuth } from './AuthContext';
import { Auth } from '../API/Auth'; // Make sure to adjust the path

const LoginForm: React.FC = () => {
    const { authResult, setAuth } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();

        try {
            // Use encodeURIComponent to escape special characters in the password
            const pass = password.replace(/\\(.)/g, '$1');
            const result = await Auth(username, pass);
            setAuth(result);
        } catch (error) {
            console.error('Error during authentication:', error);
            setAuth(null);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Login Form</h2>
                <form onSubmit={handleLogin}>
                    <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2 mt-4">
                        Password:
                    </label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;

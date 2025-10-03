import React, { useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await account.createEmailPasswordSession(email, password);
            } else {
                await account.create(ID.unique(), email, password, name);
                await account.createEmailPasswordSession(email, password);
            }
            window.location.reload(); // Or navigate to dashboard
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4">
            <div className="bg-gray-800/60 p-8 rounded-2xl shadow-2xl shadow-indigo-500/20 w-full max-w-md border border-indigo-500/30 backdrop-blur-sm">
                
                <h2 className="text-4xl font-bold text-center text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Join Us'}
                </h2>
                <p className="text-center text-gray-400 mb-8">
                    {isLogin ? 'Login to access your dashboard' : 'Create an account to get started'}
                </p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-gray-300 mb-2" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-gray-700/50 rounded-lg text-white outline-none border border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-300 mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-700/50 rounded-lg text-white outline-none border border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700/50 rounded-lg text-white outline-none border border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/40"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(''); // Clear error on toggle
                        }} 
                        className="text-purple-400 hover:text-purple-300 font-semibold ml-2 focus:outline-none"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Auth;
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Fabrico</h1>
        <p className="text-xl mb-8">Your premium fabric marketplace</p>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <div className="flex flex-col space-y-4">
            <Link to="/login" className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition">
              Login to Your Account
            </Link>
            <Link to="/register" className="border border-blue-500 text-blue-500 py-3 px-6 rounded-lg hover:bg-blue-50 transition">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
// src/App.jsx

import React from 'react';
import { Toaster } from 'react-hot-toast'; // ইম্পোর্ট ঠিক আছে
import { Outlet } from 'react-router-dom';
import Navbar from './components/Shared/Navbar'; 
import Footer from './components/Shared/Footer'; 

const App = () => {
    return (
        <div className="flex flex-col min-h-screen">
            
            {/* 🔥 Toaster কে রুট Div-এর ভেতরে কিন্তু UI কম্পোনেন্টগুলোর বাইরে রাখুন */}
            <Toaster position="top-center" reverseOrder={false} /> 
            
            <Navbar />
            
            {/* Main Content Area */}
            <main className="flex-grow">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default App;
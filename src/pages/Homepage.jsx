import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Heart, Shield, Droplet } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ১. হিরো / ব্যানার সেকশন */}
            <section className="bg-red-600 text-white py-20 md:py-32 shadow-xl">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fadeIn">
                        রক্ত দিন, জীবন বাঁচান
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 font-light">
                        আপনার এক ফোঁটা রক্ত, কারও জন্য নতুন জীবন।
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <NavLink 
                            to="/donation-requests" 
                            className="btn btn-lg bg-white text-red-600 hover:bg-gray-100 border-none font-bold shadow-lg flex items-center"
                        >
                            <Droplet size={24} className='mr-2' /> জরুরি অনুরোধ দেখুন
                        </NavLink>
                        <NavLink 
                            to="/register" 
                            className="btn btn-lg bg-red-800 text-white hover:bg-red-900 border-2 border-white font-bold shadow-lg flex items-center"
                        >
                            <Shield size={24} className='mr-2' /> ডোনার হিসেবে যোগ দিন
                        </NavLink>
                    </div>
                </div>
            </section>

            {/* ২. দ্রুত সার্চ সেকশন */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">
                        🩸 ডোনার খুঁজুন বা রক্তদানের অনুরোধ করুন
                    </h2>
                    
                    <div className="max-w-xl mx-auto p-6 bg-red-50 rounded-xl shadow-lg border border-red-200">
                        <p className="mb-6 text-gray-600">
                            নির্দিষ্ট ব্লাড গ্রুপ ও জেলার ডোনার খুঁজতে নিচে ক্লিক করুন।
                        </p>
                        <div className="flex justify-center gap-4">
                            <NavLink 
                                to="/search" 
                                className="btn btn-md btn-info text-white flex-1 flex items-center"
                            >
                                <Search size={20} className='mr-2' /> ডোনার সার্চ
                            </NavLink>
                            <NavLink 
                                to="/login" 
                                className="btn btn-md btn-warning text-white flex-1 flex items-center"
                            >
                                <Heart size={20} className='mr-2' /> অনুরোধ পোস্ট করুন
                            </NavLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* ৩. পরিসংখ্যান/ট্রাস্ট সেকশন (উদাহরণস্বরূপ) */}
            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
                        আমাদের অর্জন
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 bg-white rounded-xl shadow-md">
                            <p className="text-5xl font-extrabold text-red-600">12,500+</p>
                            <p className="text-lg text-gray-600 mt-2">মোট ডোনার</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-md">
                            <p className="text-5xl font-extrabold text-red-600">3,800+</p>
                            <p className="text-lg text-gray-600 mt-2">সফল ডোনেশন</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-md">
                            <p className="text-5xl font-extrabold text-red-600">100%</p>
                            <p className="text-lg text-gray-600 mt-2">নিরাপদ ও সুরক্ষিত</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
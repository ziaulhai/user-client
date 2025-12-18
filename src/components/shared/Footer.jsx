// src/components/Shared/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, ChevronRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-10 border-t-4 border-red-600 pt-12 pb-8">
            <div className="container mx-auto px-6">
                {/* মূল গ্রিড লেআউট */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
                    
                    {/* ব্র্যান্ড সেকশন - ন্যাভবারের লোগো স্টাইল অনুযায়ী */}
                    <aside className="md:col-span-3 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="flex items-center space-x-2 group mb-4">
                            <div className="text-red-600 transition-transform group-hover:scale-110 duration-300">
                                <Droplet size={40} fill="currentColor" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className='text-2xl font-black text-red-600 leading-none'>রক্তদান</span>
                                <span className='text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase'>সেবাই আমাদের ধর্ম</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
                            আপনার রক্তদান হতে পারে অন্য একজনের নতুন জীবনের সূচনা। আমাদের সাথে যুক্ত থাকুন।
                        </p>
                        <p className="text-xs text-gray-500 italic">
                            © {new Date().getFullYear()} সকল অধিকার সংরক্ষিত।
                        </p>
                    </aside>
                    
                    {/* পরিষেবাসমূহ */}
                    <nav className="flex flex-col items-center lg:items-start">
                        <header className="text-red-500 font-bold mb-6 uppercase text-sm tracking-widest border-b border-red-900/50 pb-1 w-fit">পরিষেবাসমূহ</header>
                        <div className="flex flex-col gap-4 text-center lg:text-left">
                            <Link to="/donation-requests" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 flex items-center justify-center lg:justify-start gap-2 group text-[15px]">
                                <ChevronRight size={14} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" /> রক্তদানের অনুরোধ
                            </Link>
                            <Link to="/search" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 flex items-center justify-center lg:justify-start gap-2 group text-[15px]">
                                <ChevronRight size={14} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" /> ডোনার অনুসন্ধান
                            </Link>
                            <Link to="/dashboard/create-donation-request" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 flex items-center justify-center lg:justify-start gap-2 group text-[15px]">
                                <ChevronRight size={14} className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity" /> অনুরোধ তৈরি করুন
                            </Link>
                        </div>
                    </nav> 

                    {/* কোম্পানি সেকশন */}
                    <nav className="flex flex-col items-center lg:items-start">
                        <header className="text-red-500 font-bold mb-6 uppercase text-sm tracking-widest border-b border-red-900/50 pb-1 w-fit">কোম্পানি</header>
                        <div className="flex flex-col gap-4 text-center lg:text-left">
                            <Link to="/about" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 text-[15px]">আমাদের সম্পর্কে</Link>
                            <Link to="/contact" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 text-[15px]">যোগাযোগ</Link>
                        </div>
                    </nav> 

                    {/* আইনগত সেকশন */}
                    <nav className="flex flex-col items-center lg:items-start">
                        <header className="text-red-500 font-bold mb-6 uppercase text-sm tracking-widest border-b border-red-900/50 pb-1 w-fit">আইনগত</header>
                        <div className="flex flex-col gap-4 text-center lg:text-left">
                            <Link to="/terms" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 text-[15px]">ব্যবহারের শর্তাবলী</Link>
                            <Link to="/privacy" className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-300 text-[15px]">গোপনীয়তা নীতি</Link>
                        </div>
                    </nav>

                    {/* নিউজলেটার */}
                    <div className="md:col-span-3 lg:col-span-1 flex flex-col items-center lg:items-start">
                        <header className="text-red-500 font-bold mb-6 uppercase text-sm tracking-widest border-b border-red-900/50 pb-1 w-fit">নিউজলেটার</header> 
                        <div className="w-full max-w-sm">
                            <p className="text-xs text-gray-400 mb-4 leading-tight text-center lg:text-left">গুরুত্বপূর্ণ আপডেট পেতে আপনার ইমেল লিখুন</p> 
                            <div className="flex flex-col space-y-3">
                                <input 
                                    type="email" 
                                    placeholder="email@example.com" 
                                    className="input input-bordered bg-gray-800 border-gray-700 text-white w-full focus:outline-none focus:border-red-600 transition-all placeholder:text-gray-600 py-3 px-4 rounded-md" 
                                /> 
                                <button className="w-full bg-red-600 py-3 rounded-md font-bold text-white hover:bg-red-700 shadow-lg shadow-red-900/20 active:scale-95 transition-all">
                                    সাবস্ক্রাইব
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* নিচের অংশ */}
                <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-600 tracking-widest uppercase italic">মানবতার কল্যাণে রক্তদান</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
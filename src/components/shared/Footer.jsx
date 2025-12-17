// src/components/Shared/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer p-10 bg-gray-900 text-white mt-10 border-t-4 border-red-600">
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <nav className="col-span-2 md:col-span-1">
                    <header className="footer-title text-red-500 text-lg">BloodConnect</header>
                    <p className="text-sm text-gray-400">জীবন বাঁচান, রক্তদান করুন।</p>
                    <p className="text-sm text-gray-400 mt-2">© {new Date().getFullYear()} সকল অধিকার সংরক্ষিত।</p>
                </nav>
                
                <nav>
                    <header className="footer-title text-red-500">পরিষেবাসমূহ</header>
                    <Link to="/donation-requests" className="link link-hover">রক্তদানের অনুরোধ</Link>
                    <Link to="/search" className="link link-hover">ডোনার অনুসন্ধান</Link>
                    <Link to="/dashboard/create-donation-request" className="link link-hover">অনুরোধ তৈরি করুন</Link>
                </nav> 
                <nav>
                    <header className="footer-title text-red-500">কোম্পানি</header>
                    <a className="link link-hover">আমাদের সম্পর্কে</a>
                    <a className="link link-hover">যোগাযোগ</a>
                </nav> 
                <nav>
                    <header className="footer-title text-red-500">আইনগত</header>
                    <a className="link link-hover">ব্যবহারের শর্তাবলী</a>
                    <a className="link link-hover">গোপনীয়তা নীতি</a>
                </nav>
                <form className="md:col-span-4 lg:col-span-1">
                    <header className="footer-title text-red-500">নিউজলেটার</header> 
                    <fieldset className="form-control w-full">
                        <label className="label">
                            <span className="label-text text-gray-400">গুরুত্বপূর্ণ আপডেট পেতে আপনার ইমেল লিখুন</span>
                        </label> 
                        <div className="join">
                            <input type="text" placeholder="username@site.com" className="input input-bordered join-item text-gray-900 w-full" /> 
                            <button className="btn bg-red-600 text-white hover:bg-red-700 join-item">সাবস্ক্রাইব</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </footer>
    );
};

export default Footer;
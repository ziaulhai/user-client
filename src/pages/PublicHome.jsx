// src/pages/PublicHome.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../hooks/useAxiosPublic';
import { Heart, User, Droplet, Search, BookOpen } from 'lucide-react';

const PublicHome = () => {
    const axiosPublic = useAxiosPublic();

    // ১. সাইটের সামগ্রিক পরিসংখ্যান ফেচ করা
    const { data: stats = {}, isLoading: isStatsLoading } = useQuery({
        queryKey: ['siteStats'],
        queryFn: async () => {
            // ধরে নেওয়া হলো সার্ভারে একটি পাবলিক রুট আছে যা সামগ্রিক পরিসংখ্যান দেয়।
            const res = await axiosPublic.get('/api/v1/public/site/stats'); 
            return res.data;
        }
    });

    // ২. সাম্প্রতিক (সর্বশেষ ৬টি) ব্লগ পোস্ট ফেচ করা
    const { data: recentBlogs = [], isLoading: isBlogsLoading } = useQuery({
        queryKey: ['recentPublicBlogs'],
        queryFn: async () => {
            // পাবলিকলি প্রকাশিত সর্বশেষ ৬টি পোস্ট (limit=6 করা হলো)
            const res = await axiosPublic.get('/api/v1/public/blogs?status=published&limit=6');
            return res.data;
        }
    });


    const StatCard = ({ icon: Icon, title, value, colorClass }) => (
        <div className={`p-6 rounded-xl shadow-xl text-center border-b-4 ${colorClass} bg-white transition duration-300 hover:scale-[1.02]`}>
            <Icon size={40} className={`mx-auto mb-3 ${colorClass.split(' ')[0]}`}/>
            <div className="text-xs font-semibold uppercase text-gray-500">{title}</div>
            <div className="text-4xl font-extrabold text-gray-800 mt-1">{isStatsLoading ? <span className="loading loading-spinner loading-md"></span> : value}</div>
        </div>
    );

    return (
        <div className="min-h-screen">
            
            {/* --- ১. হিরো সেকশন --- */}
            <section className="hero bg-red-50 py-20 border-b border-red-200">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 leading-tight mb-4">
                        জীবন বাঁচান, <span className="text-red-600">রক্তদান করুন।</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        আপনার প্রয়োজনে সঠিক ডোনারকে খুঁজে নিন অথবা নিজেই একজন জীবনদাতা হোন।
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link 
                            to="/search" 
                            className="btn btn-lg bg-red-600 text-white hover:bg-red-700 font-bold shadow-red-300 shadow-lg"
                        >
                            <Search size={24} className="mr-2"/> ডোনার খুঁজুন
                        </Link>
                        <Link 
                            to="/register" 
                            className="btn btn-lg btn-outline border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold"
                        >
                            <Heart size={24} className="mr-2"/> ডোনার হিসেবে যোগ দিন
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- ২. পরিসংখ্যান সেকশন --- */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-700 mb-10">আমাদের অর্জন</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <StatCard icon={User} title="মোট নিবন্ধিত ডোনার" value={stats.totalDonors || "..."} colorClass="text-red-600 border-red-500"/>
                        <StatCard icon={Droplet} title="সফল রক্তদান" value={stats.totalDonations || "..."} colorClass="text-blue-600 border-blue-500"/>
                        <StatCard icon={Heart} title="জীবন বাঁচানো হয়েছে" value={stats.livesSaved || "..."} colorClass="text-green-600 border-green-500"/>
                    </div>
                </div>
            </section>

            {/* --- ৩. সাম্প্রতিক ব্লগ সেকশন --- */}
            <section className="py-16 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-700 mb-10 flex items-center justify-center">
                        <BookOpen size={30} className='mr-2 text-red-600'/> রক্তদান ও স্বাস্থ্য ব্লগ
                    </h2>

                    {isBlogsLoading ? (
                        <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>
                    ) : recentBlogs.length === 0 ? (
                        <p className="text-center text-gray-500">বর্তমানে কোনো ব্লগ পোস্ট প্রকাশিত হয়নি।</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentBlogs.map(blog => (
                                <div key={blog._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <img 
                                        src={blog.thumbnail || "https://i.ibb.co/3k1w2c7/blog-default.jpg"} 
                                        alt={blog.title} 
                                        className="w-full h-72 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">{blog.content}</p>
                                        <Link 
                                            to={`/blogs/${blog._id}`} 
                                            className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center"
                                        >
                                            সম্পূর্ণ পড়ুন →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="text-center mt-8">
                        <Link to="/blogs" className="btn btn-outline border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                            সকল ব্লগ পোস্ট দেখুন
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicHome;
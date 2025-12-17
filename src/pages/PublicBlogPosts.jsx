// src/pages/PublicBlogPosts.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../hooks/useAxiosPublic';
import { format } from 'date-fns';
import { Heart, User, Calendar, MessageSquare, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const PublicBlogPosts = () => {
    const axiosPublic = useAxiosPublic();

    // 🔥 ১. প্যাগিনেশন স্টেট
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    // ২. শুধুমাত্র প্রকাশিত (Published) ব্লগ পোস্ট ফেচ করা
    const { 
        data: { allPosts = [], totalCount = 0 } = {}, // অবজেক্ট ডিসট্রাকচারিং করে এরর সমাধান করা হয়েছে
        isLoading, 
        isError,
        error 
    } = useQuery({
        queryKey: ['publicBlogPosts', currentPage],
        queryFn: async () => {
            // প্যাগিনেশন প্যারামিটার সহ রিকোয়েস্ট
            const res = await axiosPublic.get('/api/v1/content/blog-posts/all', {
                params: { 
                    status: 'published',
                    page: currentPage,
                    size: itemsPerPage
                }
            });
            return res.data;
        }
    });

    // প্যাগিনেশন ক্যালকুলেশন
    const numberOfPages = Math.ceil(totalCount / itemsPerPage);
    const pages = [...Array(numberOfPages).keys()];

    if (isLoading) {
        return (
            <div className="text-center p-20 min-h-[70vh] flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="text-center p-20 min-h-[70vh]">
                <h2 className="text-3xl font-bold text-red-600">ব্লগ লোডিং এরর!</h2>
                <p className="text-gray-600 mt-4">পোস্ট লোড করার সময় একটি সমস্যা হয়েছে।</p>
                <p className="text-sm text-gray-500 mt-2">এরর: {error.message}</p>
            </div>
        );
    }

    if (allPosts.length === 0) {
        return (
            <div className="text-center p-20 min-h-[70vh]">
                <h2 className="text-3xl font-bold text-gray-700">বর্তমানে কোনো ব্লগ পোস্ট প্রকাশিত হয়নি।</h2>
                <p className="text-gray-500 mt-2">শীঘ্রই নতুন কন্টেন্ট যোগ করা হবে।</p>
            </div>
        );
    }


    return (
        <div className="container mx-auto p-4 md:p-8 my-10">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-red-600 flex items-center justify-center">
                    <BookOpen size={40} className='mr-3' /> রক্তদান ও স্বাস্থ্য ব্লগ
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                    রক্তদানের উপকারিতা, স্বাস্থ্য টিপস এবং জনসচেতনতামূলক লেখা পড়ুন।
                </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allPosts.map((post) => (
                    <div 
                        key={post._id} 
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border-t-4 border-red-500"
                    >
                        {/* থাম্বনেইল */}
                        <figure className="h-52 overflow-hidden">
                            <img 
                                src={post.thumbnail} 
                                alt={post.title} 
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                            />
                        </figure>

                        <div className="p-6">
                            {/* শিরোনাম */}
                            <Link to={`/blogs/${post._id}`} className="hover:text-red-600 transition-colors">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                                    {post.title}
                                </h2>
                            </Link>

                            {/* মেটা ডেটা */}
                            <div className="flex flex-wrap text-xs text-gray-500 mb-4 gap-x-4 gap-y-2">
                                <span className="flex items-center">
                                    <User size={14} className="mr-1 text-red-400"/> {post.authorName || "লেখক"}
                                </span>
                                <span className="flex items-center">
                                    <Calendar size={14} className="mr-1 text-red-400"/> 
                                    {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                </span>
                            </div>

                            {/* সংক্ষিপ্ত বিবরণ */}
                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {post.content} 
                            </p>

                            {/* বিস্তারিত দেখুন বাটন */}
                            <Link 
                                to={`/blogs/${post._id}`} 
                                className="btn btn-sm bg-red-600 text-white hover:bg-red-700 mt-2"
                            >
                                <MessageSquare size={16} /> বিস্তারিত পড়ুন
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🔥 প্যাগিনেশন UI */}
            {numberOfPages > 1 && (
                <div className='flex justify-center items-center gap-2 mt-12 mb-8'>
                    <button 
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className='btn btn-sm btn-outline'
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>

                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`btn btn-sm ${currentPage === page ? 'btn-error text-white border-none' : 'btn-outline'}`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    <button 
                        disabled={currentPage === numberOfPages - 1}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className='btn btn-sm btn-outline'
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicBlogPosts;
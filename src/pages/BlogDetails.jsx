import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '../hooks/useAxiosPublic'; // পাবলিক API কল
import { format } from 'date-fns';
import { User, Calendar, MessageSquare } from 'lucide-react';

// 🔥🔥🔥 সহায়ক ফাংশন: প্লেইন টেক্সট কন্টেন্টকে সঠিক ফরম্যাটে রেন্ডার করার জন্য
// এটি নতুন লাইন (newlines) অক্ষরগুলোকে <br> বা প্যারাগ্রাফে রূপান্তর করার পরিবর্তে 
// CSS ক্লাস ব্যবহার করে যাতে ইনপুট করা ফরম্যাটিং (line breaks) বজায় থাকে।
const renderContent = (content) => {
    if (!content) return null;
    
    // `whitespace-pre-wrap` CSS ক্লাস প্লেইন টেক্সটে থাকা নিউলাইন অক্ষরের ফরম্যাটিং বজায় রাখে।
    return (
        <div 
            className="whitespace-pre-wrap leading-relaxed text-lg text-gray-700"
        >
            {content}
        </div>
    );
};


const BlogDetails = () => {
    const { id } = useParams();
    const axiosPublic = useAxiosPublic();

    // React Query ব্যবহার করে নির্দিষ্ট ব্লগ পোস্টের ডেটা ফেচ করা
    const { data: post = {}, isLoading, error } = useQuery({
        queryKey: ['blogDetails', id],
        queryFn: async () => {
            // পাবলিক রুট: /api/v1/content/blog-posts/:id
            const res = await axiosPublic.get(`/api/v1/content/blog-posts/${id}`);
            return res.data;
        },
        enabled: !!id, // আইডি থাকলে তবেই কোয়েরি চালানো হবে
    });

    if (isLoading) {
        return (
            <div className="text-center p-10 min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 min-h-screen">
                <h2 className="text-2xl font-bold text-red-600">এরর</h2>
                <p>ব্লগ পোস্টটি লোড করা যায়নি। সার্ভার বা নেটওয়ার্ক সমস্যা।</p>
                <Link to="/" className="btn btn-link text-red-600 mt-4">হোম পেজে ফিরে যান</Link>
            </div>
        );
    }
    
    // ব্লগ পোস্ট না পাওয়া গেলে (যেমন: 404) বা প্রকাশিত না হলে (Draft)
    // পাবলিক পেজে শুধুমাত্র Published পোস্ট দেখানো উচিত।
    if (!post._id || post.status !== 'published') {
          return (
             <div className="text-center p-10 min-h-screen">
                 <h2 className="text-2xl font-bold text-gray-700">পোস্টটি খুঁজে পাওয়া যায়নি</h2>
                 <p className="text-gray-500 mt-2">হয় পোস্টটি ডিলিট করা হয়েছে, অথবা এটি এখনও প্রকাশিত হয়নি।</p>
                 <Link to="/" className="btn btn-link text-red-600 mt-4">হোম পেজে ফিরে যান</Link>
             </div>
         );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 my-10 bg-white rounded-xl shadow-2xl">
            
            {/* ব্লগ থাম্বনেইল */}
            {post.thumbnail && (
                <figure className="mb-6 rounded-lg overflow-hidden max-h-96">
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </figure>
            )}

            {/* হেডার ও মেটা ডেটা */}
            <header className="border-b pb-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
                    {post.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-4 text-gray-600 text-sm">
                    {/* লেখক */}
                    <p className="flex items-center">
                        <User size={16} className='mr-2 text-red-500'/>
                        লেখক: <span className='font-semibold ml-1'>{post.authorName || 'অজানা'}</span>
                    </p>
                    {/* প্রকাশের তারিখ */}
                    <p className="flex items-center">
                        <Calendar size={16} className='mr-2 text-red-500'/>
                        প্রকাশের তারিখ: <span className='font-semibold ml-1'>{format(new Date(post.createdAt), 'dd MMMM, yyyy')}</span>
                    </p>
                    {/* স্ট্যাটাস (শুধুমাত্র যদি প্রয়োজন হয়, যদিও এটি পাবলিক পেজ তাই প্রকাশিতই হবে) */}
                    <span className="badge bg-green-100 text-green-700 font-bold">
                        {post.status.toUpperCase()}
                    </span>
                </div>
            </header>

            {/* 🔥 মূল ব্লগ কন্টেন্ট রেন্ডারিং */}
            <section className="text-gray-700">
                {renderContent(post.content)}
            </section>
            
            <footer className="mt-8 pt-4 border-t text-gray-500">
                <MessageSquare size={16} className='inline-block mr-2'/>
                এই পোস্টটি রক্তদান ও স্বাস্থ্য সচেতনতা বৃদ্ধির লক্ষ্যে লেখা হয়েছে।
            </footer>
        </div>
    );
};

export default BlogDetails;
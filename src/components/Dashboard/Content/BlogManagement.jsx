// src/components/Dashboard/Content/BlogManagement.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { List, Plus, Edit, Trash2, Globe, XCircle, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
// নিশ্চিত করুন যে এই ফাইলটি সঠিক পাথে আছে
import BlogForm from './BlogForm'; 

// স্ট্যাটাস ভিত্তিক ব্যাজ কালার এবং টেক্সট
const getStatusBadge = (status) => {
    let color = '';
    let text = '';
    switch (status) {
        case 'published':
            color = 'bg-green-100 text-green-800';
            text = 'প্রকাশিত';
            break;
        case 'draft':
            color = 'bg-yellow-100 text-yellow-800';
            text = 'খসড়া (Draft)';
            break;
        default:
            color = 'bg-gray-200 text-gray-700';
            text = 'অজানা';
    }
    return <span className={`badge badge-sm font-semibold ${color}`}>{text}</span>;
};


const BlogManagement = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null); // সম্পাদনার জন্য নির্বাচিত পোস্ট

    // ১. সমস্ত ব্লগ পোস্ট ফেচ করা (অ্যাডমিন/ভলান্টিয়ারের জন্য)
    const { data: blogs = [], isLoading } = useQuery({
        queryKey: ['allBlogsForManagement'],
        queryFn: async () => {
            // সমস্ত ব্লগ পোস্ট ফেচ করা
            const res = await axiosSecure.get('/api/v1/blogs/admin/all'); 
            return res.data;
        }
    });

    // ২. স্ট্যাটাস পরিবর্তনের মিউটেশন (Draft/Published)
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, newStatus }) => {
            return axiosSecure.patch(`/api/v1/blogs/status/${id}`, { status: newStatus });
        },
        onSuccess: () => {
            toast.success("ব্লগ স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!");
            queryClient.invalidateQueries(['allBlogsForManagement']);
            queryClient.invalidateQueries(['recentPublicBlogs']); 
        },
        onError: (err) => {
            toast.error("স্ট্যাটাস আপডেট ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });

    // ৩. ডিলিট মিউটেশন
    const deleteBlogMutation = useMutation({
        mutationFn: (id) => {
            return axiosSecure.delete(`/api/v1/blogs/${id}`);
        },
        onSuccess: () => {
            toast.success("ব্লগ পোস্টটি সফলভাবে ডিলিট করা হয়েছে!");
            queryClient.invalidateQueries(['allBlogsForManagement']);
            queryClient.invalidateQueries(['recentPublicBlogs']);
        },
        onError: (err) => {
            toast.error("ডিলিট ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });

    // হ্যান্ডলার ফাংশন
    const handleStatusToggle = (id, currentStatus) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const actionText = newStatus === 'draft' ? 'ড্রাফ্ট' : 'প্রকাশ';
        
        if (window.confirm(`আপনি কি নিশ্চিত এই পোস্টটি ${actionText} করতে চান?`)) {
            updateStatusMutation.mutate({ id, newStatus });
        }
    };
    
    const handleDelete = (id) => {
        if (window.confirm("আপনি কি নিশ্চিত এই পোস্টটি ডিলিট করতে চান?")) {
            deleteBlogMutation.mutate(id);
        }
    };
    
    const openEditModal = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleNewPost = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    }
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    }


    if (isLoading) {
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <List size={30} className='text-red-600'/> ব্লগ কন্টেন্ট ম্যানেজমেন্ট ({blogs.length})
            </h1>

            {/* --- ক্রিয়েট এবং রিফ্রেশ বাটন --- */}
            <div className="flex justify-between items-center mb-6">
                 <button 
                    className="btn btn-sm btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => queryClient.invalidateQueries(['allBlogsForManagement'])}
                >
                    <RotateCw size={18} /> ডেটা রিফ্রেশ করুন
                </button>
                <button 
                    className="btn bg-red-600 text-white hover:bg-red-700"
                    onClick={handleNewPost}
                >
                    <Plus size={20} /> নতুন ব্লগ পোস্ট তৈরি করুন
                </button>
            </div>
            
            {/* --- ব্লগ তালিকা (টেবিল) --- */}
            <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
                {blogs.length === 0 ? (
                    <p className='p-8 text-center text-gray-500'>এখনও কোনো ব্লগ পোস্ট তৈরি করা হয়নি।</p>
                ) : (
                    <table className="table w-full">
                        {/* টেবিল হেড */}
                        <thead>
                            <tr className='bg-red-50 text-gray-700'>
                                <th>#</th>
                                <th>শিরোনাম</th>
                                <th>লেখক</th>
                                <th>স্ট্যাটাস</th>
                                <th>অ্যাকশন</th>
                            </tr>
                        </thead>
                        {/* টেবিল বডি */}
                        <tbody>
                            {blogs.map((blog, index) => (
                                <tr key={blog._id} className="hover:bg-gray-50">
                                    <th>{index + 1}</th>
                                    <td>
                                        <p className='font-semibold'>{blog.title}</p>
                                        <p className='text-xs text-gray-500 line-clamp-1'>{blog.content}</p>
                                    </td>
                                    <td>{blog.authorName || 'N/A'}</td>
                                    <td>
                                        {getStatusBadge(blog.status)}
                                    </td>
                                    <td className='space-x-2'>
                                        {/* স্ট্যাটাস টগল বাটন */}
                                        <button 
                                            className={`btn btn-sm btn-ghost ${blog.status === 'published' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`}
                                            onClick={() => handleStatusToggle(blog._id, blog.status)}
                                            disabled={updateStatusMutation.isLoading || deleteBlogMutation.isLoading}
                                            title={blog.status === 'published' ? 'ড্রাফ্ট করুন' : 'প্রকাশ করুন'}
                                        >
                                            {blog.status === 'published' ? <XCircle size={18} /> : <Globe size={18} />}
                                        </button>
                                        
                                        {/* এডিট বাটন */}
                                        <button 
                                            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100"
                                            onClick={() => openEditModal(blog)}
                                            title="সম্পাদনা করুন"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        
                                        {/* ডিলিট বাটন */}
                                        <button 
                                            className="btn btn-sm btn-ghost text-red-600 hover:bg-red-100"
                                            onClick={() => handleDelete(blog._id)}
                                            disabled={updateStatusMutation.isLoading || deleteBlogMutation.isLoading}
                                            title="ডিলিট করুন"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* --- ব্লগ তৈরি/সম্পাদনা মোডাল --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full relative">
                        <h3 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">
                            {editingPost ? 'ব্লগ পোস্ট সম্পাদনা করুন' : 'নতুন ব্লগ পোস্ট তৈরি করুন'}
                        </h3>
                        
                        <BlogForm 
                            initialData={editingPost} 
                            onClose={closeModal} 
                        />
                        
                        <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BlogManagement;
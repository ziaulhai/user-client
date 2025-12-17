// src/components/Dashboard/Content/BlogForm.jsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import toast from 'react-hot-toast';
import { Send, Edit3, Image, X } from 'lucide-react';

// ইমেজ হোস্টিং বা আপলোডের জন্য একটি ডামি API বা সার্ভিস প্রয়োজন।
// এই উদাহরণে, আমরা ধরে নিচ্ছি আপনার কাছে একটি Image Upload API আছে।
// অথবা, ডিরেক্ট ইমেজ URL ইনপুট নিচ্ছি।

const BlogForm = ({ initialData = null, onClose }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: initialData?.title || '',
            content: initialData?.content || '',
            thumbnail: initialData?.thumbnail || '',
            // authorName সাধারণত সার্ভার থেকে লগইন করা ইউজার থেকে নেওয়া হবে, কিন্তু ফর্মেও থাকতে পারে
            authorName: initialData?.authorName || '' 
        }
    });

    // ব্লগ তৈরি/আপডেটের মিউটেশন লজিক
    const blogMutation = useMutation({
        mutationFn: (data) => {
            if (isEditMode) {
                // সম্পাদনা (PATCH/PUT)
                return axiosSecure.patch(`/api/v1/blogs/${initialData._id}`, data);
            } else {
                // নতুন পোস্ট তৈরি (POST)
                // নতুন পোস্ট তৈরি করার সময় default status 'draft' সেট করা যেতে পারে
                return axiosSecure.post('/api/v1/blogs', { ...data, status: 'draft' });
            }
        },
        onSuccess: () => {
            toast.success(isEditMode ? "ব্লগ পোস্ট সফলভাবে আপডেট করা হয়েছে!" : "নতুন ব্লগ পোস্ট তৈরি হয়েছে (খসড়া স্ট্যাটাসে)!");
            queryClient.invalidateQueries(['allBlogsForManagement']); // ম্যানেজমেন্ট লিস্ট রিফ্রেশ
            queryClient.invalidateQueries(['recentPublicBlogs']); // পাবলিক হোম পেজ রিফ্রেশ
            reset();
            onClose(); // মোডাল বন্ধ করা
        },
        onError: (err) => {
            toast.error(isEditMode ? "আপডেট ব্যর্থ: " : "তৈরি ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });

    const onSubmit = (data) => {
        blogMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ব্লগ শিরোনাম */}
            <div>
                <label className="label">
                    <span className="label-text font-semibold flex items-center gap-1"><Edit3 size={16}/> শিরোনাম</span>
                </label>
                <input
                    type="text"
                    placeholder="ব্লগ পোস্টের মূল শিরোনাম লিখুন"
                    className={`input input-bordered w-full ${errors.title ? 'border-red-500' : ''}`}
                    {...register("title", { required: "শিরোনাম প্রয়োজন" })}
                />
                {errors.title && <span className="text-red-500 text-sm mt-1 block">{errors.title.message}</span>}
            </div>
            
            {/* থাম্বনেইল ইমেজ URL */}
            <div>
                <label className="label">
                    <span className="label-text font-semibold flex items-center gap-1"><Image size={16}/> থাম্বনেইল ইমেজ URL</span>
                </label>
                <input
                    type="url"
                    placeholder="ইমেজের URL এখানে পেস্ট করুন"
                    className={`input input-bordered w-full ${errors.thumbnail ? 'border-red-500' : ''}`}
                    {...register("thumbnail", { required: "থাম্বনেইল URL প্রয়োজন" })}
                />
                {errors.thumbnail && <span className="text-red-500 text-sm mt-1 block">{errors.thumbnail.message}</span>}
                {isEditMode && initialData.thumbnail && (
                    <div className="mt-2">
                        <p className='text-sm text-gray-500 mb-1'>বর্তমান প্রিভিউ:</p>
                        <img src={initialData.thumbnail} alt="Thumbnail Preview" className="w-32 h-auto rounded" />
                    </div>
                )}
            </div>

            {/* ব্লগ কন্টেন্ট (টেক্সট এরিয়া) */}
            <div>
                <label className="label">
                    <span className="label-text font-semibold flex items-center gap-1"><FileText size={16}/> ব্লগ কন্টেন্ট</span>
                </label>
                <textarea
                    placeholder="আপনার ব্লগ পোস্টের বিস্তারিত লিখুন..."
                    className={`textarea textarea-bordered h-40 w-full ${errors.content ? 'border-red-500' : ''}`}
                    {...register("content", { required: "কন্টেন্ট প্রয়োজন" })}
                />
                {errors.content && <span className="text-red-500 text-sm mt-1 block">{errors.content.message}</span>}
            </div>
            
            {/* সাবমিট বাটন */}
            <div className="pt-4 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="btn btn-ghost"
                >
                    <X size={18}/> বাতিল
                </button>
                <button 
                    type="submit" 
                    className="btn bg-red-600 text-white hover:bg-red-700"
                    disabled={blogMutation.isLoading}
                >
                    {blogMutation.isLoading ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        <>
                            <Send size={18}/> {isEditMode ? 'আপডেট করুন' : 'তৈরি করুন'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default BlogForm;
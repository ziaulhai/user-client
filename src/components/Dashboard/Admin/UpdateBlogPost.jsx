import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FileText, Type, MessageSquare, Save, Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';

// ImgBB API URL (অপরিবর্তিত)
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`;

const UpdateBlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // বিদ্যমান পোস্ট ডেটা লোড করা (লজিক অপরিবর্তিত)
    const { data: post = {}, isLoading, error } = useQuery({
        queryKey: ['blogToUpdate', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/api/v1/content/blog-posts/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    // ফর্ম স্টেট
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [imageUrl, setImageUrl] = useState(''); 
    const [uploading, setUploading] = useState(false); 
    const [isUpdating, setIsUpdating] = useState(false);

    // ডেটা লোড হওয়ার পর স্টেট সেট করা
    useEffect(() => {
        if (post && post._id) {
            setTitle(post.title || '');
            setContent(post.content || '');
            setImageUrl(post.thumbnail || '');
            setStatus(post.status || 'draft');
        }
    }, [post]);

    // ১. ছবি অটো-আপলোড হ্যান্ডেলার (লজিক অপরিবর্তিত)
    const handleAutoImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const res = await fetch(image_hosting_api, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setImageUrl(data.data.display_url || data.data.url);
            } else {
                Swal.fire("এরর!", "ছবি আপলোড ব্যর্থ হয়েছে।", "error");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            Swal.fire("এরর!", "সার্ভার সমস্যা, আবার চেষ্টা করুন।", "error");
        } finally {
            setUploading(false);
        }
    };

    // ২. আপডেট হ্যান্ডেলার (লজিক অপরিবর্তিত)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const updatedData = {
                title: title,
                content: content,
                thumbnail: imageUrl, 
                status: status,
                updatedAt: new Date(),
            };

            const res = await axiosSecure.patch(`/api/v1/content/blog-posts/${id}`, updatedData);

            if (res.data.modifiedCount > 0 || res.data.success) {
                toast.success('ব্লগ পোস্ট সফলভাবে আপডেট করা হয়েছে!');
                queryClient.invalidateQueries(['blogToUpdate', id]);
                queryClient.invalidateQueries(['allBlogPosts']);
                navigate('/dashboard/all-blog-posts');
            } else {
                toast.error('কোনো পরিবর্তন করা হয়নি।');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'আপডেট করতে ব্যর্থ হয়েছে।');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="text-center p-20 min-h-[60vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    if (error) return <div className="text-center p-20 text-red-600 font-bold">ডেটা লোড করা সম্ভব হয়নি।</div>;

    return (
        <div className="p-2 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Header Section */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
                        <FileText size={32} /> ব্লগ পোস্ট আপডেট করুন
                    </h2>
                    <p className="text-red-100 text-sm mt-1">আপনার ব্লগের তথ্য পরিবর্তন করে নতুন রূপ দিন</p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
                    
                    {/* শিরোনাম কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center gap-2 text-base">
                                <Type size={20} className="text-red-600" /> পোস্টের শিরোনাম
                            </span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input input-bordered w-full focus:ring-2 focus:ring-red-500 border-gray-300 transition-all"
                            placeholder="আকর্ষণীয় শিরোনাম লিখুন"
                            required
                        />
                    </div>

                    {/* থাম্বনেইল কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center gap-2 text-base">
                                <Upload size={20} className="text-red-600" /> থাম্বনেইল ছবি পরিবর্তন
                            </span>
                        </label>
                        
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAutoImageUpload}
                                    className="file-input file-input-bordered file-input-error w-full bg-white"
                                />
                                {uploading && (
                                    <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm font-medium">
                                        <span className="loading loading-spinner loading-xs"></span> ছবি আপলোড হচ্ছে...
                                    </div>
                                )}
                            </div>

                            {/* ছবি প্রিভিউ কার্ড */}
                            <div className="relative group">
                                {imageUrl ? (
                                    <div className="relative">
                                        <img 
                                            src={imageUrl} 
                                            alt="Preview" 
                                            className="h-28 w-44 object-cover rounded-lg border-2 border-red-100 shadow-md transition-transform group-hover:scale-105" 
                                        />
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-28 w-44 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                        <ImageIcon size={30} />
                                        <span className="text-[10px] uppercase font-bold mt-1">No Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* কন্টেন্ট কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center gap-2 text-base">
                                <MessageSquare size={20} className="text-red-600" /> বিস্তারিত কন্টেন্ট
                            </span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="textarea textarea-bordered h-48 w-full focus:ring-2 focus:ring-red-500 border-gray-300 transition-all text-base"
                            placeholder="আপনার ব্লগের মূল কথাগুলো এখানে লিখুন..."
                            required
                        ></textarea>
                    </div>

                    {/* স্ট্যাটাস কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center gap-2 text-base">
                                <Save size={20} className="text-red-600" /> স্ট্যাটাস ম্যানেজমেন্ট
                            </span>
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="select select-bordered w-full border-gray-300 focus:ring-red-500 font-medium"
                        >
                            <option value="draft">Draft (খসড়া)</option>
                            <option value="published">Published (প্রকাশিত)</option>
                            <option value="rejected">Rejected (বাতিল)</option>
                        </select>
                    </div>

                    {/* অ্যাকশন বাটন */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className={`btn btn-block bg-red-600 text-white hover:bg-red-700 border-none h-14 text-lg font-bold shadow-lg transform transition active:scale-95 ${isUpdating ? 'opacity-80' : ''}`}
                            disabled={isUpdating || uploading}
                        >
                            {isUpdating ? (
                                <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner"></span> আপডেট হচ্ছে...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={20} /> আপডেট সম্পন্ন করুন
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateBlogPost;
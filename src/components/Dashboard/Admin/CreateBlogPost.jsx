import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { FileText, Type, MessageSquare, Save, User, Upload, CheckCircle, Mail } from 'lucide-react';

// ImgBB API URL (অপরিবর্তিত)
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`;

const CreateBlogPost = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { isSubmitting } 
    } = useForm();

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

    const onSubmit = async (data) => {
        try {
            const blogPost = {
                title: data.title || "বিনা শিরোনামের পোস্ট",
                thumbnail: imageUrl || "", 
                content: data.content || "",
                status: data.status,
                authorEmail: user?.email,
                authorName: user?.displayName || 'Admin',
                createdAt: new Date(),
            };

            const res = await axiosSecure.post('/api/v1/content/blog-posts', blogPost); 

            if (res.data.insertedId) {
                Swal.fire({
                    title: "সফল!",
                    text: "ব্লগ পোস্টটি তৈরি করা হয়েছে।",
                    icon: "success"
                });
                reset(); 
                setImageUrl(''); 
            }
        } catch (error) {
            console.error("Error creating blog post:", error);
            Swal.fire({
                title: "এরর!",
                text: error.response?.data?.message || "ব্লগ পোস্ট তৈরি করা সম্ভব হয়নি।",
                icon: "error"
            });
        }
    };

    return (
        <div className="p-2 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-red-600 p-6 text-white">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start">
                        <FileText className='mr-3' size={32} /> নতুন ব্লগ পোস্ট তৈরি করুন
                    </h1>
                    <p className="text-red-100 text-sm mt-2 text-center md:text-left">আপনার জ্ঞান এবং অভিজ্ঞতা সবার সাথে শেয়ার করুন</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-8 space-y-6">
                    
                    {/* শিরোনাম কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center text-base">
                                <Type size={20} className='mr-2 text-red-600' /> পোস্টের শিরোনাম
                            </span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="একটি আকর্ষণীয় শিরোনাম দিন..." 
                            className="input input-bordered w-full focus:ring-2 focus:ring-red-500 transition-all border-gray-300" 
                            {...register("title")} 
                        />
                    </div>

                    {/* ছবি আপলোড কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center text-base">
                                <Upload size={20} className='mr-2 text-red-600' /> থাম্বনেইল ছবি
                            </span>
                        </label>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="file-input file-input-bordered file-input-error w-full md:flex-1" 
                                {...register("thumbnail", {
                                    onChange: (e) => { handleAutoImageUpload(e) }
                                })}
                            />
                            {/* Preview section */}
                            <div className="w-full md:w-auto flex justify-center">
                                {uploading ? (
                                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium animate-pulse">
                                        <span className="loading loading-spinner loading-sm"></span> আপলোড হচ্ছে...
                                    </div>
                                ) : imageUrl ? (
                                    <div className="relative group">
                                        <img src={imageUrl} alt="Preview" className="w-24 h-16 object-cover rounded-lg border-2 border-green-500 shadow-md" />
                                        <CheckCircle size={18} className="absolute -top-2 -right-2 text-green-600 bg-white rounded-full" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* বিস্তারিত কনটেন্ট কার্ড */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="label pt-0">
                            <span className="label-text font-bold text-gray-700 flex items-center text-base">
                                <MessageSquare size={20} className='mr-2 text-red-600' /> বিস্তারিত কনটেন্ট
                            </span>
                        </label>
                        <textarea 
                            className="textarea textarea-bordered h-48 w-full focus:ring-2 focus:ring-red-500 border-gray-300" 
                            placeholder="এখানে আপনার মনের মাধুরী মিশিয়ে লিখুন..." 
                            {...register("content")}
                        ></textarea>
                    </div>

                    {/* সেটিংস গ্রিড (Responsive) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="label pt-0">
                                <span className="label-text font-bold text-gray-700 flex items-center">
                                    <Save size={18} className='mr-2 text-red-600' /> স্ট্যাটাস
                                </span>
                            </label>
                            <select 
                                className="select select-bordered w-full border-gray-300 focus:ring-red-500" 
                                {...register("status")}
                                defaultValue="draft" 
                            >
                                <option value="draft">Draft (খসড়া)</option>
                                <option value="published">Published (প্রকাশিত)</option>
                            </select>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="label pt-0">
                                <span className="label-text font-bold text-gray-700 flex items-center">
                                    <User size={18} className='mr-2 text-red-600' /> লেখক
                                </span>
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg text-gray-600">
                                <User size={16} /> {user?.displayName || 'Admin'}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="label pt-0">
                                <span className="label-text font-bold text-gray-700 flex items-center">
                                    <Mail size={18} className='mr-2 text-red-600' /> ইমেল
                                </span>
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                                <Mail size={16} /> {user?.email || ''}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting || uploading} 
                            className={`btn bg-red-600 text-white text-lg hover:bg-red-700 border-none w-full shadow-lg transform transition active:scale-95 ${isSubmitting ? 'loading' : ''}`}
                        >
                            {isSubmitting ? (
                                'প্রসেস হচ্ছে...'
                            ) : (
                                <span className="flex items-center gap-2"><Save size={20} /> ব্লগ পোস্ট তৈরি করুন</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBlogPost;
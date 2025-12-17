import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { FileText, Type, MessageSquare, Save, User, Upload, CheckCircle } from 'lucide-react';

// ImgBB API URL
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

    // ১. ছবি অটো-আপলোড হ্যান্ডেলার
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
                Swal.fire("এরর!", "ছবি আপলোড ব্যর্থ হয়েছে।", "error");
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
        <div className="p-4 md:p-8 rounded-xl shadow-2xl bg-white max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b pb-2 flex items-center">
                <FileText className='mr-2' size={30} /> নতুন ব্লগ পোস্ট তৈরি করুন
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center">
                            <Type size={18} className='mr-1' /> পোস্টের শিরোনাম
                        </span>
                    </label>
                    <input 
                        type="text" 
                        placeholder="শিরোনাম লিখুন (ঐচ্ছিক)" 
                        className="input input-bordered w-full" 
                        {...register("title")} 
                    />
                </div>

                {/* থাম্বনেইল ছবি - সংশোধিত onChange */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center">
                            <Upload size={18} className='mr-1' /> থাম্বনেইল ছবি (ঐচ্ছিক)
                        </span>
                    </label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="file-input file-input-bordered file-input-error w-full" 
                        {...register("thumbnail", {
                            onChange: (e) => { handleAutoImageUpload(e) }
                        })}
                    />
                    
                    <div className="mt-2">
                        {uploading && (
                            <div className="flex items-center gap-2 text-blue-600 text-sm">
                                <span className="loading loading-spinner loading-xs"></span>
                                ছবি আপলোড হচ্ছে...
                            </div>
                        )}
                        {!uploading && imageUrl && (
                            <div className="flex items-center gap-2">
                                <div className="text-green-600 text-sm font-semibold flex items-center">
                                    <CheckCircle size={16} className="mr-1" /> ছবি আপলোড সফল!
                                </div>
                                <img src={imageUrl} alt="Preview" className="w-16 h-10 object-cover rounded border" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center">
                            <MessageSquare size={18} className='mr-1' /> বিস্তারিত কনটেন্ট
                        </span>
                    </label>
                    <textarea 
                        className="textarea textarea-bordered h-48 w-full" 
                        placeholder="আপনার কনটেন্ট লিখুন (ঐচ্ছিক)..." 
                        {...register("content")}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold flex items-center"><Save size={18} className='mr-1' /> স্ট্যাটাস</span></label>
                        <select 
                            className="select select-bordered" 
                            {...register("status")}
                            defaultValue="draft" 
                        >
                            <option value="draft">Draft (খসড়া)</option>
                            <option value="published">Published (প্রকাশিত)</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold flex items-center"><User size={18} className='mr-1' /> লেখক</span></label>
                        <input type="text" value={user?.displayName || 'Admin'} readOnly className="input input-bordered bg-gray-100" />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold flex items-center"><User size={18} className='mr-1' /> ইমেল</span></label>
                        <input type="email" value={user?.email || ''} readOnly className="input input-bordered bg-gray-100" />
                    </div>
                </div>

                <div className="form-control pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting || uploading} 
                        className="btn bg-red-600 text-white text-lg hover:bg-red-700 w-full"
                    >
                        {isSubmitting ? (
                            <><span className="loading loading-spinner"></span> প্রসেস হচ্ছে...</>
                        ) : (
                            'ব্লগ পোস্ট তৈরি করুন'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateBlogPost;
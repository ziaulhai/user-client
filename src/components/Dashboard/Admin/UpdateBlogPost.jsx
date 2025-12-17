import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FileText, Type, MessageSquare, Save, Upload } from 'lucide-react';

// ImgBB API URL
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`;

const UpdateBlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // ১. বিদ্যমান পোস্ট ডেটা লোড করা
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
    const [existingThumbnail, setExistingThumbnail] = useState(''); // আগের ছবির URL
    const [selectedFile, setSelectedFile] = useState(null); // নতুন সিলেক্ট করা ফাইল
    const [isUpdating, setIsUpdating] = useState(false);

    // ডেটা লোড হওয়ার পর স্টেট সেট করা
    useEffect(() => {
        if (post && post._id) {
            setTitle(post.title || '');
            setContent(post.content || '');
            setExistingThumbnail(post.thumbnail || '');
            setStatus(post.status || 'draft');
        }
    }, [post]);

    // ২. আপডেট হ্যান্ডেলার
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        let finalImageUrl = existingThumbnail; // ডিফল্টভাবে আগের ছবি থাকবে

        try {
            // ৩. নতুন ছবি আপলোড লজিক (যদি ইউজার নতুন ফাইল সিলেক্ট করে)
            if (selectedFile) {
                Swal.fire({
                    title: "নতুন ছবি আপলোড হচ্ছে...",
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                const formData = new FormData();
                formData.append('image', selectedFile);

                const imgbbRes = await fetch(image_hosting_api, {
                    method: 'POST',
                    body: formData
                });
                const imgbbData = await imgbbRes.json();
                
                if (imgbbData.success) {
                    finalImageUrl = imgbbData.data.url;
                } else {
                    throw new Error("ছবি আপলোড ব্যর্থ হয়েছে।");
                }
                Swal.close();
            }

            // ৪. আপডেট ডেটা অবজেক্ট তৈরি (কোনো ফিল্ডই required নয়)
            const updatedData = {
                title: title,
                content: content,
                thumbnail: finalImageUrl,
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
            toast.error(err.message || 'আপডেট করতে ব্যর্থ হয়েছে।');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    if (error) return <div className="text-center p-10 text-red-600">ডেটা লোড করা সম্ভব হয়নি।</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-lg">
            <h2 className="text-3xl font-bold text-red-600 mb-6 border-b pb-3 flex items-center">
                <FileText className="mr-2" /> ব্লগ পোস্ট আপডেট করুন
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* টাইটেল - (Required সরানো হয়েছে) */}
                <div>
                    <label className="label-text font-semibold flex items-center gap-1 mb-2">
                        <Type size={18} /> পোস্টের শিরোনাম
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input input-bordered w-full focus:border-red-500"
                        placeholder="শিরোনাম লিখুন"
                    />
                </div>

                {/* ফাইল আপলোড (থাম্বনেইল) */}
                <div>
                    <label className="label-text font-semibold flex items-center gap-1 mb-2">
                        <Upload size={18} /> থাম্বনেইল ছবি পরিবর্তন করুন
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="file-input file-input-bordered file-input-error w-full"
                    />
                    {/* প্রিভিউ অংশ */}
                    <div className="mt-3 flex gap-4 items-center">
                        {existingThumbnail && !selectedFile && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">বর্তমান ছবি:</p>
                                <img src={existingThumbnail} alt="Current" className="h-20 w-32 object-cover rounded border" />
                            </div>
                        )}
                        {selectedFile && (
                            <div>
                                <p className="text-xs text-blue-500 mb-1">নতুন ছবি সিলেক্ট করা হয়েছে:</p>
                                <img src={URL.createObjectURL(selectedFile)} alt="New" className="h-20 w-32 object-cover rounded border border-blue-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* কন্টেন্ট - (Required সরানো হয়েছে) */}
                <div>
                    <label className="label-text font-semibold flex items-center gap-1 mb-2">
                        <MessageSquare size={18} /> বিস্তারিত কন্টেন্ট
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea textarea-bordered h-44 w-full focus:border-red-500"
                        placeholder="আপনার ব্লগটি এখানে লিখুন..."
                    ></textarea>
                </div>

                {/* স্ট্যাটাস */}
                <div>
                    <label className="label-text font-semibold flex items-center gap-1 mb-2">
                        <Save size={18} /> স্ট্যাটাস পরিবর্তন
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="select select-bordered w-full"
                    >
                        <option value="draft">Draft (খসড়া)</option>
                        <option value="published">Published (প্রকাশিত)</option>
                        <option value="rejected">Rejected (বাতিল)</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="btn btn-block bg-red-600 text-white hover:bg-red-700 border-none"
                        disabled={isUpdating}
                    >
                        {isUpdating ? <span className="loading loading-spinner"></span> : 'আপডেট সম্পন্ন করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateBlogPost;
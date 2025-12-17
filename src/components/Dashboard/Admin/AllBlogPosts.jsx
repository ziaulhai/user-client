import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { List, Trash2, Edit, CheckCircle, XCircle, Copy, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

// স্ট্যাটাসের জন্য ক্লাস নির্ধারণ
const getStatusBadge = (status) => {
    switch (status) {
        case 'published': return 'badge-success';
        case 'draft': return 'badge-warning';
        default: return 'badge-neutral';
    }
};

const AllBlogPosts = () => {
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    // 🔥 ১. প্যাগিনেশন স্টেট (শুধুমাত্র এই অংশটি যোগ করা হয়েছে)
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12; 

    // ২. সকল ব্লগ পোস্ট ডেটা ফেচ করা (পাথ অপরিবর্তিত রাখা হয়েছে, শুধু কুয়েরি যোগ করা হয়েছে)
    const { data: { allPosts = [], totalCount = 0 } = {}, isLoading, refetch } = useQuery({
        queryKey: ['allBlogPosts', currentPage],
        queryFn: async () => {
            // আপনার দেয়া মূল পাথটিই রাখা হয়েছে, শেষে শুধু প্যাগিনেশন প্যারামিটার যোগ করা হয়েছে
            const res = await axiosSecure.get(`/api/v1/content/blog-posts/all?page=${currentPage}&size=${itemsPerPage}`); 
            return res.data; 
        }
    });

    // প্যাগিনেশনের জন্য বাটন ক্যালকুলেশন
    const numberOfPages = Math.ceil(totalCount / itemsPerPage);
    const pages = [...Array(numberOfPages).keys()];

    // ৩. স্ট্যাটাস আপডেট হ্যান্ডেলার (আপনার দেয়া লজিক - কোনো পরিবর্তন করা হয়নি)
    const handleStatusUpdate = (post, newStatus) => {
        const actionText = newStatus === 'published' ? 'প্রকাশ' : 'খসড়া (Draft) পরিবর্তন';

        Swal.fire({
            title: "স্ট্যাটাস পরিবর্তন নিশ্চিত করুন",
            text: `আপনি কি "${post.title}" পোস্টটিকে ${actionText} করতে চান?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: newStatus === 'published' ? "#10B981" : "#F59E0B",
            cancelButtonColor: "#6B7280",
            confirmButtonText: `হ্যাঁ, ${actionText} করুন`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const updateData = { status: newStatus };
                    await axiosSecure.patch(`/api/v1/content/blog-posts/${post._id}`, updateData);
                    Swal.fire('সফল!', `পোস্টটি সফলভাবে ${actionText} করা হয়েছে।`, 'success');
                    refetch(); 
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };
    
    // ৪. ডুপ্লিকেট হ্যান্ডেলার (আপনার দেয়া লজিক - কোনো পরিবর্তন করা হয়নি)
    const handleDuplicate = (post) => {
        Swal.fire({
            title: "ডুপ্লিকেট নিশ্চিত করুন",
            text: `আপনি কি "${post.title}" পোস্টটির একটি কপি তৈরি করতে চান? নতুন পোস্টটি Draft হিসেবে সেভ হবে।`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3B82F6",
            cancelButtonColor: "#6B7280",
            confirmButtonText: 'হ্যাঁ, ডুপ্লিকেট করুন'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const newPostData = {
                        title: `COPY of ${post.title}`,
                        thumbnail: post.thumbnail,
                        content: post.content,
                        status: 'draft',
                        authorEmail: post.authorEmail,
                        authorName: post.authorName,
                        createdAt: new Date(),
                    };

                    const res = await axiosSecure.post('/api/v1/content/blog-posts', newPostData); 
                    
                    if (res.data.insertedId) {
                        Swal.fire('ডুপ্লিকেট সফল!', 'পোস্টটির একটি নতুন খসড়া (Draft) তৈরি করা হয়েছে।', 'success');
                        refetch(); 
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'ডুপ্লিকেট তৈরি করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };

    // ৫. ডিলিট হ্যান্ডেলার (আপনার দেয়া লজিক - কোনো পরিবর্তন করা হয়নি)
    const handleDelete = (post) => {
        Swal.fire({
            title: "নিশ্চিত?",
            text: `আপনি কি "${post.title}" ব্লগ পোস্টটি স্থায়ীভাবে ডিলিট করতে চান?`,
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/api/v1/content/blog-posts/${post._id}`); 
                    Swal.fire('ডিলিট সফল!', `পোস্টটি সফলভাবে ডিলিট করা হয়েছে।`, 'success');
                    refetch(); 
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'পোস্টটি ডিলিট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };

    // ৬. সিঙ্গেল পোস্ট ভিউ হ্যান্ডেলার
    const handleViewPost = (post) => {
        navigate(`/blog/${post._id}`);
    }

    if (isLoading) {
        return <div className="text-center p-20 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="p-4 md:p-8 rounded-xl shadow-2xl bg-white">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b pb-2 flex items-center">
                <List className='mr-2' size={30} /> সকল ব্লগ পোস্ট ({totalCount})
            </h1>
            
            <div className="overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                        <tr className='text-gray-700 bg-gray-100'>
                            <th>#</th>
                            <th>শিরোনাম ও লেখক</th>
                            <th>তৈরির তারিখ</th>
                            <th>স্ট্যাটাস</th>
                            <th className='text-center'>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPosts.map((post, index) => (
                            <tr key={post._id} className='hover'>
                                {/* সিরিয়াল নম্বর প্যাগিনেশন অনুযায়ী ঠিক করা হয়েছে */}
                                <th>{(currentPage * itemsPerPage) + index + 1}</th>
                                <td>
                                    <p className='font-semibold max-w-xs truncate' title={post.title}>{post.title}</p>
                                    <p className='text-sm text-gray-500'>লেখক: {post.authorName}</p>
                                </td>
                                <td>
                                    <p className='text-sm text-gray-600'>{format(new Date(post.createdAt), 'dd MMMM, yyyy')}</p>
                                </td>
                                <td>
                                    <div className={`badge text-xs font-semibold text-white ${getStatusBadge(post.status)}`}>
                                        {post.status.toUpperCase()}
                                    </div>
                                </td>
                                <td className='space-x-1 flex flex-wrap gap-1 justify-center'>
                                    <button className="btn btn-xs btn-outline btn-primary" onClick={() => handleViewPost(post)}>
                                        <Eye size={12} /> দেখুন
                                    </button>
                                
                                    <button className="btn btn-xs btn-info text-white" onClick={() => navigate(`/dashboard/edit-blog/${post._id}`)}>
                                        <Edit size={12} /> এডিট
                                    </button>
                                    
                                    <button onClick={() => handleDuplicate(post)} className="btn btn-xs btn-warning text-white">
                                        <Copy size={12} /> ডুপ্লিকেট
                                    </button>

                                    {post.status === 'draft' ? (
                                        <button onClick={() => handleStatusUpdate(post, 'published')} className="btn btn-xs btn-success text-white">
                                            <CheckCircle size={12} /> প্রকাশ করুন
                                        </button>
                                    ) : (
                                        <button onClick={() => handleStatusUpdate(post, 'draft')} className="btn btn-xs btn-warning text-white">
                                            <XCircle size={12} /> Draft করুন
                                        </button>
                                    )}
                                    
                                    <button onClick={() => handleDelete(post)} className="btn btn-xs btn-error text-white">
                                        <Trash2 size={12} /> ডিলিট
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔥 প্যাগিনেশন কন্ট্রোলস (নতুন যোগ করা হয়েছে) */}
            {numberOfPages > 1 && (
                <div className='flex justify-center items-center gap-2 mt-8 mb-4'>
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

export default AllBlogPosts;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { List, Trash2, Edit, CheckCircle, XCircle, Copy, Eye, ChevronLeft, ChevronRight, Settings2, User, Calendar } from 'lucide-react';

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

    // প্যাগিনেশন স্টেট
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12; 

    // 🔥 ১. বাল্ক সিলেকশন স্টেট
    const [selectedPostIds, setSelectedPostIds] = useState([]);

    // ২. সকল ব্লগ পোস্ট ডেটা ফেচ করা
    const { data: { allPosts = [], totalCount = 0 } = {}, isLoading, refetch } = useQuery({
        queryKey: ['allBlogPosts', currentPage],
        queryFn: async () => {
            const res = await axiosSecure.get(`/api/v1/content/blog-posts/all?page=${currentPage}&size=${itemsPerPage}`); 
            return res.data; 
        }
    });

    const numberOfPages = Math.ceil(totalCount / itemsPerPage);
    const pages = [...Array(numberOfPages).keys()];

    // --- বাল্ক অ্যাকশন হ্যান্ডেলার্স ---
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = allPosts.map(post => post._id);
            setSelectedPostIds(allIds);
        } else {
            setSelectedPostIds([]);
        }
    };

    const handleSelectPost = (postId) => {
        if (selectedPostIds.includes(postId)) {
            setSelectedPostIds(selectedPostIds.filter(id => id !== postId));
        } else {
            setSelectedPostIds([...selectedPostIds, postId]);
        }
    };

    const handleBulkAction = async (actionType) => {
        if (selectedPostIds.length === 0) return;

        let title = "";
        let confirmText = "";
        let color = "";

        if (actionType === 'published') {
            title = "নির্বাচিত সব পোস্ট কি পাবলিশ করতে চান?";
            confirmText = "হ্যাঁ, পাবলিশ করুন";
            color = "#10B981";
        } else if (actionType === 'draft') {
            title = "নির্বাচিত সব পোস্ট কি ড্রাফট করতে চান?";
            confirmText = "হ্যাঁ, ড্রাফট করুন";
            color = "#F59E0B";
        } else {
            title = "নির্বাচিত সব পোস্ট কি ডিলিট করতে চান?";
            confirmText = "হ্যাঁ, ডিলিট করুন";
            color = "#EF4444";
        }

        Swal.fire({
            title: title,
            text: `মোট ${selectedPostIds.length}টি পোস্ট প্রভাবিত হবে।`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: color,
            confirmButtonText: confirmText,
            cancelButtonText: "বাতিল"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (actionType === 'delete') {
                        await Promise.all(selectedPostIds.map(id => 
                            axiosSecure.delete(`/api/v1/content/blog-posts/${id}`)
                        ));
                    } else {
                        await Promise.all(selectedPostIds.map(id => 
                            axiosSecure.patch(`/api/v1/content/blog-posts/${id}`, { status: actionType })
                        ));
                    }

                    Swal.fire('সফল!', 'অ্যাকশনটি সফলভাবে সম্পন্ন হয়েছে।', 'success');
                    setSelectedPostIds([]);
                    refetch();
                } catch (error) {
                    Swal.fire('এরর!', 'কিছু একটা ভুল হয়েছে।', 'error');
                }
            }
        });
    };

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

    const handleViewPost = (post) => {
        navigate(`/blog/${post._id}`);
    }

    if (isLoading) {
        return <div className="text-center p-20 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="p-2 md:p-8 rounded-xl shadow-2xl bg-white min-h-screen">
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4'>
                <h1 className="text-xl md:text-3xl font-bold text-red-600 flex items-center">
                    <List className='mr-2' size={24} /> সকল ব্লগ পোস্ট ({totalCount})
                </h1>

                {/* বাল্ক অ্যাকশন বাটন কন্ট্রোল */}
                {selectedPostIds.length > 0 && (
                    <div className='flex flex-wrap gap-2 w-full md:w-auto'>
                        <span className='text-xs md:text-sm font-bold bg-gray-100 p-2 rounded flex-grow md:flex-grow-0 text-center'>সিলেক্টেড: {selectedPostIds.length}</span>
                        <div className="flex flex-wrap gap-1 justify-center md:justify-end">
                            <button onClick={() => handleBulkAction('published')} className="btn btn-xs md:btn-sm btn-success text-white">
                                <CheckCircle size={12} /> পাবলিশ
                            </button>
                            <button onClick={() => handleBulkAction('draft')} className="btn btn-xs md:btn-sm btn-warning text-white">
                                <XCircle size={12} /> ড্রাফট
                            </button>
                            <button onClick={() => handleBulkAction('delete')} className="btn btn-xs md:btn-sm btn-error text-white">
                                <Trash2 size={12} /> ডিলিট
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Table UI - Responsive Grid Replacement */}
            <div className="w-full border rounded-lg overflow-hidden">
                {/* Header (Hidden on Mobile) */}
                <div className="hidden lg:grid grid-cols-12 bg-gray-100 p-4 font-bold text-gray-700 text-xs uppercase border-b">
                    <div className="col-span-1">
                        <input type="checkbox" className="checkbox checkbox-sm checkbox-error" onChange={handleSelectAll} checked={selectedPostIds.length === allPosts.length && allPosts.length > 0} />
                    </div>
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">শিরোনাম ও লেখক</div>
                    <div className="col-span-2">তৈরির তারিখ</div>
                    <div className="col-span-2">স্ট্যাটাস</div>
                    <div className="col-span-2 text-center">অ্যাকশন</div>
                </div>

                {/* Rows / Cards */}
                {allPosts.map((post, index) => (
                    <div key={post._id} className={`grid grid-cols-1 lg:grid-cols-12 items-center p-4 border-b hover:bg-red-50 transition-colors ${selectedPostIds.includes(post._id) ? 'bg-red-50' : ''}`}>
                        
                        {/* Checkbox & ID (Mobile Mix) */}
                        <div className="col-span-1 flex items-center mb-2 lg:mb-0">
                            <input type="checkbox" className="checkbox checkbox-xs md:checkbox-sm checkbox-error mr-3" checked={selectedPostIds.includes(post._id)} onChange={() => handleSelectPost(post._id)} />
                            <span className="lg:hidden font-bold text-gray-400">#{(currentPage * itemsPerPage) + index + 1}</span>
                        </div>

                        {/* Desktop Index */}
                        <div className="hidden lg:block col-span-1 text-sm">
                            {(currentPage * itemsPerPage) + index + 1}
                        </div>

                        {/* Title & Author */}
                        <div className="col-span-4 mb-2 lg:mb-0">
                            <p className='font-semibold text-gray-800 text-sm md:text-base leading-tight' title={post.title}>{post.title}</p>
                            <p className='text-[10px] md:text-xs text-gray-500 italic mt-1 flex items-center'>
                                <User size={12} className="mr-1" /> লেখক: {post.authorName}
                            </p>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 mb-2 lg:mb-0 text-xs md:text-sm text-gray-600 flex items-center">
                            <Calendar size={14} className="mr-2 lg:hidden text-gray-400" />
                            {format(new Date(post.createdAt), 'dd MMM, yyyy')}
                        </div>

                        {/* Status */}
                        <div className="col-span-2 mb-3 lg:mb-0">
                            <div className={`badge badge-sm md:badge-md text-[10px] md:text-xs font-semibold text-white ${getStatusBadge(post.status)}`}>
                                {post.status.toUpperCase()}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-2">
                            <div className="flex flex-wrap gap-1 lg:justify-center items-center">
                                <button className="btn btn-xs btn-outline btn-primary" onClick={() => handleViewPost(post)} title="দেখুন">
                                    <Eye size={12} />
                                </button>
                                <button className="btn btn-xs btn-info text-white" onClick={() => navigate(`/dashboard/edit-blog/${post._id}`)} title="এডিট">
                                    <Edit size={12} />
                                </button>
                                <button onClick={() => handleDuplicate(post)} className="btn btn-xs btn-warning text-white" title="ডুপ্লিকেট">
                                    <Copy size={12} />
                                </button>

                                {post.status === 'draft' ? (
                                    <button onClick={() => handleStatusUpdate(post, 'published')} className="btn btn-xs btn-success text-white" title="প্রকাশ">
                                        <CheckCircle size={12} />
                                    </button>
                                ) : (
                                    <button onClick={() => handleStatusUpdate(post, 'draft')} className="btn btn-xs btn-warning text-white" title="ড্রাফট">
                                        <XCircle size={12} />
                                    </button>
                                )}
                                
                                <button onClick={() => handleDelete(post)} className="btn btn-xs btn-error text-white" title="ডিলিট">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* প্যাগিনেশন কন্ট্রোলস */}
            {numberOfPages > 1 && (
                <div className='flex flex-wrap justify-center items-center gap-1 md:gap-2 mt-8 mb-4'>
                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} className='btn btn-xs md:btn-sm btn-outline'>
                        <ChevronLeft size={16} /> <span className="hidden sm:inline">Prev</span>
                    </button>

                    <div className="flex flex-wrap justify-center gap-1">
                        {pages.map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`btn btn-xs md:btn-sm ${currentPage === page ? 'btn-error text-white border-none' : 'btn-outline'}`}>
                                {page + 1}
                            </button>
                        ))}
                    </div>

                    <button disabled={currentPage === numberOfPages - 1} onClick={() => setCurrentPage(currentPage + 1)} className='btn btn-xs md:btn-sm btn-outline'>
                        <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllBlogPosts;
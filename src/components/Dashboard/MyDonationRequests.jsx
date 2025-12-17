// src/components/Dashboard/MyDonationRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { Trash2, Edit, CheckCircle, XCircle, Eye } from 'lucide-react'; // Eye এবং অন্যান্য আইকন ইম্পোর্ট করা হলো
import { format } from 'date-fns'; // তারিখ ফরম্যাটের জন্য
import { Link } from 'react-router-dom'; // রাউটিং এর জন্য Link ইম্পোর্ট করা হলো

// রিকোয়েস্ট স্ট্যাটাসের জন্য ক্লাস
const getStatusClass = (status) => {
    switch (status) {
        // Tailwind/DaisyUI ক্লাসের সাথে সামঞ্জস্য রেখে পরিবর্তন করা হলো
        case 'pending': return 'badge-warning text-warning-content'; 
        case 'inprogress': return 'badge-info text-info-content'; 
        case 'done': return 'badge-success text-success-content'; 
        case 'canceled': return 'badge-error text-error-content'; 
        default: return 'badge-neutral text-neutral-content'; 
    }
};

const MyDonationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    // --- ডেটা লোড করার ফাংশন ---
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            // সার্ভার থেকে ডেটা আনার সময় ইউজার ইমেইল অটোমেটিকালি টোকেন থেকে যাবে, তাই শুধু এই রুটটি যথেষ্ট
            const res = await axiosSecure.get('/api/v1/donation-requests/my-requests'); 
            // নতুন অনুরোধগুলো প্রথমে দেখার জন্য তারিখ অনুযায়ী সাজানো যেতে পারে
            const sortedRequests = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(sortedRequests);
        } catch (error) {
            console.error("Error fetching donation requests:", error);
            Swal.fire('এরর', 'ডোনেশন অনুরোধ লোড করতে ব্যর্থ হয়েছে।', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // --- ডিলিট হ্যান্ডেলার ---
    const handleDelete = (id) => {
        Swal.fire({
            title: "নিশ্চিত?",
            text: "আপনি কি এই অনুরোধটি ডিলিট করতে চান? (এটি আর ফিরিয়ে আনা যাবে না)",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "হ্যাঁ, ডিলিট করুন!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axiosSecure.delete(`/api/v1/donation-requests/${id}`);
                    if (res.data.deletedCount > 0) {
                        Swal.fire('সফল!', 'অনুরোধটি সফলভাবে ডিলিট করা হয়েছে।', 'success');
                        fetchRequests(); // তালিকা রিফ্রেশ করা
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'ডিলিট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };

    // --- স্ট্যাটাস আপডেট হ্যান্ডেলার (Cancel/Done) ---
    const handleStatusUpdate = async (id, newStatus, message) => {
        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: message,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: newStatus === 'canceled' ? "#F59E0B" : "#10B981", // হলুদ/সবুজ রঙ
            cancelButtonColor: "#6B7280",
            confirmButtonText: `হ্যাঁ, ${newStatus === 'canceled' ? 'বাতিল' : 'সম্পন্ন'} করুন`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // সার্ভার এন্ডপয়েন্ট ধরে নেওয়া হলো যে এটি বডির মধ্যে থাকা 'requestStatus' দিয়ে আপডেট করতে পারে
                    const res = await axiosSecure.patch(`/api/v1/donation-requests/${id}`, { requestStatus: newStatus });
                    if (res.data.modifiedCount > 0) {
                        Swal.fire('সফল!', `অনুরোধটি সফলভাবে ${newStatus === 'canceled' ? 'বাতিল' : 'সম্পন্ন'} করা হয়েছে।`, 'success');
                        fetchRequests();
                    } else {
                        Swal.fire('এরর!', 'আপডেট করা সম্ভব হয়নি।', 'error');
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || `স্ট্যাটাস পরিবর্তন সম্ভব হয়নি।`, 'error');
                }
            }
        });
    };
    
    // কনভেনিয়েন্স ফাংশন:
    const handleCancel = (id) => handleStatusUpdate(id, 'canceled', "আপনি কি এই অনুরোধটি বাতিল করতে চান?");
    const handleDone = (id) => handleStatusUpdate(id, 'done', "ডোনেশন কি সম্পন্ন হয়েছে?");


    if (isLoading) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (requests.length === 0) {
        return <div className="text-center p-10 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700">আপনি এখনও কোনো রক্তদানের অনুরোধ তৈরি করেননি।</h2>
            <Link to="/dashboard/create-donation-request" className="btn bg-red-600 text-white hover:bg-red-700 mt-4">
                প্রথম অনুরোধটি তৈরি করুন
            </Link>
        </div>;
    }

    return (
        <div className="p-4 md:p-8 rounded-xl shadow-2xl bg-white">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b pb-2">আমার রক্তদানের অনুরোধসমূহ ({requests.length})</h1>
            
            <div className="overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                        <tr className='text-gray-700 bg-gray-100'>
                            <th>#</th>
                            <th>রোগীর তথ্য</th>
                            <th>অবস্থান ও হাসপাতাল</th>
                            <th>সময় ও তারিখ</th>
                            <th>ডোনার (যদি থাকে)</th>
                            <th>স্ট্যাটাস</th>
                            <th className='text-center'>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request, index) => (
                            <tr key={request._id} className='hover'>
                                <th>{index + 1}</th>
                                <td>
                                    <p className='font-semibold'>{request.recipientName}</p>
                                    <p className='text-sm text-red-500'>গ্রুপ: {request.bloodGroup}</p>
                                    <p className='text-xs text-gray-500'>Email: {request.recipientEmail}</p>
                                </td>
                                <td>
                                    <p>{request.recipientUpazila}, {request.recipientDistrict}</p>
                                    <p className='text-xs text-gray-500'>হাসপাতাল: {request.hospitalName}</p>
                                </td>
                                <td>
                                    <p>{format(new Date(request.donationDate), 'dd MMM, yyyy')}</p>
                                    <p className='text-sm text-gray-600'>{request.donationTime}</p>
                                </td>
                                <td>
                                    {request.donorName ? (
                                        <>
                                            <p className='font-medium'>{request.donorName}</p>
                                            <p className='text-xs text-gray-500'>{request.donorEmail}</p>
                                        </>
                                    ) : (
                                        <span className='text-gray-400'>অ্যাসাইন করা হয়নি</span>
                                    )}
                                </td>
                                <td>
                                    <div className={`badge text-xs font-semibold ${getStatusClass(request.requestStatus)}`}>
                                        {request.requestStatus.toUpperCase()}
                                    </div>
                                </td>
                                <td className='space-x-1 flex flex-wrap justify-center items-center h-full'>
                                    
                                    {/* ভিউ বাটন (সকলের জন্য) */}
                                    <Link 
                                        to={`/donation-request/${request._id}`}
                                        className="btn btn-sm btn-info text-white tooltip" 
                                        data-tip="ডিটেইলস দেখুন"
                                    >
                                        <Eye size={16} /> 
                                    </Link>
                                    
                                    {/* এডিট বাটন (শুধুমাত্র Pending) */}
                                    {request.requestStatus === 'pending' && (
                                        <Link 
                                            to={`/dashboard/update-donation-request/${request._id}`} 
                                            className="btn btn-sm btn-warning text-white tooltip"
                                            data-tip="অনুরোধ এডিট করুন"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                    )}

                                    {/* Done বাটন (শুধু Inprogress) */}
                                    {request.requestStatus === 'inprogress' && (
                                        <button 
                                            onClick={() => handleDone(request._id)}
                                            className="btn btn-sm btn-success text-white tooltip" 
                                            data-tip="সম্পন্ন হয়েছে"
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    )}

                                    {/* Cancel বাটন (Pending বা Inprogress) */}
                                    {(request.requestStatus === 'pending' || request.requestStatus === 'inprogress') && (
                                        <button 
                                            onClick={() => handleCancel(request._id)}
                                            className="btn btn-sm btn-error text-white tooltip" 
                                            data-tip="অনুরোধ বাতিল করুন"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    )}
                                    
                                    {/* Delete বাটন (শুধু Pending) */}
                                    {request.requestStatus === 'pending' && (
                                        <button 
                                            onClick={() => handleDelete(request._id)}
                                            className="btn btn-sm btn-outline btn-error tooltip" 
                                            data-tip="অনুরোধ ডিলিট করুন"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyDonationRequests;
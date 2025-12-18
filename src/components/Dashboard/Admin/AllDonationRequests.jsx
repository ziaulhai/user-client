// src/components/Dashboard/Admin/AllDonationRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle, List, Loader } from 'lucide-react';

const getStatusClass = (status) => {
    switch (status) {
        case 'pending': return 'badge-warning';
        case 'inprogress': return 'badge-info';
        case 'done': return 'badge-success';
        case 'canceled': return 'badge-error';
        default: return 'badge-neutral';
    }
};

const AllDonationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    // --- ডেটা লোড করার ফাংশন ---
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            // সার্ভারের /api/v1/donation-requests/admin/all-requests রুট থেকে সব অনুরোধ লোড করা
            const res = await axiosSecure.get('/api/v1/donation-requests/admin/all-requests');
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching all donation requests (Admin):", error);
            Swal.fire('এরর', error.response?.data?.message || 'ডোনেশন অনুরোধ লোড করতে ব্যর্থ হয়েছে।', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // --- স্ট্যাটাস আপডেট হ্যান্ডেলার (Done/Canceled) ---
    const handleStatusUpdate = (id, currentStatus, newStatus, recipientName) => {
        if (currentStatus === newStatus) return; // একই স্ট্যাটাস হলে ইগনোর

        Swal.fire({
            title: "স্ট্যাটাস পরিবর্তন নিশ্চিত করুন",
            text: `${recipientName} এর অনুরোধের স্ট্যাটাস কি "${newStatus.toUpperCase()}" এ পরিবর্তন করতে চান?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: newStatus === 'done' ? "#10B981" : "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: `হ্যাঁ, ${newStatus} করুন`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // PATCH রুট ব্যবহার করা হলো (যা আপনার donationRequests.js এ ৬ নং রুট হিসেবে আছে)
                    await axiosSecure.patch(`/api/v1/donation-requests/${id}`, { requestStatus: newStatus });
                    Swal.fire('সফল!', `স্ট্যাটাস সফলভাবে "${newStatus}" এ আপডেট হয়েছে।`, 'success');
                    fetchRequests(); // তালিকা রিফ্রেশ করা
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };

    // --- ডিলিট হ্যান্ডেলার ---
    const handleDelete = (id, recipientName) => {
        Swal.fire({
            title: "নিশ্চিত?",
            text: `আপনি কি ${recipientName} এর ডোনেশন অনুরোধটি ডিলিট করতে চান?`,
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // নতুন Admin Delete রুট ব্যবহার করা
                    await axiosSecure.delete(`/api/v1/donation-requests/admin/${id}`); 
                    Swal.fire('ডিলিট সফল!', `অনুরোধটি সফলভাবে ডিলিট করা হয়েছে।`, 'success');
                    fetchRequests(); 
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'অনুরোধটি ডিলিট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };


    if (isLoading) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="p-4 md:p-8 rounded-xl shadow-2xl bg-white">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b pb-2 flex items-center"><List className='mr-2' /> সব ডোনেশন অনুরোধ ম্যানেজমেন্ট ({requests.length})</h1>
            
            <div className="overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                        <tr className='text-gray-700 bg-gray-100'>
                            <th>#</th>
                            <th>রোগী ও রক্তের গ্রুপ</th>
                            <th>অবস্থান ও তারিখ</th>
                            <th>অনুরোধকারী</th>
                            <th>ডোনার (যদি থাকে)</th>
                            <th>স্ট্যাটাস</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req, index) => (
                            <tr key={req._id}>
                                <th>{index + 1}</th>
                                <td>
                                    <p className='font-semibold'>{req.recipientName}</p>
                                    <p className='text-red-600 font-bold text-sm'>{req.bloodGroup}</p>
                                </td>
                                <td>
                                    <p className='text-sm'>{req.recipientUpazila}, {req.recipientDistrict}</p>
                                    <p className='text-xs text-gray-500'>{format(new Date(req.donationDate), 'dd MMM, yy')} ({req.donationTime})</p>
                                </td>
                                <td>
                                    <p className='font-semibold'>{req.requesterName || 'N/A'}</p>
                                    <p className='text-sm text-gray-500'>{req.requesterEmail}</p>
                                </td>
                                <td>
                                    <p className='text-sm'>{req.donorName || 'N/A'}</p>
                                    <p className='text-xs text-gray-500'>{req.donorEmail || ''}</p>
                                </td>
                                <td>
                                    <div className={`badge text-xs font-semibold text-white ${getStatusClass(req.requestStatus)}`}>
                                        {req.requestStatus.toUpperCase()}
                                    </div>
                                </td>
                                <td className='space-y-1'>
                                    {/* Done বাটন */}
                                    {(req.requestStatus === 'pending' || req.requestStatus === 'inprogress') && (
                                        <button 
                                            onClick={() => handleStatusUpdate(req._id, req.requestStatus, 'done', req.recipientName)}
                                            className="btn btn-xs btn-success text-white w-full" 
                                            disabled={req.requestStatus === 'done'}
                                        >
                                            <CheckCircle size={12} /> ডন
                                        </button>
                                    )}
                                    
                                    {/* Cancel বাটন */}
                                    {(req.requestStatus === 'pending' || req.requestStatus === 'inprogress') && (
                                        <button 
                                            onClick={() => handleStatusUpdate(req._id, req.requestStatus, 'canceled', req.recipientName)}
                                            className="btn btn-xs btn-warning text-white w-full" 
                                            disabled={req.requestStatus === 'canceled'}
                                        >
                                            <XCircle size={12} /> বাতিল
                                        </button>
                                    )}
                                    
                                    {/* ডিলিট বাটন */}
                                    <button 
                                        onClick={() => handleDelete(req._id, req.recipientName)}
                                        className="btn btn-xs btn-error text-white w-full" 
                                    >
                                        <Trash2 size={12} /> ডিলিট (Admin)
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllDonationRequests;


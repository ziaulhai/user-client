// src/components/Dashboard/Volunteer/DonationRequestManagement.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { List, CheckCircle, XCircle, Trash2, Edit, Filter, Search, RotateCw, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const DonationRequestManagement = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'inprogress', 'done', 'canceled'

    // ডেটা ফেচিং লজিক
    const { data: requests = [], isLoading, isError, error } = useQuery({
        queryKey: ['allDonationRequests', filterStatus],
        queryFn: async () => {
            // স্ট্যাটাস ফিল্টার প্রয়োগ করা হচ্ছে
            const url = filterStatus === 'all' 
                ? '/api/v1/donation-requests' 
                : `/api/v1/donation-requests?status=${filterStatus}`;
                
            const res = await axiosSecure.get(url);
            return res.data;
        }
    });

    // স্ট্যাটাস পরিবর্তনের মিউটেশন
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, newStatus }) => {
            // সার্ভারে স্ট্যাটাস আপডেট রিকোয়েস্ট পাঠানো
            return axiosSecure.patch(`/api/v1/donation-requests/${id}`, { status: newStatus });
        },
        onSuccess: () => {
            toast.success("ডোনেশন রিকোয়েস্ট স্ট্যাটাস আপডেট করা হয়েছে!");
            queryClient.invalidateQueries(['allDonationRequests']); // ডেটা রিফেচ করা
        },
        onError: (err) => {
            toast.error("স্ট্যাটাস আপডেট ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });
    
    // রিকোয়েস্ট ডিলিট করার মিউটেশন
    const deleteRequestMutation = useMutation({
        mutationFn: (id) => {
            return axiosSecure.delete(`/api/v1/donation-requests/${id}`);
        },
        onSuccess: () => {
            toast.success("ডোনেশন রিকোয়েস্ট সফলভাবে মুছে ফেলা হয়েছে!");
            queryClient.invalidateQueries(['allDonationRequests']); 
        },
        onError: (err) => {
            toast.error("রিকোয়েস্ট ডিলিট ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });

    // হ্যান্ডলার ফাংশন
    const handleStatusChange = (id, currentStatus) => {
        let newStatus;
        
        if (currentStatus === 'pending') {
            // ভলান্টিয়ার/অ্যাডমিন রিকোয়েস্টটি গ্রহণ করলে
            newStatus = 'inprogress'; 
        } else if (currentStatus === 'inprogress') {
            // ডোনেশন সম্পন্ন হলে
            newStatus = 'done';
        } else {
            // অন্য স্ট্যাটাস থেকে স্ট্যাটাস পরিবর্তন সহজ করার জন্য একটি মোডাল ব্যবহার করা উচিত।
            // আপাতত, শুধু 'done' বা 'inprogress' এ পরিবর্তন করার জন্য একটি বেসিক প্রম্পট ব্যবহার করা যেতে পারে।
            const promptStatus = prompt(`স্ট্যাটাস পরিবর্তন করুন (inprogress, done, canceled):`);
            if (promptStatus && ['inprogress', 'done', 'canceled'].includes(promptStatus.toLowerCase())) {
                newStatus = promptStatus.toLowerCase();
            } else {
                return; // কোনো পরিবর্তন করা হয়নি
            }
        }
        
        updateStatusMutation.mutate({ id, newStatus });
    };

    const handleDelete = (id) => {
        if (window.confirm("আপনি কি নিশ্চিত এই রিকোয়েস্টটি ডিলিট করতে চান?")) {
            deleteRequestMutation.mutate(id);
        }
    };
    
    // স্ট্যাটাস ভিত্তিক ব্যাজ কালার
    const getStatusBadge = (status) => {
        let color = '';
        let text = '';
        switch (status) {
            case 'pending':
                color = 'bg-yellow-100 text-yellow-800';
                text = 'পেন্ডিং';
                break;
            case 'inprogress':
                color = 'bg-indigo-100 text-indigo-800';
                text = 'চলমান';
                break;
            case 'done':
                color = 'bg-green-100 text-green-800';
                text = 'সম্পন্ন';
                break;
            case 'canceled':
                color = 'bg-gray-100 text-gray-800';
                text = 'বাতিল';
                break;
            default:
                color = 'bg-gray-200 text-gray-700';
                text = 'অজানা';
        }
        return <span className={`badge badge-sm font-semibold ${color}`}>{text}</span>;
    };


    if (isLoading) {
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (isError) {
        return <div className="p-10 text-center text-red-600">ডেটা লোড করতে ব্যর্থ: {error.message}</div>;
    }


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <List size={30} className='text-red-600'/> ডোনেশন রিকোয়েস্ট ম্যানেজমেন্ট ({requests.length})
            </h1>

            {/* --- ফিল্টার এবং রিফ্রেশ --- */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-6">
                <div className="flex items-center gap-3">
                    <Filter size={20} className='text-red-600'/>
                    <label htmlFor="status-filter" className="font-semibold text-gray-700">স্ট্যাটাস অনুযায়ী ফিল্টার:</label>
                    <select
                        id="status-filter"
                        className="select select-bordered select-sm bg-gray-50 border-gray-300"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">সমস্ত রিকোয়েস্ট</option>
                        <option value="pending">পেন্ডিং</option>
                        <option value="inprogress">চলমান</option>
                        <option value="done">সম্পন্ন</option>
                        <option value="canceled">বাতিল</option>
                    </select>
                </div>
                <button 
                    className="btn btn-sm btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-4 md:mt-0"
                    onClick={() => queryClient.invalidateQueries(['allDonationRequests', filterStatus])}
                >
                    <RotateCw size={18} /> রিফ্রেশ করুন
                </button>
            </div>
            
            {/* --- রিকোয়েস্ট তালিকা (টেবিল) --- */}
            <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
                {requests.length === 0 ? (
                    <p className='p-8 text-center text-gray-500'>এই ফিল্টারে কোনো ডোনেশন রিকোয়েস্ট পাওয়া যায়নি।</p>
                ) : (
                    <table className="table w-full">
                        {/* টেবিল হেড */}
                        <thead>
                            <tr className='bg-red-50 text-gray-700'>
                                <th>#</th>
                                <th>রক্তের গ্রুপ</th>
                                <th>হাসপাতাল</th>
                                <th>অবস্থান</th>
                                <th>তারিখ</th>
                                <th>স্ট্যাটাস</th>
                                <th>অ্যাকশন</th>
                            </tr>
                        </thead>
                        {/* টেবিল বডি */}
                        <tbody>
                            {requests.map((request, index) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <th>{index + 1}</th>
                                    <td className="font-bold text-lg text-red-600">{request.bloodGroup}</td>
                                    <td>{request.hospitalName}</td>
                                    <td>
                                        <p className='flex items-center text-sm'><MapPin size={14} className='mr-1 text-gray-500'/> {request.upazila}, {request.district}</p>
                                    </td>
                                    <td>
                                        <p className='flex items-center text-sm text-gray-600'>
                                            <Clock size={14} className='mr-1 text-red-500'/> 
                                            {new Date(request.donationDate).toLocaleDateString('bn-BD')}
                                        </p>
                                    </td>
                                    <td>
                                        {getStatusBadge(request.status)}
                                    </td>
                                    <td className='space-x-2'>
                                        {/* স্ট্যাটাস পরিবর্তনের বাটন */}
                                        <button 
                                            className="btn btn-sm btn-ghost text-green-600 hover:bg-green-100"
                                            onClick={() => handleStatusChange(request._id, request.status)}
                                            disabled={updateStatusMutation.isLoading || deleteRequestMutation.isLoading}
                                            title="স্ট্যাটাস পরিবর্তন করুন"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        
                                        {/* এডিট বাটন (যদি প্রয়োজন হয়) */}
                                        <button 
                                            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100"
                                            // এই বাটনে রিকোয়েস্ট এডিট করার মোডাল খোলা যেতে পারে
                                            title="বিস্তারিত/সম্পাদনা করুন"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        
                                        {/* ডিলিট বাটন */}
                                        <button 
                                            className="btn btn-sm btn-ghost text-red-600 hover:bg-red-100"
                                            onClick={() => handleDelete(request._id)}
                                            disabled={updateStatusMutation.isLoading || deleteRequestMutation.isLoading}
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

        </div>
    );
};

export default DonationRequestManagement;
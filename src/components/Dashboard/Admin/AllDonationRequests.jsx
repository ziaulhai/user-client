// src/components/Dashboard/Admin/AllDonationRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle, List, MapPin, Calendar, Clock, User, Droplet } from 'lucide-react';

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

    // --- ডেটা লোড করার লজিক (অপরিবর্তিত) ---
    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
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

    // --- স্ট্যাটাস আপডেট লজিক (অপরিবর্তিত) ---
    const handleStatusUpdate = (id, currentStatus, newStatus, recipientName) => {
        if (currentStatus === newStatus) return;

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
                    await axiosSecure.patch(`/api/v1/donation-requests/${id}`, { requestStatus: newStatus });
                    Swal.fire('সফল!', `স্ট্যাটাস সফলভাবে "${newStatus}" এ আপডেট হয়েছে।`, 'success');
                    fetchRequests();
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };

    // --- ডিলিট লজিক (অপরিবর্তিত) ---
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
        return <div className="text-center p-20 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="p-2 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-xl md:text-3xl font-bold text-red-600 mb-6 border-b pb-2 flex items-center">
                <List className='mr-2' /> সব ডোনেশন অনুরোধ ({requests.length})
            </h1>
            
            {/* Desktop Table View (Visible on LG screens) */}
            <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="table w-full">
                    <thead>
                        <tr className='text-gray-700 bg-gray-100 uppercase text-xs'>
                            <th>#</th>
                            <th>রোগী ও রক্তের গ্রুপ</th>
                            <th>অবস্থান ও তারিখ</th>
                            <th>অনুরোধকারী</th>
                            <th>ডোনার</th>
                            <th>স্ট্যাটাস</th>
                            <th className="text-center">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {requests.map((req, index) => (
                            <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                <th>{index + 1}</th>
                                <td>
                                    <p className='font-bold text-gray-800'>{req.recipientName}</p>
                                    <span className='badge badge-ghost badge-sm font-bold text-red-600'>{req.bloodGroup}</span>
                                </td>
                                <td>
                                    <p className='text-sm flex items-center gap-1'><MapPin size={12}/> {req.recipientUpazila}, {req.recipientDistrict}</p>
                                    <p className='text-xs text-gray-500 mt-1 flex items-center gap-1'>
                                        <Calendar size={12}/> {format(new Date(req.donationDate), 'dd MMM, yy')} <Clock size={12} className="ml-1"/> {req.donationTime}
                                    </p>
                                </td>
                                <td>
                                    <p className='text-sm font-medium'>{req.requesterName || 'N/A'}</p>
                                    <p className='text-xs text-gray-400'>{req.requesterEmail}</p>
                                </td>
                                <td>
                                    <p className='text-sm'>{req.donorName || 'N/A'}</p>
                                    <p className='text-[10px] text-gray-400'>{req.donorEmail || ''}</p>
                                </td>
                                <td>
                                    <div className={`badge text-white font-bold border-none ${getStatusClass(req.requestStatus)}`}>
                                        {req.requestStatus.toUpperCase()}
                                    </div>
                                </td>
                                <td className='flex flex-col gap-1'>
                                    {(req.requestStatus === 'pending' || req.requestStatus === 'inprogress') && (
                                        <div className="flex gap-1">
                                            <button onClick={() => handleStatusUpdate(req._id, req.requestStatus, 'done', req.recipientName)} className="btn btn-xs btn-success text-white flex-1"><CheckCircle size={12} /> ডন</button>
                                            <button onClick={() => handleStatusUpdate(req._id, req.requestStatus, 'canceled', req.recipientName)} className="btn btn-xs btn-warning text-white flex-1"><XCircle size={12} /> বাতিল</button>
                                        </div>
                                    )}
                                    <button onClick={() => handleDelete(req._id, req.recipientName)} className="btn btn-xs btn-error text-white w-full"><Trash2 size={12} /> ডিলিট (Admin)</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Layout (Visible on Small/Medium screens) */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
                {requests.map((req, index) => (
                    <div key={req._id} className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500 relative">
                        <span className="absolute top-2 right-4 text-xs font-bold text-gray-300">#{index + 1}</span>
                        
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    {req.recipientName} 
                                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-sm">{req.bloodGroup}</span>
                                </h3>
                                <div className={`badge badge-sm text-[10px] font-bold text-white mt-1 ${getStatusClass(req.requestStatus)}`}>
                                    {req.requestStatus.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {req.recipientUpazila}, {req.recipientDistrict}</p>
                            <p className="flex items-center gap-2"><Calendar size={14} className="text-gray-400"/> {format(new Date(req.donationDate), 'dd MMM, yyyy')} | <Clock size={14}/> {req.donationTime}</p>
                            <div className="pt-2 border-t mt-2">
                                <p className="text-[10px] uppercase font-bold text-gray-400">অনুরোধকারী:</p>
                                <p className="font-medium">{req.requesterName} ({req.requesterEmail})</p>
                            </div>
                            {req.donorName && (
                                <div className="pt-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400">ডোনার:</p>
                                    <p className="text-green-600 font-medium">{req.donorName}</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 border-t pt-3">
                            {(req.requestStatus === 'pending' || req.requestStatus === 'inprogress') && (
                                <>
                                    <button onClick={() => handleStatusUpdate(req._id, req.requestStatus, 'done', req.recipientName)} className="btn btn-sm btn-success text-white"><CheckCircle size={14} /> ডন</button>
                                    <button onClick={() => handleStatusUpdate(req._id, req.requestStatus, 'canceled', req.recipientName)} className="btn btn-sm btn-warning text-white"><XCircle size={14} /> বাতিল</button>
                                </>
                            )}
                            <button onClick={() => handleDelete(req._id, req.recipientName)} className="btn btn-sm btn-error text-white col-span-2 mt-1">
                                <Trash2 size={14} /> ডিলিট (Admin)
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {requests.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl mt-4">
                    <p className="text-gray-500">কোনো ডোনেশন অনুরোধ পাওয়া যায়নি।</p>
                </div>
            )}
        </div>
    );
};

export default AllDonationRequests;
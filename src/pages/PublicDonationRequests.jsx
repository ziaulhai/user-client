// src/pages/PublicDonationRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, MapPin, Calendar, Clock, Droplet } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

const PublicDonationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // --- ডেটা লোড করার ফাংশন (পাথ অপরিবর্তিত) ---
    const fetchPendingRequests = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/donation-requests/pending`);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching public pending requests:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingRequests();
    }, [fetchPendingRequests]);
    
    // --- ভিউ বাটন ক্লিক হ্যান্ডেলার (পাথ অপরিবর্তিত) ---
    const handleViewDetails = (id) => {
        navigate(`/donation-request/${id}`);
    };

    if (isLoading) {
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-[80vh]">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-red-600 mb-4 border-b pb-3">জরুরী রক্তদানের অনুরোধসমূহ</h1>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">এইখানে শুধুমাত্র অপেক্ষমাণ (Pending) অনুরোধগুলো দেখানো হচ্ছে। সাহায্য করতে লগইন করে বিস্তারিত দেখুন।</p>

            {requests.length === 0 ? (
                <div className="text-center p-16 bg-white rounded-xl shadow-lg border">
                    <h2 className="text-2xl font-bold text-gray-700">বর্তমানে কোনো রক্তদানের অনুরোধ নেই।</h2>
                    <p className="text-gray-500 mt-2">আপনার এলাকায় রক্তদানের অনুরোধ এলে আপনাকে জানানো হবে।</p>
                </div>
            ) : (
                <div className="w-full overflow-hidden">
                    {/* --- মোবাইল ভিউ: কার্ড লেআউট (শুধু ছোট স্ক্রিনে দেখাবে) --- */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {requests.map((request) => (
                            <div key={request._id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-600">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-2xl font-black text-red-600">{request.bloodGroup}</div>
                                    <button 
                                        onClick={() => handleViewDetails(request._id)}
                                        className="btn btn-sm bg-red-600 text-white border-none"
                                    >
                                        <Eye size={16} /> বিস্তারিত
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-700 text-sm font-medium">
                                        <MapPin size={16} className="mr-2 text-red-500" />
                                        {request.recipientDistrict}, {request.recipientUpazila}
                                    </div>
                                    <div className="flex items-center text-gray-600 text-xs pl-6">
                                        {request.hospitalName}
                                    </div>
                                    <div className="flex items-center text-gray-700 text-sm pt-2">
                                        <Calendar size={16} className="mr-2 text-blue-500" />
                                        {format(new Date(request.donationDate), 'dd MMM, yyyy')}
                                    </div>
                                    <div className="flex items-center text-gray-700 text-sm">
                                        <Clock size={16} className="mr-2 text-orange-500" />
                                        {request.donationTime}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- ডেস্কটপ ভিউ: টেবিল লেআউট (বড় স্ক্রিনে দেখাবে) --- */}
                    <div className="hidden md:block overflow-x-auto shadow-xl rounded-xl border">
                        <table className="table w-full bg-white">
                            <thead>
                                <tr className='text-gray-700 bg-red-50 text-base'>
                                    <th>#</th>
                                    <th>রোগীর অবস্থান</th>
                                    <th className="text-center">ব্লাড গ্রুপ</th>
                                    <th>তারিখ ও সময়</th>
                                    <th className="text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request, index) => (
                                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                                        <th>{index + 1}</th>
                                        <td>
                                            <p className='font-semibold'>{request.recipientDistrict}, {request.recipientUpazila}</p>
                                            <p className='text-xs text-gray-500'>{request.hospitalName}</p>
                                        </td>
                                        <td className='text-xl font-extrabold text-red-600 text-center'>{request.bloodGroup}</td>
                                        <td>
                                            <p className='font-medium'>{format(new Date(request.donationDate), 'dd MMM, yyyy')}</p>
                                            <p className='text-sm text-gray-600'>{request.donationTime}</p>
                                        </td>
                                        <td className="text-right">
                                            <button 
                                                onClick={() => handleViewDetails(request._id)}
                                                className="btn btn-sm bg-red-600 text-white hover:bg-red-700" 
                                            >
                                                <Eye size={16} className="mr-1" /> ভিউ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicDonationRequests;
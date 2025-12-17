// src/pages/PublicDonationRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // পাবলিক API কলের জন্য সাধারণ axios ব্যবহার করা হচ্ছে
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // আপনার .env ফাইল থেকে বেস URL

const PublicDonationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // --- ডেটা লোড করার ফাংশন ---
    const fetchPendingRequests = useCallback(async () => {
        try {
            // পাবলিক /pending রুট থেকে ডেটা লোড করা হচ্ছে
            const res = await axios.get(`${API_BASE_URL}/api/v1/donation-requests/pending`);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching public pending requests:", error);
            // এখানে একটি ইউজার-ফ্রেন্ডলি মেসেজ দেখানো যেতে পারে
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingRequests();
    }, [fetchPendingRequests]);
    
    // --- ভিউ বাটন ক্লিক হ্যান্ডেলার ---
    const handleViewDetails = (id) => {
        // অ্যাসাইনমেন্ট অনুযায়ী, ভিউ বাটন ক্লিক করলে লগইন পেজে রিডাইরেক্ট হবে
        // যদি ইউজার লগইন করা না থাকে। (PrivateRoute এ এই লজিকটি হ্যান্ডেল করা হবে)
        navigate(`/donation-request/${id}`);
    };


    if (isLoading) {
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-[80vh]">
            <h1 className="text-4xl font-bold text-center text-red-600 mb-8 border-b pb-3">জরুরী রক্তদানের অনুরোধসমূহ</h1>
            <p className="text-center text-gray-600 mb-10">এইখানে শুধুমাত্র অপেক্ষমাণ (Pending) অনুরোধগুলো দেখানো হচ্ছে। সাহায্য করতে লগইন করে বিস্তারিত দেখুন।</p>

            {requests.length === 0 ? (
                <div className="text-center p-16 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-700">বর্তমানে কোনো রক্তদানের অনুরোধ নেই।</h2>
                    <p className="text-gray-500 mt-2">আপনার এলাকায় রক্তদানের অনুরোধ এলে আপনাকে জানানো হবে।</p>
                </div>
            ) : (
                <div className="overflow-x-auto shadow-xl rounded-xl">
                    <table className="table w-full table-zebra bg-white">
                        <thead>
                            <tr className='text-gray-700 bg-red-50 text-base'>
                                <th>#</th>
                                <th>রোগীর অবস্থান</th>
                                <th>প্রয়োজনীয় ব্লাড গ্রুপ</th>
                                <th>প্রয়োজনীয় তারিখ ও সময়</th>
                                <th>অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request, index) => (
                                <tr key={request._id} className="hover:bg-gray-50">
                                    <th>{index + 1}</th>
                                    <td>
                                        <p className='font-semibold'>{request.recipientDistrict}, {request.recipientUpazila}</p>
                                        <p className='text-sm text-gray-500'>{request.hospitalName}</p>
                                    </td>
                                    <td className='text-xl font-extrabold text-red-600'>{request.bloodGroup}</td>
                                    <td>
                                        <p className='font-medium'>{format(new Date(request.donationDate), 'dd MMM, yyyy')}</p>
                                        <p className='text-sm text-gray-600'>{request.donationTime}</p>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewDetails(request._id)}
                                            className="btn btn-sm bg-red-600 text-white hover:bg-red-700 tooltip" 
                                            data-tip="বিস্তারিত দেখুন (লগইন প্রয়োজন)"
                                        >
                                            <Eye size={16} /> ভিউ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PublicDonationRequests;
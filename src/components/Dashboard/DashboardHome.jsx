// src/components/Dashboard/DashboardHome.jsx - চূড়ান্ত কার্যকরী সংস্করণ (ফান্ড ডেটা সহ)

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
// Dollar Sign ($) আইকন যোগ করা হলো
import { Heart, Droplet, MapPin, User, Clock, MessageSquare, List, DollarSign } from 'lucide-react'; 

// ব্লাড গ্রুপ আইকন রং
const getBloodGroupColor = (group) => {
    switch (group) {
        case 'A+': return 'text-red-600 bg-red-100';
        case 'B+': return 'text-blue-600 bg-blue-100';
        case 'O+': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

const DashboardHome = () => {
    const { user, userRole, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // ১. ড্যাশবোর্ড সামারি ডেটা ফেচ করা (রোল ভেদে পরিসংখ্যান)
    const { data: summaryData = {}, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['dashboardSummary', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/dashboard/summary/${userRole}?email=${user.email}`); 
            return res.data;
        },
        enabled: !!user?.email && !authLoading,
    });
    
    // 🔥 ২. মোট ফান্ডের পরিমাণ ফেচ করা (শুধুমাত্র অ্যাডমিন ও ভলান্টিয়ারের জন্য)
    const { data: fundData = { totalFundAmount: 0 }, isLoading: isFundLoading } = useQuery({
        queryKey: ['totalFundAmount'],
        queryFn: async () => {
            // এই রুটটি verifyJWT এবং verifyAdminOrVolunteer দ্বারা সুরক্ষিত
            const res = await axiosSecure.get(`/total-fund-amount`); 
            return res.data;
        },
        // শুধুমাত্র অ্যাডমিন বা ভলান্টিয়ার হলে তবেই ডেটা ফেচ করা হবে
        enabled: (userRole === 'admin' || userRole === 'volunteer') && !!user?.email,
    });


    // ৩. ডোনারদের জন্য সাম্প্রতিক ডোনেশন রিকোয়েস্ট ফেচ করা (শুধুমাত্র 'ডোনার' হলে)
    const { data: recentRequests = [], isLoading: isRequestsLoading } = useQuery({
        queryKey: ['recentDonationRequests', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/donation-requests/recent?email=${user.email}&limit=5`); 
            return res.data;
        },
        enabled: userRole === 'donor' && !!user?.email, 
    });


    if (authLoading || isSummaryLoading || isFundLoading) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span><p className='text-red-600'>ড্যাশবোর্ড লোড হচ্ছে...</p></div>;
    }

    // মোট ফান্ড রাউন্ড অফ করা
    const totalFunds = fundData.totalFundAmount ? parseFloat(fundData.totalFundAmount).toFixed(2) : '0.00';


    return (
        <div className="p-4 md:p-8">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-800">
                    স্বাগতম, <span className="text-red-600">{user?.displayName || 'ব্যবহারকারী'}!</span>
                </h1>
                <p className="text-gray-500 mt-1 flex items-center">
                    <User size={18} className='mr-1'/> আপনার বর্তমান রোল: <span className="font-bold ml-1 text-red-600">{userRole?.toUpperCase() || 'N/A'}</span>
                </p>
            </header>

            {/* --- ১. মূল পরিসংখ্যান কার্ড --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                
                {/* 🔥 নতুন কার্ড ৪: মোট ফান্ডের পরিমাণ (শুধুমাত্র Admin/Volunteer এর জন্য) */}
                {(userRole === 'admin' || userRole === 'volunteer') && (
                    <div className="stat bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl shadow-md p-5 order-first md:order-last">
                        <div className="stat-figure text-yellow-600">
                            <DollarSign size={36} /> 
                        </div>
                        <div className="stat-title font-semibold">মোট সংগৃহীত ফান্ড</div>
                        <div className="stat-value text-3xl font-extrabold text-yellow-600">
                            ${totalFunds}
                        </div>
                        <div className="stat-desc">সিস্টেমে ডোনেট হওয়া মোট পরিমাণ (USD)</div>
                    </div>
                )}
                
                {/* কার্ড ১: ডোনেশন সম্পূর্ণ */}
                <div className="stat bg-red-50 text-red-700 border border-red-200 rounded-xl shadow-md p-5">
                    <div className="stat-figure text-red-600">
                        <Heart size={36} />
                    </div>
                    <div className="stat-title font-semibold">সফল ডোনেশন</div>
                    <div className="stat-value text-3xl font-extrabold">{summaryData.totalCompletedDonations || 0}</div>
                    <div className="stat-desc">আপনার দ্বারা সম্পূর্ণ করা মোট ডোনেশন</div>
                </div>

                {/* কার্ড ২: পেন্ডিং রিকোয়েস্ট */}
                <div className="stat bg-blue-50 text-blue-700 border border-blue-200 rounded-xl shadow-md p-5">
                    <div className="stat-figure text-blue-600">
                        <List size={36} />
                    </div>
                    <div className="stat-title font-semibold">পেন্ডিং রিকোয়েস্ট</div>
                    <div className="stat-value text-3xl font-extrabold">{summaryData.totalPendingRequests || 0}</div>
                    <div className="stat-desc">আপনার এলাকায় সক্রিয় রিকোয়েস্ট</div>
                </div>
                
                {/* কার্ড ৩: প্রোফাইল স্ট্যাটাস/আপডেট */}
                <div className="stat bg-green-50 text-green-700 border border-green-200 rounded-xl shadow-md p-5">
                    <div className="stat-figure text-green-600">
                        <User size={36} />
                    </div>
                    <div className="stat-title font-semibold">প্রোফাইল স্ট্যাটাস</div>
                    <div className="stat-value text-3xl font-extrabold">সক্রিয়</div>
                    <div className="stat-desc">
                        <Link to="/dashboard/profile" className="text-green-600 hover:underline font-semibold">
                            প্রোফাইল আপডেট করুন
                        </Link>
                    </div>
                </div>

            </div>

            {/* --- ২. সাম্প্রতিক ডোনেশন রিকোয়েস্ট (ডোনারদের জন্য) --- */}
            {userRole === 'donor' && (
                <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-red-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MessageSquare size={24} className='text-red-600'/> আপনার এলাকার সাম্প্রতিক রিকোয়েস্ট
                    </h2>

                    {isRequestsLoading ? (
                         <div className="text-center p-5"><span className="loading loading-spinner text-red-600"></span></div>
                    ) : recentRequests.length === 0 ? (
                        <p className="text-gray-500 p-4 bg-gray-50 rounded-lg">বর্তমানে আপনার এলাকায় কোনো জরুরি ডোনেশন রিকোয়েস্ট নেই।</p>
                    ) : (
                        <div className="space-y-4">
                            {recentRequests.map((req) => (
                                <div key={req._id} className="p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                                    <div className="flex justify-between items-start">
                                        <div className='space-y-1'>
                                            <h3 className="text-xl font-semibold text-gray-800">{req.hospitalName}</h3>
                                            <p className="flex items-center text-sm text-gray-600">
                                                <MapPin size={16} className="mr-2 text-red-500"/> 
                                                {req.upazila}, {req.district}
                                            </p>
                                        </div>
                                        <div className={`badge badge-lg font-extrabold p-3 ${getBloodGroupColor(req.bloodGroup)}`}>
                                            {req.bloodGroup}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex justify-between items-center text-sm border-t pt-2">
                                        <p className="flex items-center text-gray-500">
                                            <Clock size={14} className="mr-1"/> 
                                            ডোনেশন তারিখ: **{new Date(req.donationDate).toLocaleDateString()}**
                                        </p>
                                        <Link 
                                            to={`/donation-requests/${req._id}`} 
                                            className="text-red-600 hover:underline font-semibold flex items-center"
                                        >
                                            বিস্তারিত দেখুন
                                        </Link>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* --- ৩. ভলান্টিয়ার/অ্যাডমিনদের জন্য অতিরিক্ত কার্ড --- */}
            {(userRole === 'volunteer' || userRole === 'admin') && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-xl border-l-4 border-blue-600">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">অ্যাডমিন/ভলান্টিয়ার কার্যক্ষেত্র</h2>
                    <p className="text-gray-600">
                        {userRole === 'admin' ? 'সিস্টেম অ্যাডমিনিস্ট্রেশন এবং ইউজার ম্যানেজমেন্টের জন্য ড্যাশবোর্ড মেনু ব্যবহার করুন।' : 'পেন্ডিং রিকোয়েস্ট এবং কন্টেন্ট ভেরিফিকেশন ম্যানেজ করুন।'}
                    </p>
                    <Link to="/dashboard/all-requests" className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 mt-4">
                        সমস্ত রিকোয়েস্ট দেখুন
                    </Link>
                </div>
            )}
            
        </div>
    );
};

export default DashboardHome;
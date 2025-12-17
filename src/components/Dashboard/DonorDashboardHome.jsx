// src/components/Dashboard/Donor/DonorDashboardHome.jsx - চূড়ান্ত ফিক্সড কোড

import React from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
// প্রয়োজনীয় আইকন ইম্পোর্ট
import { List, CheckCircle, XCircle, Clock, Calendar, User, Heart } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';

// স্ট্যাট কার্ড কম্পোনেন্ট 
const StatCard = ({ icon: Icon, title, value, colorClass }) => (
    <div className={`p-5 rounded-lg shadow-lg ${colorClass} text-white transition-transform hover:scale-[1.02] duration-300`}>
        <div className="flex items-center justify-between">
            <Icon size={32} />
            <div className="text-right">
                <p className="text-sm font-light uppercase">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </div>
    </div>
);

// ডেট ফরম্যাট করার জন্য একটি ইউটিলিটি ফাংশন
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // lastDonationDate সাধারণত ISO স্ট্রিং হয়
    return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const DonorDashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // ১. ডোনারের ব্যক্তিগত প্রোফাইল তথ্য লোড করা
    // প্রোফাইল ডেটা লোড করতে user/email রুট ব্যবহার করা হলো (যদি থাকে)
    const { data: donorProfile = {}, isLoading: isProfileLoading } = useQuery({
        queryKey: ['donorProfile', user?.email],
        queryFn: async () => {
            if (!user?.email) return {};
            // ধরে নেওয়া হলো GET /api/v1/users/email এ ইউজার ডেটা পাওয়া যায়
            const res = await axiosSecure.get(`/api/v1/users/${user.email}`);
            return res.data;
        },
        enabled: !!user?.email && !authLoading,
    });

    // ২. ডোনারের অনুরোধের পরিসংখ্যান লোড করা
    const { data: donorStats = {}, isLoading: isStatsLoading } = useQuery({
        queryKey: ['donorStats', user?.email],
        queryFn: async () => {
            if (!user?.email) return {};
            // 🔥 ফিক্সড: JWT টোকেন থেকে ইমেইল নেওয়ার কারণে URL প্যারামিটার বাদ দেওয়া হলো 
            const res = await axiosSecure.get(`/api/v1/stats/donor-stats`);
            return res.data;
        },
        enabled: !!user?.email && !authLoading,
    });

    if (authLoading || isProfileLoading || isStatsLoading) {
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    // stats থেকে ডেটা এক্সট্রাক্ট করা
    const {
        myTotalRequests = 0,
        pending = 0,
        inprogress = 0,
        done = 0,
        canceled = 0
    } = donorStats;

    return (
        <div className="p-4 md:p-8 rounded-xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">স্বাগতম, <span className='text-red-600'>{user?.displayName || 'ডোনার'}</span></h1>

            {/* --- ব্যক্তিগত তথ্য কার্ড --- */}
            <div className='bg-white p-6 rounded-xl shadow-2xl border-l-4 border-red-600 mb-8'>
                <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center"><User size={24} className='mr-2' /> ব্যক্তিগত তথ্য</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <p className='flex items-center'>
                        <span className='font-semibold mr-2'>নাম:</span> {donorProfile.name || 'N/A'}
                    </p>
                    <p className='flex items-center'>
                        <span className='font-semibold mr-2'>ইমেইল:</span> {donorProfile.email || 'N/A'}
                    </p>
                    <p className='flex items-center'>
                        <span className='font-semibold mr-2'>রোল:</span> <span className='badge bg-red-100 text-red-800 font-bold ml-1'>{donorProfile.role?.toUpperCase() || 'DONOR'}</span>
                    </p>
                    <p className='flex items-center'>
                        <span className='font-semibold mr-2'>অবস্থান:</span> {donorProfile.upazila || 'N/A'}, {donorProfile.district || 'N/A'}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className='flex items-center text-lg font-bold text-green-600'>
                        <Calendar size={20} className='mr-2' /> শেষ রক্তদান: {formatDate(donorProfile.lastDonationDate)}
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                        (আপনার প্রোফাইল আপডেট করে তারিখটি পরিবর্তন করতে পারেন)
                    </p>
                </div>

            </div>


            {/* --- ডোনেশন স্ট্যাটস --- */}
            <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-5 border-b pb-2">আমার অনুরোধের পরিসংখ্যান</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={List}
                    title="মোট অনুরোধ"
                    value={myTotalRequests}
                    colorClass="bg-purple-600"
                />
                <StatCard
                    icon={Clock}
                    title="পেন্ডিং"
                    value={pending}
                    colorClass="bg-yellow-500"
                />
                <StatCard
                    icon={CheckCircle}
                    title="সম্পন্ন (Done)"
                    value={done}
                    colorClass="bg-green-600"
                />
                <StatCard
                    icon={Heart} // inprogress-এর জন্য এটি উপযুক্ত হতে পারে
                    title="চলমান (In Progress)"
                    value={inprogress}
                    colorClass="bg-indigo-500"
                />
                <StatCard
                    icon={XCircle}
                    title="বাতিল (Canceled)"
                    value={canceled}
                    colorClass="bg-gray-500"
                />
            </div>

        </div>
    );
};

export default DonorDashboardHome;
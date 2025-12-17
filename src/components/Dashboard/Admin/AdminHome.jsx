import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
// Shield বা অন্য কোনো আইকন ব্যবহার করা যেতে পারে, তবে আমি টাকা বোঝাতে DollarSign (যদি lucide-react এ থাকে) বা Shield ব্যবহার করছি।
import { Users, Droplet, CheckCircle, Clock, Shield, XCircle, DollarSign } from 'lucide-react'; 

// কার্ডের ডেটা স্ট্রাকচার এবং আইকন
// 🔥 পরিবর্তন: নতুন 'মোট ফান্ডিং' কার্ড যোগ করা হয়েছে
const getStatCards = (stats) => [
    {
        title: 'মোট ব্যবহারকারী',
        value: stats?.totalUsers || 0,
        icon: Users,
        color: 'bg-blue-500',
    },
    {
        title: 'মোট রক্তদানের অনুরোধ',
        value: stats?.totalRequests || 0,
        icon: Droplet,
        color: 'bg-red-600',
    },
    {
        title: 'সম্পূর্ণ ডোনেশন',
        value: stats?.done || 0,
        icon: CheckCircle,
        color: 'bg-green-500',
    },
    {
        title: 'পেন্ডিং অনুরোধ',
        value: stats?.pending || 0,
        icon: Clock,
        color: 'bg-yellow-500',
    },
    // 🔥🔥 নতুন কার্ড: মোট ফান্ডিং এর পরিমাণ
    {
        title: 'মোট ফান্ডিং (টাকা/USD)',
        // ধরে নেওয়া হচ্ছে সার্ভার থেকে stats.totalFunding একটি সংখ্যা হিসাবে আসছে
        value: `$${(stats?.totalFunding || 0).toLocaleString('en-US')}`, 
        icon: DollarSign, // বা Shield
        color: 'bg-purple-600', // একটি নতুন রঙ ব্যবহার করা হলো
    },
    {
        title: 'মোট ডোনার (Active)',
        value: stats?.totalDonors || 0,
        icon: Shield,
        color: 'bg-indigo-500',
    },
    {
        title: 'বাতিল অনুরোধ',
        value: stats?.canceled || 0,
        icon: XCircle,
        color: 'bg-gray-500',
    },
];

const AdminHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    // ১. অ্যাডমিন পরিসংখ্যান ডেটা ফেচ করা
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            // সার্ভার রুটের সাথে মিলিয়ে /stats/admin-stats ব্যবহার করা হলো
            const res = await axiosSecure.get('/api/v1/stats/admin-stats');
            return res.data;
        }
    });

    if (isStatsLoading) {
        return <div className="text-center p-20 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    // 🔥 অতিরিক্ত কার্ডটিকে getStatCards(stats) ফাংশনে পাঠিয়ে মোট কার্ডের তালিকা বানানো হলো
    const statCards = getStatCards(stats);

    return (
        <div className="p-4 md:p-8">
            {/* ওয়েলকাম সেকশন */}
            <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-600 rounded-lg shadow-md">
                <h1 className="text-3xl font-extrabold text-red-700">স্বাগতম, অ্যাডমিন!</h1>
                <p className="text-xl font-semibold text-gray-700 mt-2">{user?.displayName || 'অ্যাডমিন ইউজার'}</p>
                <p className="text-sm text-gray-500 mt-1">এই ড্যাশবোর্ডে আপনি অ্যাপ্লিকেশনের কার্যক্রম পর্যবেক্ষণ করতে পারবেন।</p>
            </div>

            {/* পরিসংখ্যান কার্ড সেকশন */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Droplet className='mr-2' /> অ্যাপ্লিকেশনের পরিসংখ্যান</h2>
            
            {/* 7টি কার্ডের জন্য lg:grid-cols-4 করা যেতে পারে, তবে 3টি কলামে র্যাপ হবে */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-xl shadow-lg transform transition duration-300 hover:scale-[1.02] text-white ${card.color}`}
                    >
                        <div className="flex items-center justify-between">
                            <card.icon size={36} className="opacity-75" />
                            <div className="text-right">
                                <p className="text-xl font-medium">{card.title}</p>
                                <p className="text-4xl font-bold mt-1">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminHome;
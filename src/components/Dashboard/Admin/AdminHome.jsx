import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Users, Droplet, CheckCircle, Clock, Shield, XCircle, DollarSign, LayoutDashboard } from 'lucide-react'; 

// কার্ডের ডেটা স্ট্রাকচার এবং আইকন
// লজিক এবং ডেটা কি (Key) আগের মতোই রাখা হয়েছে
const getStatCards = (stats) => [
    {
        title: 'মোট ব্যবহারকারী',
        value: stats?.totalUsers || 0,
        icon: Users,
        color: 'from-blue-500 to-blue-600',
    },
    {
        title: 'মোট রক্তদানের অনুরোধ',
        value: stats?.totalRequests || 0,
        icon: Droplet,
        color: 'from-red-600 to-red-700',
    },
    {
        title: 'সম্পূর্ণ ডোনেশন',
        value: stats?.done || 0,
        icon: CheckCircle,
        color: 'from-green-500 to-green-600',
    },
    {
        title: 'পেন্ডিং অনুরোধ',
        value: stats?.pending || 0,
        icon: Clock,
        color: 'from-yellow-500 to-yellow-600',
    },
    {
        title: 'মোট ফান্ডিং',
        value: `$${(stats?.totalFunding || 0).toLocaleString('en-US')}`, 
        icon: DollarSign, 
        color: 'from-purple-600 to-purple-700', 
    },
    {
        title: 'মোট ডোনার (Active)',
        value: stats?.totalDonors || 0,
        icon: Shield,
        color: 'from-indigo-500 to-indigo-600',
    },
    {
        title: 'বাতিল অনুরোধ',
        value: stats?.canceled || 0,
        icon: XCircle,
        color: 'from-gray-500 to-gray-600',
    },
];

const AdminHome = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    // ১. অ্যাডমিন পরিসংখ্যান ডেটা ফেচ করা (পাথ অপরিবর্তিত)
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/api/v1/stats/admin-stats');
            return res.data;
        }
    });

    if (isStatsLoading) {
        return (
            <div className="text-center p-20 min-h-[60vh] flex flex-col items-center justify-center">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
                <p className="mt-4 text-gray-500 font-medium">পরিসংখ্যান লোড হচ্ছে...</p>
            </div>
        );
    }

    const statCards = getStatCards(stats);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-10">
            {/* ওয়েলকাম সেকশন - উন্নত ডিজাইন */}
            <div className="relative overflow-hidden bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <LayoutDashboard size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">ড্যাশবোর্ড ওভারভিউ</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800">
                        স্বাগতম, <span className="text-red-600">{user?.displayName || 'অ্যাডমিন'}</span>!
                    </h1>
                    <p className="text-gray-500 mt-3 max-w-2xl leading-relaxed">
                        আপনার ব্লাড ডোনেশন নেটওয়ার্কের বর্তমান অবস্থা এবং কার্যক্রম এখান থেকে পর্যবেক্ষণ ও পরিচালনা করুন।
                    </p>
                </div>
                {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-50 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {/* পরিসংখ্যান সেকশন হেডার */}
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <Droplet size={24} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">অ্যাপ্লিকেশনের মূল পরিসংখ্যান</h2>
            </div>

            {/* রেসপন্সিভ গ্রিড লেআউট */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className={`relative group overflow-hidden p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${card.color}`}
                    >
                        <div className="flex flex-col h-full justify-between relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <card.icon size={28} className="text-white" />
                                </div>
                                <div className="h-1 w-12 bg-white/30 rounded-full"></div>
                            </div>
                            
                            <div>
                                <p className="text-white/80 text-sm font-semibold uppercase tracking-wide">
                                    {card.title}
                                </p>
                                <p className="text-white text-3xl font-bold mt-1 tracking-tight">
                                    {card.value}
                                </p>
                            </div>
                        </div>

                        {/* কার্ড ব্যাকগ্রাউন্ড ডেকোরেশন আইকন */}
                        <card.icon 
                            size={100} 
                            className="absolute -bottom-4 -right-4 text-white/10 rotate-12 transition-transform group-hover:scale-110 duration-500" 
                        />
                    </div>
                ))}
            </div>
            
            {/* নিচের দিকে বাড়তি স্পেস বা ফুটার কন্টেন্ট চাইলে এখানে যোগ করা যাবে */}
        </div>
    );
};

export default AdminHome;
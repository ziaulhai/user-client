// src/components/Dashboard/Admin/AdminDashboard.jsx - চূড়ান্ত ফিক্সড কোড

import React from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
// Loader আইকনটি ইম্পোর্ট করা হলো:
import { Users, Droplets, List, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import useAdmin from '../../../hooks/useAdmin';

// স্ট্যাট কার্ড কম্পোনেন্ট
const StatCard = ({ icon: Icon, title, value, colorClass }) => (
    <div className={`p-5 rounded-lg shadow-lg ${colorClass} text-white transition-transform hover:scale-[1.02] duration-300`}>
        <div className="flex items-center justify-between">
            <Icon size={36} />
            <div className="text-right">
                <p className="text-sm font-light uppercase">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const { isAdmin, isAdminLoading } = useAdmin();
    const axiosSecure = useAxiosSecure();

    // ডেটা লোড করার জন্য react-query ব্যবহার করা হলো
    const { data: stats = {}, isLoading: isStatsLoading } = useQuery({
        queryKey: ['adminStats', user?.email],
        queryFn: async () => {
            // isAdmin চেক করা: এটি নিশ্চিত করে যে অ্যাডমিন ইউজারই কল করছে
            if (!user?.email || !isAdmin) return {};

            // ✅ রুট ফিক্সড: /api/v1 প্রিফিক্স ব্যবহার করা হলো (যদি মেইন axiosSecure এ প্রিফিক্স না থাকে)
            const res = await axiosSecure.get('/api/v1/stats/admin-stats');
            return res.data;
        },
        enabled: !!user && !!isAdmin && !isAdminLoading,
    });

    if (isAdminLoading || isStatsLoading) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (!isAdmin) {
        return <div className="text-center p-10 text-red-600 font-bold">আপনার এই পেজ দেখার অনুমতি নেই।</div>;
    }

    const {
        totalDonors = 0,
        totalUsers = 0,
        totalRequests = 0,
        pending = 0,
        inprogress = 0,
        done = 0,
        canceled = 0
    } = stats;


    return (
        <div className="p-4 md:p-8 rounded-xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">স্বাগতম, <span className='text-red-600'>{user?.displayName || 'অ্যাডমিন'}</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    title="মোট ইউজার"
                    value={totalUsers}
                    colorClass="bg-red-600"
                />
                <StatCard
                    icon={Droplets}
                    title="সক্রিয় ডোনার"
                    value={totalDonors}
                    colorClass="bg-blue-600"
                />
                <StatCard
                    icon={List}
                    title="মোট অনুরোধ"
                    value={totalRequests}
                    colorClass="bg-purple-600"
                />
            </div>

            <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-5 border-b pb-2">ডোনেশন অনুরোধ স্ট্যাটাস</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Clock}
                    title="পেন্ডিং"
                    value={pending}
                    colorClass="bg-yellow-500"
                />
                <StatCard
                    icon={Loader}
                    title="চলমান (In Progress)"
                    value={inprogress}
                    colorClass="bg-indigo-500"
                />
                <StatCard
                    icon={CheckCircle}
                    title="সম্পন্ন (Done)"
                    value={done}
                    colorClass="bg-green-600"
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

export default AdminDashboard;
// src/components/Dashboard/DonorDashboard.jsx - সংশোধিত ও চূড়ান্ত

import React from 'react';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
// ✅ User এবং Info আইকন যুক্ত করা হলো
import { List, PlusCircle, ArrowRight, CheckCircle, XCircle, Clock, ShieldOff, Heart, User, Info } from 'lucide-react'; 
import { useQuery } from '@tanstack/react-query';

// --- Helper Functions ---
const getStatusClass = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'inprogress': return 'bg-blue-100 text-blue-800';
        case 'done': return 'bg-green-100 text-green-800';
        case 'canceled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// --- Stat Card Component (পরিসংখ্যান প্রদর্শনের জন্য) ---
const StatCard = ({ icon: Icon, title, value, colorClass }) => (
    <div className={`p-5 rounded-lg shadow-lg ${colorClass} text-white transition-transform hover:scale-[1.02] duration-300`}>
        <div className="flex items-center justify-between">
            <Icon size={36} />
            <div className="text-right">
                <p className="text-sm font-light uppercase">{title}</p>
                <p className="text-3xl font-bold">{value || 0}</p>
            </div>
        </div>
    </div>
);
// --------------------------------------------------------

const DonorDashboard = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const isQueryEnabled = !loading && !!user?.email;

    // ১. ইউজারের প্রোফাইল ডেটা লোড করা 
    const { data: dbUser = {}, isLoading: isUserLoading } = useQuery({
        queryKey: ['dbUser', user?.email],
        queryFn: async () => {
             if (!user?.email) return {};
             // ✅ API রুট ঠিক রাখা হলো: /api/v1/users/:email
             const res = await axiosSecure.get(`/api/v1/users/${user.email}`); 
             return res.data;
        },
        enabled: isQueryEnabled,
    });


    // ২. ডোনার পরিসংখ্যান লোড করা
    // এই ডেটা শুধু ভলান্টিয়ার/অ্যাডমিনের জন্য ব্যবহৃত হবে, কিন্তু ডোনারও লোড করতে পারে।
    const { data: stats = {}, isLoading: isStatsLoading } = useQuery({
        queryKey: ['donorStats', user?.email],
        queryFn: async () => {
            if (!user?.email) return {};
            // ✅ API রুট ঠিক রাখা হলো: /api/v1/stats/donor-stats
            const res = await axiosSecure.get('/api/v1/stats/donor-stats'); 
            return res.data;
        },
        // শুধু ভলান্টিয়ার/অ্যাডমিন হলে ডেটা লোড করার এনাবলমেন্ট অপটিমাইজ করা হলো 
        enabled: isQueryEnabled && (dbUser?.role === 'volunteer' || dbUser?.role === 'admin'),
    });

    // ৩. সাম্প্রতিক অনুরোধ লোড করা 
    // এই ডেটা শুধু ভলান্টিয়ার/অ্যাডমিনের জন্য ব্যবহৃত হবে
    const { data: allRequests = [], isLoading: isRequestsLoading } = useQuery({
        queryKey: ['myAllRequests', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            // ✅ API রুট ঠিক রাখা হলো: /api/v1/donation-requests/my-requests
            const res = await axiosSecure.get('/api/v1/donation-requests/my-requests'); 
            return res.data;
        },
        // শুধু ভলান্টিয়ার/অ্যাডমিন হলে ডেটা লোড করার এনাবলমেন্ট অপটিমাইজ করা হলো 
        enabled: isQueryEnabled && (dbUser?.role === 'volunteer' || dbUser?.role === 'admin'),
    });

    // রোল এবং স্ট্যাটাস চেক
    const userRole = dbUser?.role; // রোল dbUser থেকে আসছে
    const isUserBlocked = dbUser?.status === 'blocked';
    
    // ভলান্টিয়ার/অ্যাডমিন-এর জন্য প্রযোজ্য ডেটা
    const recentRequests = allRequests.slice(0, 3);
    const totalRequests = stats.myTotalRequests || 0; 
    const { pending = 0, done = 0, canceled = 0 } = stats; 
    
    const userName = dbUser?.name || user?.displayName || user?.email?.split('@')[0] || "ব্যবহারকারী"; 

    // লোডিং চেক (ডোনারের জন্য শুধু dbUser লোডিং চেক হবে, কারণ অন্যগুলো অপটিমাইজড)
    const isDashboardLoading = loading || isUserLoading || (userRole !== 'donor' && (isStatsLoading || isRequestsLoading));

    if (isDashboardLoading) { 
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    // ----------------------------------------------------
    // 🔥 ব্লকড ইউজারের জন্য রেন্ডারিং
    // ----------------------------------------------------
    if (isUserBlocked) {
        return (
             <div className="p-10 min-h-[50vh] flex flex-col items-center justify-center bg-red-50 rounded-xl shadow-lg">
                <ShieldOff className='text-red-600 mb-4' size={60} />
                <h1 className="text-3xl font-extrabold text-red-600">অ্যাকাউন্ট ব্লকড!</h1>
                <p className="mt-4 text-gray-700 text-center max-w-lg">
                    অ্যাডমিনিস্ট্রেটর আপনার অ্যাকাউন্টটি ব্লক করেছেন।
                </p>
            </div>
        );
    }
    
    // ----------------------------------------------------
    // 🔥 ১. ডোনার ড্যাশবোর্ড (সীমিত অ্যাক্সেস)
    // ----------------------------------------------------
    if (userRole === 'donor') {
        return (
            <div className="space-y-10">
                {/* ওয়েলকাম সেকশন */}
                <div className="p-8 bg-white rounded-xl shadow-lg border-l-4 border-green-600">
                    <h1 className="text-3xl font-extrabold text-gray-800">স্বাগতম, <span className="text-green-600">{userName}</span>! 👋</h1>
                    <p className="mt-2 text-gray-500">আপনার বর্তমান ভূমিকা হলো একজন **ডোনার**। আপনার কাজ হলো জীবন বাঁচাতে রক্তদান করা।</p>
                    <p className="mt-2 text-sm text-gray-400">আপনার ড্যাশবোর্ডটি শুধু প্রোফাইল আপডেটের জন্য ব্যবহার করা যেতে পারে।</p>
                </div>
                
                {/* ডোনার অ্যাকশন কার্ড - শুধুমাত্র প্রোফাইল ও ডোনেট বাটন */}
                <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-5 border-b pb-2">ডোনার হিসাবে আপনার করণীয়</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* ১. প্রোফাইল আপডেট বাটন */}
                    <Link to="/dashboard/profile" className="card bg-blue-100 text-blue-800 shadow-xl hover:shadow-2xl transition duration-300">
                        <div className="card-body">
                            <User className="mb-2 text-blue-600" size={32} />
                            <h2 className="card-title text-2xl font-bold">প্রোফাইল আপডেট</h2>
                            <p>আপনার ব্যক্তিগত তথ্য ও যোগাযোগের বিবরণ আপডেট করুন।</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="flex items-center text-blue-600">আপডেট করুন <ArrowRight size={16} className="ml-1" /></span>
                            </div>
                        </div>
                    </Link>
                    
                    {/* ২. অন্যান্য অনুরোধ দেখুন (পাবলিক পেজ) */}
                    <Link to="/donation-requests" className="card bg-red-600 text-white shadow-xl hover:shadow-2xl transition duration-300">
                        <div className="card-body">
                            <Heart className="mb-2" size={32} />
                            <h2 className="card-title text-2xl font-bold">ডোনেট করুন</h2>
                            <p className="text-gray-100">আপনার কাছাকাছি প্রয়োজনীয় রক্তদানের অনুরোধগুলো দেখুন।</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="flex items-center">অনুরোধ দেখুন <ArrowRight size={16} className="ml-1" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* ৩. ফাঁকা কার্ড (ডিজাইন বজায় রাখার জন্য রাখা যেতে পারে, কিন্তু কোনো টেক্সট বা লিঙ্ক নেই) */}
                    <div className="card bg-gray-50 shadow-inner">
                        <div className="card-body text-gray-400 justify-center items-center">
                            <Info className="mb-2" size={32} />
                            <h2 className="card-title text-xl font-bold">সীমিত অ্যাক্সেস</h2>
                        </div>
                    </div>
                    
                </div>
            </div>
        );
    }

    // ----------------------------------------------------
    // 🔥 ২. ভলান্টিয়ার / অ্যাডমিন ড্যাশবোর্ড (পূর্ণ অ্যাক্সেস)
    // ----------------------------------------------------
    if (userRole === 'volunteer' || userRole === 'admin') {
        const roleColor = userRole === 'admin' ? 'text-purple-600' : 'text-red-600';

        return (
            <div className="space-y-10">
                {/* ১. ওয়েলকাম সেকশন */}
                <div className="p-8 bg-white rounded-xl shadow-lg border-l-4 border-red-600">
                    <h1 className="text-3xl font-extrabold text-gray-800">স্বাগতম, <span className={roleColor}>{userName}</span>! 👋</h1>
                    <p className="mt-2 text-gray-500">
                        আপনার বর্তমান ভূমিকা হলো **{userRole === 'admin' ? 'অ্যাডমিন' : 'ভলান্টিয়ার'}**। আপনার অতিরিক্ত সুবিধা হলো নতুন ডোনেশন রিকোয়েস্ট তৈরি করা এবং সেগুলি পরিচালনা করা।
                    </p>
                </div>
                
                {/* ২. পরিসংখ্যান কার্ড */}
                <h2 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-2">আমার পরিসংখ্যান</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={List} 
                        title="মোট অনুরোধ" 
                        value={totalRequests} 
                        colorClass="bg-red-600"
                    />
                    <StatCard 
                        icon={Clock} 
                        title="পেন্ডিং" 
                        value={pending} 
                        colorClass="bg-yellow-500"
                    />
                    <StatCard 
                        icon={CheckCircle} 
                        title="সম্পন্ন" 
                        value={done} 
                        colorClass="bg-green-600"
                    />
                    <StatCard 
                        icon={XCircle} 
                        title="বাতিল" 
                        value={canceled} 
                        colorClass="bg-gray-500"
                    />
                </div>
                
                {/* ৩. অ্যাকশন কার্ড (Quick Actions) */}
                <h2 className="text-2xl font-bold text-gray-700 mt-10 mb-5 border-b pb-2">তাড়াতাড়ি অ্যাকশন</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* আমার অনুরোধসমূহ - ভলান্টিয়ার/অ্যাডমিনের জন্য */}
                    <Link to="/dashboard/my-donation-requests" className="card bg-white shadow-xl hover:shadow-2xl transition duration-300">
                        <div className="card-body">
                            <List className="text-red-600 mb-2" size={32} />
                            <h2 className="card-title text-2xl font-bold">{totalRequests}টি</h2>
                            <p className="text-gray-500">মোট অনুরোধ করেছেন</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="text-red-600 flex items-center">সব অনুরোধ দেখুন <ArrowRight size={16} className="ml-1" /></span>
                            </div>
                        </div>
                    </Link>
                    
                    {/* নতুন অনুরোধ তৈরি - ভলান্টিয়ার/অ্যাডমিনের জন্য (বাড়তি সুবিধা) */}
                    <Link to="/dashboard/create-donation-request" className="card bg-red-600 text-white shadow-xl hover:shadow-2xl transition duration-300">
                        <div className="card-body">
                            <PlusCircle className="mb-2" size={32} />
                            <h2 className="card-title text-2xl font-bold">নতুন অনুরোধ</h2>
                            <p className="text-gray-100">রক্তের জন্য একটি নতুন অনুরোধ জমা দিন</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="flex items-center">অনুরোধ তৈরি করুন <ArrowRight size={16} className="ml-1" /></span>
                            </div>
                        </div>
                    </Link>
                     
                    {/* প্রোফাইল আপডেট - ভলান্টিয়ার/অ্যাডমিনের জন্যও প্রয়োজন */}
                    <Link to="/dashboard/profile" className="card bg-blue-100 text-blue-800 shadow-xl hover:shadow-2xl transition duration-300">
                        <div className="card-body">
                            <User className="mb-2 text-blue-600" size={32} />
                            <h2 className="card-title text-2xl font-bold">প্রোফাইল</h2>
                            <p>আপনার ব্যক্তিগত তথ্য ও যোগাযোগের বিবরণ আপডেট করুন।</p>
                            <div className="card-actions justify-end mt-4">
                                <span className="flex items-center text-blue-600">আপডেট করুন <ArrowRight size={16} className="ml-1" /></span>
                            </div>
                        </div>
                    </Link>
                    
                </div>
                
                {/* ৪. সাম্প্রতিক অনুরোধ সেকশন */}
                <div className="p-8 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-2">সাম্প্রতিক {recentRequests.length}টি রক্তদানের অনুরোধ</h2>
                    
                    {/* ... টেবিল রেন্ডারিং লজিক ... */}
                    {recentRequests.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">{userName}, আপনি এখনো কোনো অনুরোধ তৈরি করেননি।</p>
                            <Link to="/dashboard/create-donation-request" className="btn btn-sm bg-red-600 text-white mt-4 hover:bg-red-700">প্রথম অনুরোধটি তৈরি করুন</Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr className='text-gray-700'>
                                            <th>রোগীর নাম</th>
                                            <th>অবস্থান</th>
                                            <th>ব্লাড গ্রুপ</th>
                                            <th>তারিখ ও সময়</th>
                                            <th>স্ট্যাটাস</th>
                                            <th>অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentRequests.map((request) => (
                                            <tr key={request._id}>
                                                <td className='font-semibold'>{request.recipientName}</td>
                                                <td>{request.recipientDistrict}, {request.recipientUpazila}</td>
                                                <td className='text-red-500 font-bold'>{request.bloodGroup}</td>
                                                <td>
                                                    <p>{format(new Date(request.donationDate), 'dd MMM, yyyy')}</p>
                                                    <p className='text-xs text-gray-500'>{request.donationTime}</p>
                                                </td>
                                                <td>
                                                    <span className={`badge text-xs font-semibold ${getStatusClass(request.requestStatus)}`}>
                                                        {request.requestStatus.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link to={`/donation-request/${request._id}`} className="btn btn-xs btn-outline btn-neutral">
                                                        ভিউ
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {totalRequests > 3 && (
                                <div className="text-center mt-6">
                                    <Link to="/dashboard/my-donation-requests" className="btn bg-red-600 text-white hover:bg-red-700">
                                        আমার সব অনুরোধ দেখুন
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        );
    }
    
    // রোল না চিনতে পারলে বা অন্য কোনো সমস্যা হলে (গার্ড)
    return (
        <div className="p-10 min-h-[50vh] flex flex-col items-center justify-center bg-yellow-50 rounded-xl shadow-lg">
            <Heart className='text-yellow-600 mb-4' size={60} />
            <h1 className="text-3xl font-extrabold text-yellow-600">অ্যাক্সেস অনুমোদিত নয়</h1>
            <p className="mt-4 text-gray-700 text-center max-w-lg">
                আপনার বর্তমান রোল ({userRole?.toUpperCase() || 'N/A'}) ড্যাশবোর্ড অ্যাক্সেসের জন্য অনুমোদিত নয়।
            </p>
        </div>
    );
};

export default DonorDashboard;
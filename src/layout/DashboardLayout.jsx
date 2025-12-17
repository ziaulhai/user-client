// src/layout/DashboardLayout.jsx

import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/Dashboard/DashboardNavbar";
import Sidebar from "../components/Dashboard/Sidebar";
import useAuth from "../hooks/useAuth"; // 🔥 নতুন ইম্পোর্ট
import useAdmin from "../hooks/useAdmin"; // 🔥 নতুন ইম্পোর্ট

const DashboardLayout = () => {
    const { user, loading } = useAuth(); // Auth স্টেট
    const { isAdmin, isAdminLoading } = useAdmin(); // Admin Role এবং লোডিং স্টেট

    // 🚨 লোডিং স্টেট হ্যান্ডেল করা হচ্ছে
    if (loading || isAdminLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* ডেক্সটপ সাইডবার */}
            <div className="hidden md:block w-64 bg-white shadow-lg sticky top-0 h-screen">
                {/* 🔥 isAdmin স্ট্যাটাসটি Sidebar-এ পাঠানো হলো */}
                <Sidebar isAdmin={isAdmin} /> 
            </div>
            
            <div className="flex-1 flex flex-col">
                {/* নেভিগেশন বার */}
                <DashboardNavbar />
                
                {/* মূল কনটেন্ট এরিয়া */}
                <main className="p-4 md:p-8 flex-1">
                    <Outlet /> {/* ড্যাশবোর্ড পেজগুলো এখানে রেন্ডার হবে */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
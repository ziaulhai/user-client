import React, { useState } from 'react'; // useState যুক্ত করা হয়েছে
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { List, LayoutDashboard, Heart, Shield, Users, LogOut, Home as HomeIcon, BookOpen, UserPlus, DollarSign, Menu, X } from 'lucide-react'; // Menu, X আইকন যুক্ত করা হয়েছে

// কাস্টম লিঙ্ক কম্পোনেন্ট (অপরিবর্তিত)
const SidebarLink = ({ to, icon, label, className = '' }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => 
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${className} ${
                    isActive
                        ? 'bg-red-50 text-red-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-red-500'
                }`
            }
        >
            {icon && <span className="mr-3">{icon}</span>}
            {label}
        </NavLink>
    );
};


// Sidebar কম্পোনেন্ট
const Sidebar = () => { 
    const { userRole, userStatus, logOut } = useAuth(); 
    const [isOpen, setIsOpen] = useState(false); // মোবাইল মেনু ওপেন/ক্লোজ স্টেট

    const ROLE_MAP = {
        'admin': 'অ্যাডমিন',
        'donor': 'ডোনার',
        'volunteer': 'ভলান্টিয়ার',
    };
    
    const getFormattedRole = (role) => {
        if (!role) return 'ব্যবহারকারী'; 
        return ROLE_MAP[role.toLowerCase()] || (role.charAt(0).toUpperCase() + role.slice(1));
    }

    const getStatusInfo = (status) => {
        if (!status) {
            return { label: 'অজানা', className: 'bg-gray-200 text-gray-700' };
        }
        
        const lowerStatus = status.toLowerCase();
        
        if (lowerStatus === 'active') {
            return { label: 'এক্টিভ', className: 'bg-green-100 text-green-700' };
        } else if (lowerStatus === 'blocked') {
            return { label: 'ব্লকড', className: 'bg-red-100 text-red-700' };
        } else {
            return { label: status.charAt(0).toUpperCase() + status.slice(1), className: 'bg-gray-200 text-gray-700' };
        }
    };
    
    const statusInfo = getStatusInfo(userStatus);

    // ----------------------------------------------------------------------
    // সাধারণ লিঙ্কসমূহ (সকল ইউজারের জন্য) - এখানে ফান্ডিং লিঙ্ক নেই
    const commonLinks = (
        <>
            <SidebarLink to="/" icon={<HomeIcon size={18} />} label="হোমপেজ" />
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="ড্যাশবোর্ড হোম" />
            <SidebarLink to="/dashboard/profile" icon={<UserPlus size={18} />} label="আমার প্রোফাইল" />
        </>
    );

    // ডোনারের নিজস্ব লিঙ্কসমূহ - ফান্ডিং লিঙ্ক নেই
    const donorLinks = (
        <>
            <SidebarLink to="/dashboard/my-donation-requests" icon={<List size={18} />} label="আমার রক্তদানের অনুরোধ" />
            <SidebarLink to="/dashboard/create-donation-request" icon={<Heart size={18} />} label="নতুন অনুরোধ তৈরি করুন" />
        </>
    );

    // ভলান্টিয়ারের নিজস্ব লিঙ্কসমূহ - 🔥 ফান্ডিং টেবিল যুক্ত করা হয়েছে
    const volunteerLinks = (
        <>
            <SidebarLink to="/dashboard/my-donation-requests" icon={<List size={18} />} label="আমার রক্তদানের অনুরোধ" />
            <SidebarLink to="/dashboard/create-donation-request" icon={<Heart size={18} />} label="নতুন অনুরোধ তৈরি করুন" />
            <SidebarLink to="/dashboard/admin-funding" icon={<DollarSign size={18} />} label="ফান্ডিং টেবিল" />
        </>
    );

    // অ্যাডমিন লিঙ্ক - 🔥 ফান্ডিং টেবিল যুক্ত করা হয়েছে
    const adminLinks = (
        <>
            <SidebarLink to="/dashboard/admin-home" icon={<LayoutDashboard size={18} />} label="অ্যাডমিন হোম" />
            <SidebarLink to="/dashboard/all-users" icon={<Users size={18} />} label="সকল ব্যবহারকারী" />
            <SidebarLink to="/dashboard/all-donation-requests" icon={<List size={18} />} label="সকল অনুরোধ" />
            <SidebarLink to="/dashboard/admin-funding" icon={<DollarSign size={18} />} label="ফান্ডিং টেবিল" />
            <SidebarLink to="/dashboard/create-blog-post" icon={<BookOpen size={18} />} label="নতুন ব্লগ পোস্ট" />
            <SidebarLink to="/dashboard/all-blog-posts" icon={<BookOpen size={18} />} label="সকল ব্লগ পোস্ট" />
        </>
    );

    // রোলের ভিত্তিতে সঠিক লিঙ্ক সেট রেন্ডার করার ফাংশন
    const renderRoleLinks = () => {
        if (userRole === 'admin') {
            return adminLinks;
        } else if (userRole === 'donor') {
            return donorLinks;
        } else if (userRole === 'volunteer') {
            return volunteerLinks;
        }
        return null;
    };
    
    return (
        <>
            {/* মোবাইল টপ বার এবং হেমবার্গার বাটন */}
            <div className="lg:hidden flex items-center justify-between bg-white border-b p-4 sticky top-0 z-[100]">
                <h2 className="text-xl font-bold text-red-600">ড্যাশবোর্ড</h2>
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                    {isOpen ? <X size={28} className="text-red-600" /> : <Menu size={28} className="text-gray-700" />}
                </button>
            </div>

            {/* Sidebar মেইন কন্টেইনার */}
            <div className={`
                fixed inset-y-0 left-0 z-[999] w-64 bg-white p-4 flex flex-col h-full border-r shadow-2xl transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:h-auto lg:shadow-none
            `}>
                
                <h2 className="hidden lg:block text-xl font-bold text-red-600 mb-6">
                    {userRole === 'admin' ? 'অ্যাডমিন প্যানেল' : 'ড্যাশবোর্ড'}
                </h2>
                
                {/* রোল ও স্ট্যাটাস ডিসপ্লে */}
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-4 border-b pb-2">
                    <p>
                        রোল: <span className="text-red-500">{getFormattedRole(userRole)}</span>
                    </p>
                    <span 
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusInfo.className}`}
                    >
                        {statusInfo.label}
                    </span>
                </div>
                
                {/* রোল-ভিত্তিক লিঙ্কসমূহ */}
                <nav className="space-y-1 flex-grow overflow-y-auto" onClick={() => setIsOpen(false)}>
                    {renderRoleLinks()} 
                </nav>

                {/* সাধারণ এবং লগআউট লিঙ্ক */}
                <div className="space-y-1 border-t pt-4 mt-auto">
                    <nav className="space-y-1" onClick={() => setIsOpen(false)}>
                        {commonLinks}
                    </nav>
                    <button
                        onClick={() => { logOut(); setIsOpen(false); }}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition duration-150 ease-in-out"
                    >
                        <LogOut size={18} className="mr-3" />
                        লগআউট
                    </button>
                </div>
            </div>

            {/* মোবাইল ওভারলে (মেনু খোলা থাকলে পিছনের অংশ ঝাপসা করবে) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
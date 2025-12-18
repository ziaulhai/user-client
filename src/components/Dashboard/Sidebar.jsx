import React, { useState } from 'react';
import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { List, LayoutDashboard, Heart, Shield, Users, LogOut, Home as HomeIcon, BookOpen, UserPlus, DollarSign, Menu, X } from 'lucide-react';

// কাস্টম লিঙ্ক কম্পোনেন্ট (অপরিবর্তিত)
const SidebarLink = ({ to, icon, label, className = '', onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
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

const Sidebar = () => { 
    const { userRole, userStatus, logOut } = useAuth(); 
    const [isOpen, setIsOpen] = useState(false); 

    const ROLE_MAP = {
        'admin': 'অ্যাডমিন',
        'donor': 'ডোনার',
        'volunteer': 'ভলান্টিয়ার',
    };
    
    const getFormattedRole = (role) => {
        if (!role) return 'ব্যবহারকারী'; 
        return ROLE_MAP[role.toLowerCase()] || (role.charAt(0).toUpperCase() + role.slice(1));
    }

    // 🔥 আপনার অরিজিনাল স্ট্যাটাস লজিক (এক্টিভ/ব্লকড) - অপরিবর্তিত
    const getStatusInfo = (status) => {
        if (!status) return { label: 'অজানা', className: 'bg-gray-200 text-gray-700' };
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'active') return { label: 'এক্টিভ', className: 'bg-green-100 text-green-700' };
        if (lowerStatus === 'blocked') return { label: 'ব্লকড', className: 'bg-red-100 text-red-700' };
        return { label: status.charAt(0).toUpperCase() + status.slice(1), className: 'bg-gray-200 text-gray-700' };
    };
    
    const statusInfo = getStatusInfo(userStatus);
    const closeMenu = () => setIsOpen(false);

    // লিঙ্কসমূহ (অপরিবর্তিত)
    const commonLinks = (
        <>
            <SidebarLink to="/" icon={<HomeIcon size={18} />} label="হোমপেজ" onClick={closeMenu} />
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="ড্যাশবোর্ড হোম" onClick={closeMenu} />
            <SidebarLink to="/dashboard/profile" icon={<UserPlus size={18} />} label="আমার প্রোফাইল" onClick={closeMenu} />
        </>
    );

    const donorLinks = (
        <>
            <SidebarLink to="/dashboard/my-donation-requests" icon={<List size={18} />} label="আমার রক্তদানের অনুরোধ" onClick={closeMenu} />
            <SidebarLink to="/dashboard/create-donation-request" icon={<Heart size={18} />} label="নতুন অনুরোধ তৈরি করুন" onClick={closeMenu} />
        </>
    );

    const volunteerLinks = (
        <>
            <SidebarLink to="/dashboard/my-donation-requests" icon={<List size={18} />} label="আমার রক্তদানের অনুরোধ" onClick={closeMenu} />
            <SidebarLink to="/dashboard/create-donation-request" icon={<Heart size={18} />} label="নতুন অনুরোধ তৈরি করুন" onClick={closeMenu} />
            <SidebarLink to="/dashboard/admin-funding" icon={<DollarSign size={18} />} label="ফান্ডিং টেবিল" onClick={closeMenu} />
        </>
    );

    const adminLinks = (
        <>
            <SidebarLink to="/dashboard/admin-home" icon={<LayoutDashboard size={18} />} label="অ্যাডমিন হোম" onClick={closeMenu} />
            <SidebarLink to="/dashboard/all-users" icon={<Users size={18} />} label="সকল ব্যবহারকারী" onClick={closeMenu} />
            <SidebarLink to="/dashboard/all-donation-requests" icon={<List size={18} />} label="সকল অনুরোধ" onClick={closeMenu} />
            <SidebarLink to="/dashboard/admin-funding" icon={<DollarSign size={18} />} label="ফান্ডিং টেবিল" onClick={closeMenu} />
            <SidebarLink to="/dashboard/create-blog-post" icon={<BookOpen size={18} />} label="নতুন ব্লগ পোস্ট" onClick={closeMenu} />
            <SidebarLink to="/dashboard/all-blog-posts" icon={<BookOpen size={18} />} label="সকল ব্লগ পোস্ট" onClick={closeMenu} />
        </>
    );

    const renderRoleLinks = () => {
        if (userRole === 'admin') return adminLinks;
        if (userRole === 'donor') return donorLinks;
        if (userRole === 'volunteer') return volunteerLinks;
        return null;
    };
    
    return (
        <>
            {/* ১. মোবাইল টপ বার - এটি 'relative' ডিভ এর বাইরে রাখতে হবে */}
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b px-4 py-3 z-[110] flex items-center justify-between shadow-sm">
                <h2 className="text-xl font-bold text-red-600 uppercase">BloodSync</h2>
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <Menu size={28} className="text-gray-700" />
                </button>
            </div>

            {/* ২. ব্যাকড্রপ ওভারলে */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] lg:hidden"
                    onClick={closeMenu}
                ></div>
            )}

            {/* ৩. সাইডবার ড্রয়ার */}
            <aside className={`
                fixed inset-y-0 left-0 z-[130] w-72 bg-white flex flex-col h-full border-r shadow-2xl transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:w-64
            `}>
                
                {/* সাইডবার হেডার */}
                <div className="p-5 flex items-center justify-between border-b lg:border-none">
                    <h2 className="text-xl font-bold text-red-600">
                        {userRole === 'admin' ? 'অ্যাডমিন প্যানেল' : 'ড্যাশবোর্ড'}
                    </h2>
                    <button onClick={closeMenu} className="lg:hidden p-1 text-red-500">
                        <X size={28} />
                    </button>
                </div>
                
                {/* 🔥 আপনার স্ট্যাটাস কার্ড (এক্টিভ/ব্লকসহ) */}
                <div className="px-5 py-3 mx-4 my-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">রোল</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.className}`}>
                            {statusInfo.label}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-red-600">{getFormattedRole(userRole)}</p>
                </div>
                
                {/* লিঙ্কসমূহ */}
                <div className="flex-grow overflow-y-auto px-4 py-2 space-y-1">
                    <nav className="space-y-1">
                        {renderRoleLinks()} 
                    </nav>
                    <div className="my-4 border-t pt-4">
                        <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">সাধারণ</span>
                        <nav className="mt-2 space-y-1">
                            {commonLinks}
                        </nav>
                    </div>
                </div>

                {/* লগআউট */}
                <div className="p-4 border-t">
                    <button
                        onClick={() => { logOut(); closeMenu(); }}
                        className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    >
                        <LogOut size={20} className="mr-3" />
                        লগআউট
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
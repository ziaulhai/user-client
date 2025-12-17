import React from 'react';
import useAuth from '../../hooks/useAuth';
import { Menu, LogOut, User, Home as HomeIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const DashboardNavbar = () => {
    const { user, logOut } = useAuth();
    
    // ইউজারের নাম (যদি থাকে)
    const displayName = user?.displayName?.split(' ')[0] || 'ইউজার';
    const profilePic = user?.photoURL;
    
    return (
        <div className="navbar bg-white shadow-md sticky top-0 z-10 p-4">
            <div className="flex-1">
                {/* মোবাইল মেনু টগল (যদি DaisyUI Drawer ব্যবহার করেন) */}
                <label 
                    htmlFor="my-drawer-2" // DashboardLayout এ যদি Drawer ব্যবহার করা হয়
                    className="btn btn-ghost lg:hidden text-gray-700"
                >
                    <Menu size={24} />
                </label>
                
                {/* ড্যাশবোর্ড টাইটেল / স্বাগতম বার্তা */}
                <h1 className="text-xl font-bold text-gray-800 ml-2 hidden md:block">
                    স্বাগতম, <span className="text-red-600">{displayName}</span>!
                </h1>
            </div>

            <div className="flex-none">
                {/* পাবলিক হোমে ফিরে যাওয়ার বাটন (ঐচ্ছিক) */}
                <NavLink to="/" className="btn btn-ghost btn-circle hidden sm:flex">
                    <HomeIcon size={20} />
                </NavLink>

                {/* প্রোফাইল ড্রপডাউন মেনু */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            {/* প্রোফাইল ছবি */}
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt="User Avatar"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://i.ibb.co/6P2L1J5/default-avatar.png"; }} // ছবি লোড না হলে ডিফল্ট
                                />
                            ) : (
                                <div className="bg-red-200 flex items-center justify-center h-full text-red-600">
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* ড্রপডাউন মেনু */}
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border">
                        <li className='menu-title text-gray-700 font-semibold'>
                            {user?.displayName}
                            <span className='text-xs text-gray-500 font-normal block'>{user?.email}</span>
                        </li>
                        <div className="divider my-0"></div>
                        
                        <li>
                            <NavLink to="/dashboard/profile" className="justify-between">
                                <User size={18} className='mr-2' /> প্রোফাইল দেখুন
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/" className="justify-between">
                                <HomeIcon size={18} className='mr-2' /> হোমপেজ
                            </NavLink>
                        </li>
                        
                        <div className="divider my-0"></div>

                        <li>
                            <a onClick={logOut} className='text-red-600 hover:bg-red-50'>
                                <LogOut size={18} className='mr-2' /> লগ আউট
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardNavbar;
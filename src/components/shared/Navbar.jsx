import React, { useEffect, useState } from 'react'; 
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; 
import { LogOut, LayoutDashboard, User, Droplet, Search, Menu, ChevronDown, Phone, Globe, Shield } from 'lucide-react';

const Navbar = () => {
    // Auth Hook ব্যবহার করা হয়েছে
    const { user, logOut } = useAuth();
    
    // 🔥 ভাষা পরিবর্তনের স্টেট যুক্ত করা হয়েছে (Default: বাংলা)
    const [currentLang, setCurrentLang] = useState('বাংলা'); 
    
    const [renderKey, setRenderKey] = useState(Date.now());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user && user.photoURL) {
            setRenderKey(Date.now());
        }
    }, [user?.photoURL]);


    const getAvatarSrc = () => {
        if (user?.photoURL) {
            // ক্যাশ সমস্যা এড়াতে টাইমস্ট্যাম্প ব্যবহার
            return `${user.photoURL}?t=${renderKey}`; 
        }
        return 'https://i.ibb.co/6P2L1J5/default-avatar.png';
    };

    // 🔥 ভাষা পরিবর্তন হ্যান্ডলার ফাংশন
    const handleLanguageChange = (language) => {
        setCurrentLang(language);
        console.log(`ভাষা পরিবর্তন করা হয়েছে: ${language}`);
        // 🚨 ভবিষ্যতে: পুরো অ্যাপ্লিকেশনের কনটেন্ট পরিবর্তন করতে এখানে i18n লজিক যুক্ত করতে হবে।
    };


    // **********************************************
    // ১. টপ হেডার বার কম্পোনেন্ট (Header Top Bar)
    // 🔥 এই অংশটি এখন Navbar ফাংশনের ভেতরে ডিফাইন করা হয়েছে 🔥
    // **********************************************
    const TopHeaderBar = (
        <div className="bg-gray-100 border-b border-gray-200"> 
            <div className="container mx-auto px-4 py-1 flex justify-between items-center text-sm text-gray-600"> 
                
                {/* বাম দিক */}
                <div className="flex items-center space-x-4">
                    <p className="hidden sm:block">আপনার রক্তদান আমাদের শক্তি।</p>
                </div>

                {/* ডান দিক */}
                <div className="flex items-center space-x-4">
                    <a href="tel:+(880)123456789" className="flex items-center hover:text-red-600">
                        <Phone size={14} className="mr-1" /> +৮৮০ ১২৩৪ ৫৬৭ ৮৯
                    </a>
                    <NavLink to="/contact-us" className="hover:text-red-600 hidden sm:block">যোগাযোগ</NavLink>
                    
                    {/* ভাষা ড্রপডাউন (হোভার-ভিত্তিক) */}
                    <div className="relative group">
                        {/* 🔥 বর্তমান ভাষা প্রদর্শন */}
                        <div className="flex items-center cursor-pointer hover:text-red-600 px-1 py-0.5">
                            <Globe size={14} className="mr-1" /> {currentLang} <ChevronDown size={14} className="ml-1" />
                        </div>
                        
                        {/* হোভার স্টেবিলিটির জন্য mt-0 ব্যবহার করা হয়েছে */}
                        <ul className="absolute right-0 top-full hidden group-hover:block 
                                menu menu-sm bg-base-100 rounded-box z-[1] mt-0 w-32 p-2 shadow-lg border border-gray-200"> 
                            
                            {/* 🔥 ক্লিক হ্যান্ডলার এবং সক্রিয় ক্লাস যুক্ত করা হয়েছে */}
                            <li>
                                <a 
                                    onClick={() => handleLanguageChange('English')}
                                    className={currentLang === 'English' ? 'font-bold bg-red-50 text-red-600' : ''}
                                >
                                    English
                                </a>
                            </li>
                            <li>
                                <a 
                                    onClick={() => handleLanguageChange('বাংলা')}
                                    className={currentLang === 'বাংলা' ? 'font-bold bg-red-50 text-red-600' : ''}
                                >
                                    বাংলা
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    // **********************************************
    // ২. প্রধান ন্যাভিগেশন মেনু (Main Navbar)
    // **********************************************

    // লোগো এরিয়া
    const LogoArea = (
        <NavLink to="/" className="flex items-center space-x-2">
            <div className="text-red-600">
                <Droplet size={36} />
            </div>
            <span className='text-2xl font-extrabold text-red-600 hidden sm:block whitespace-nowrap'>
                রক্তদান অ্যাপ
            </span>
        </NavLink>
    );

    // সকল ন্যাভিগেশন লিংক
    const navLinks = (
        <>
            <li className='font-semibold text-gray-700'>
                <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                        `hover:text-red-600 border-b-2 pb-1.5 whitespace-nowrap ${isActive ? 'text-red-600 border-red-600' : 'border-transparent'}`
                    }
                >
                    হোম
                </NavLink>
            </li>
            
            {/* হোভার ড্রপডাউন: আমাদের সম্পর্কে */}
            <li className='font-semibold text-gray-700 relative group'>
                <div className="flex items-center cursor-pointer hover:text-red-600 border-b-2 border-transparent hover:border-red-600 pb-1.5 whitespace-nowrap">
                    আমাদের সম্পর্কে <ChevronDown size={14} className="ml-1" />
                </div>
                {/* হোভারে শো করবে */}
                <ul className="absolute left-0 top-full hidden group-hover:block 
                        p-2 bg-base-100 shadow-xl rounded-box z-[1] mt-0.5 w-52 border-t-2 border-red-600">
                    <li><NavLink to="/who-we-are">আমরা কারা</NavLink></li>
                    <li><NavLink to="/mission">আমাদের লক্ষ্য</NavLink></li>
                </ul>
            </li>

            {/* হোভার ড্রপডাউন: যা করি */}
            <li className='font-semibold text-gray-700 relative group'>
                <div className="flex items-center cursor-pointer hover:text-red-600 border-b-2 border-transparent hover:border-red-600 pb-1.5 whitespace-nowrap">
                    যা করি <ChevronDown size={14} className="ml-1" />
                </div>
                {/* হোভারে শো করবে */}
                <ul className="absolute left-0 top-full hidden group-hover:block 
                        p-2 bg-base-100 shadow-xl rounded-box z-[1] mt-0.5 w-52 border-t-2 border-red-600">
                    <li><NavLink to="/donation-requests">অনুরোধ সমূহ</NavLink></li>
                    <li><NavLink to="/search">ডোনার খুঁজুন</NavLink></li>
                </ul>
            </li>

            {/* ফান্ডিং পেজ লিঙ্ক: ক্যোয়ারী প্যারামিটার যুক্ত করা হয়েছে */}
            <li className='font-semibold text-gray-700'>
                <NavLink 
                    to="/funding?donate=true"
                    className={({ isActive }) => 
                        `hover:text-red-600 border-b-2 pb-1.5 whitespace-nowrap flex items-center ${isActive ? 'text-red-600 border-red-600' : 'border-transparent'}`
                    }
                >
                    <Shield size={16} className='inline mr-1' /> ফান্ডিং
                </NavLink>
            </li>

            <li className='font-semibold text-gray-700'>
                <NavLink 
                    to="/blogs" 
                    className={({ isActive }) => 
                        `hover:text-red-600 border-b-2 pb-1.5 whitespace-nowrap ${isActive ? 'text-red-600 border-red-600' : 'border-transparent'}`
                    }
                >
                    ব্লগ
                </NavLink>
            </li>
            <li className='font-semibold text-gray-700'>
                <NavLink 
                    to="/contact-us" 
                    className={({ isActive }) => 
                        `hover:text-red-600 border-b-2 pb-1.5 whitespace-nowrap ${isActive ? 'text-red-600 border-red-600' : 'border-transparent'}`
                    }
                >
                    যোগাযোগ
                </NavLink>
            </li>
        </>
    );

    // ডান দিকের বাটন ও প্রোফাইল (ছোট ও বড় স্ক্রিনের জন্য রেসপন্সিভ)
    const RightActions = (
        <div className="flex items-center space-x-3"> 
            
            {/* ডোনেট বাটন: /donate রুটে যাচ্ছে */}
            <NavLink to="/donate" className="btn bg-red-700 text-white hover:bg-red-800 whitespace-nowrap hidden lg:inline-flex">
                ডোনেট করুন
            </NavLink>
            {/* ছোট স্ক্রিনের জন্য আইকন বাটন */}
            <NavLink to="/donate" className="btn btn-square bg-red-700 hover:bg-red-800 text-white lg:hidden">
                <Droplet size={20} />
            </NavLink>
            
            {/* ইউজার প্রোফাইল মেনু / অথেন্টিকেশন বাটন */}
            {user ? (
                // হোভার-ভিত্তিক প্রোফাইল ড্রপডাউন
                <div className="relative group"> 
                    <div className="btn btn-ghost btn-circle avatar border-2 border-red-600 cursor-pointer" role="button">
                        <div 
                            className="w-10 rounded-full overflow-hidden" 
                            key={renderKey} // <<<<<<<<<<<<< ফোর্সিং
                        >
                            {user?.photoURL ? (
                                <img 
                                    src={getAvatarSrc()} // ক্যাশ বাস্টার URL ব্যবহার
                                    alt="User Avatar" 
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = "https://i.ibb.co/6P2L1J5/default-avatar.png"; 
                                    }} 
                                />
                            ) : (
                                <div className="bg-red-200 flex items-center justify-center h-full text-red-600"><User size={20} /></div>
                            )}
                        </div>
                    </div>
                    {/* হোভারে শো করবে */}
                    <ul className="absolute right-0 top-full hidden group-hover:block 
                            menu menu-sm bg-base-100 rounded-box z-[1] mt-0.5 w-52 p-2 shadow-lg border border-gray-200">
                        <li className='menu-title text-gray-700 font-semibold'>{user?.displayName || 'ব্যবহারকারী'}</li>
                        <div className="divider my-0"></div>
                        <li><NavLink to="/dashboard"><LayoutDashboard size={18} className='mr-2' /> ড্যাশবোর্ড</NavLink></li>
                        <li><a onClick={logOut} className='text-red-600 hover:bg-red-50'><LogOut size={18} className='mr-2' /> লগ আউট</a></li>
                    </ul>
                </div>
            ) : (
                // লগইন বাটন
                <NavLink to="/login" className="btn bg-red-600 text-white hover:bg-red-700 whitespace-nowrap">
                    <span className='hidden lg:inline'>লগইন</span>
                    <span className='lg:hidden'><User size={20} /></span>
                </NavLink>
            )}
        </div>
    );

    return (
        <header className="bg-white sticky top-0 z-20 shadow-sm border-b">
            
            {/* টপ হেডার বার (এখন স্টেট আপডেটে রি-রেন্ডার হবে) */}
            {TopHeaderBar}

            {/* প্রধান ন্যাভিগেশন বার */}
            <div className="navbar container mx-auto px-4 py-2"> 
                
                {/* ১. বাম অংশ: লোগো (navbar-start) */}
                <div className="navbar-start"> 
                    {LogoArea}
                </div>

                {/* ২. মাঝের অংশ: ডেস্কটপ ন্যাভিগেশন (navbar-center) */}
                <div className="navbar-center hidden lg:flex flex-grow justify-center"> 
                    <ul className="menu menu-horizontal px-1 space-x-4"> 
                        {navLinks}
                    </ul>
                </div>
                
                {/* ৩. ডান দিক: অ্যাকশন এবং হ্যামবার্গার (navbar-end) */}
                <div className="navbar-end w-fit"> 
                    
                    {/* বাটন/প্রোফাইল (সব স্ক্রিনে দৃশ্যমান) */}
                    {RightActions}

                    {/* হ্যামবার্গার মেনু (শুধু ছোট স্ক্রিনে) */}
                    <div className="dropdown dropdown-end ml-2" onBlur={() => setIsMobileMenuOpen(false)}>
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu size={24} />
                        </div>
                        {/* মোবাইল মেনু কন্টেন্ট */}
                        {isMobileMenuOpen && (
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border">
                                
                                {/* নেভিগেশন লিংক */}
                                {navLinks} 
                                <div className="divider my-1"></div>

                                {/* রেজিস্টার বাটন (মোবাইল) */}
                                {!user && (
                                    <li>
                                        <NavLink to="/register" className="btn bg-red-600 text-white hover:bg-red-700 w-full justify-start">রেজিস্টার</NavLink>
                                    </li>
                                )}
                                
                                {/* লগইনড থাকলে ড্যাশবোর্ড/লগআউট বাটন (মোবাইল) */}
                                {user && (
                                    <>
                                        <li><NavLink to="/dashboard"><LayoutDashboard size={18} className='mr-2' /> ড্যাশবোর্ড</NavLink></li>
                                        <li><a onClick={logOut} className='text-red-600 hover:bg-red-50 w-full justify-start'><LogOut size={18} className='mr-2' /> লগ আউট</a></li>
                                    </>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
import React, { useEffect, useState } from 'react'; 
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; 
import { LogOut, LayoutDashboard, User, Droplet, Menu, ChevronDown, Phone, Globe, Shield, X, HelpCircle, Mail, MapPin } from 'lucide-react';

const Navbar = () => {
    // Auth Hook
    const { user, logOut } = useAuth();
    
    // States
    const [currentLang, setCurrentLang] = useState('বাংলা'); 
    const [renderKey, setRenderKey] = useState(Date.now());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Profile Photo Cache Breaker
    useEffect(() => {
        if (user && user.photoURL) {
            setRenderKey(Date.now());
        }
    }, [user?.photoURL]);

    const getAvatarSrc = () => {
        if (user?.photoURL) {
            return `${user.photoURL}?t=${renderKey}`; 
        }
        return 'https://i.ibb.co.com/WNyfY5cS/profile-1.png';
    };

    // Language Handler
    const handleLanguageChange = (language) => {
        setCurrentLang(language);
        setIsMobileMenuOpen(false);
    };

    // Close Mobile Menu
    const closeMenu = () => setIsMobileMenuOpen(false);

    // **********************************************
    // ১. টপ হেডার বার
    // **********************************************
    const TopHeaderBar = (
        <div className="bg-gray-100 border-b border-gray-200"> 
            <div className="container mx-auto px-4 py-1.5 flex justify-between items-center text-sm text-gray-600 font-medium"> 
                <div className="flex items-center space-x-6">
                    <p className="hidden md:flex items-center"><MapPin size={14} className="mr-1 text-red-500"/> বাংলাদেশ</p>
                    <p className="hidden sm:block">আপনার রক্তদান আমাদের শক্তি।</p>
                </div>

                <div className="flex items-center space-x-5">
                    <a href="tel:+(880)123456789" className="flex items-center hover:text-red-600 transition-colors">
                        <Phone size={14} className="mr-1" /> +৮৮০ ১২৩৪ ৫৬৭ ৮৯
                    </a>
                    
                    {/* Language Dropdown */}
                    <div className="relative group">
                        <div className="flex items-center cursor-pointer hover:text-red-600 px-1 py-0.5">
                            <Globe size={14} className="mr-1" /> {currentLang} <ChevronDown size={14} className="ml-0.5" />
                        </div>
                        <ul className="absolute right-0 top-full hidden group-hover:block 
                            menu menu-sm bg-base-100 rounded-box z-[50] mt-0 w-32 p-2 shadow-2xl border border-gray-200"> 
                            <li>
                                <button onClick={() => handleLanguageChange('English')} className={`w-full text-left px-3 py-2 rounded-md ${currentLang === 'English' ? 'font-bold bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}>
                                    English
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleLanguageChange('বাংলা')} className={`w-full text-left px-3 py-2 rounded-md ${currentLang === 'বাংলা' ? 'font-bold bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}>
                                    বাংলা
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    // **********************************************
    // ২. নেভিগেশন লিংকস (Shared)
    // **********************************************
    const navItems = [
        { name: 'হোম', path: '/' },
        { 
            name: 'আমাদের সম্পর্কে', 
            submenu: [
                { name: 'আমরা কারা', path: '/who-we-are' },
                { name: 'আমাদের লক্ষ্য', path: '/mission' }
            ] 
        },
        { 
            name: 'যা করি', 
            submenu: [
                { name: 'অনুরোধ সমূহ', path: '/donation-requests' },
                { name: 'ডোনার খুঁজুন', path: '/search' }
            ] 
        },
        { name: 'ফান্ডিং', path: '/funding?donate=true', icon: <Shield size={16} /> },
        { name: 'ব্লগ', path: '/blogs' },
        { name: 'যোগাযোগ', path: '/contact-us' }
    ];

    return (
        <header className="bg-white sticky top-0 z-[100] shadow-md border-b">
            {TopHeaderBar}

            <nav className="navbar container mx-auto px-4 py-2"> 
                {/* Navbar Start: Logo */}
                <div className="navbar-start"> 
                    <NavLink to="/" className="flex items-center space-x-2 group">
                        <div className="text-red-600 transition-transform group-hover:scale-110 duration-300">
                            <Droplet size={40} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className='text-2xl font-black text-red-600 leading-none'>রক্তদান</span>
                            <span className='text-[10px] tracking-[0.2em] font-bold text-gray-500 uppercase'>সেবাই আমাদের ধর্ম</span>
                        </div>
                    </NavLink>
                </div>

                {/* Navbar Center: Desktop Menu */}
                <div className="navbar-center hidden lg:flex"> 
                    <ul className="menu menu-horizontal p-0 space-x-2"> 
                        {navItems.map((item, idx) => (
                            <li key={idx} className={item.submenu ? 'relative group' : ''}>
                                {item.submenu ? (
                                    <>
                                        <div className="flex items-center font-bold text-gray-700 hover:text-red-600 py-2 px-4 cursor-pointer">
                                            {item.name} <ChevronDown size={14} className="ml-1" />
                                        </div>
                                        <ul className="absolute left-0 top-full hidden group-hover:block w-52 p-2 bg-white shadow-2xl rounded-xl border-t-4 border-red-600 z-[110]">
                                            {item.submenu.map((sub, sIdx) => (
                                                <li key={sIdx}>
                                                    <NavLink to={sub.path} className="py-2 hover:bg-red-50 hover:text-red-600 rounded-lg">{sub.name}</NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <NavLink 
                                        to={item.path} 
                                        className={({ isActive }) => 
                                            `font-bold py-2 px-4 transition-all ${isActive ? 'text-red-600 bg-red-50 rounded-lg' : 'text-gray-700 hover:text-red-600'}`
                                        }
                                    >
                                        {item.icon && <span className="mr-1">{item.icon}</span>}
                                        {item.name}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Navbar End: User Actions */}
                <div className="navbar-end space-x-3"> 
                    <NavLink to="/donate" className="btn bg-red-600 border-none text-white hover:bg-red-700 hidden md:flex shadow-lg shadow-red-200">
                        ডোনেট করুন
                    </NavLink>

                    {user ? (
                        <div className="dropdown dropdown-end"> 
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar border-2 border-red-600 p-0.5">
                                <div className="w-full rounded-full overflow-hidden">
                                    <img src={getAvatarSrc()} alt="Profile" />
                                </div>
                            </label>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[120] p-2 shadow-2xl bg-base-100 rounded-box w-56 border border-gray-100">
                                <div className="px-4 py-3 bg-gray-50 rounded-t-lg mb-2">
                                    <p className="text-xs text-gray-500">লগইন করা আছে</p>
                                    <p className="font-bold text-gray-800 truncate">{user?.displayName || 'ইউজার'}</p>
                                </div>
                                <li><NavLink to="/dashboard" className="py-2"><LayoutDashboard size={18} /> ড্যাশবোর্ড</NavLink></li>
                                <li><NavLink to="/profile" className="py-2"><User size={18} /> প্রোফাইল</NavLink></li>
                                <div className="divider my-1"></div>
                                <li><button onClick={logOut} className="py-2 text-red-600 hover:bg-red-50 font-bold"><LogOut size={18} /> লগ আউট</button></li>
                            </ul>
                        </div>
                    ) : (
                        <NavLink to="/login" className="btn btn-outline border-red-600 text-red-600 hover:bg-red-600 hover:border-red-600 px-6">
                            লগইন
                        </NavLink>
                    )}

                    {/* Hamburger Button */}
                    <button 
                        className="btn btn-ghost lg:hidden p-1 text-gray-700" 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={30} className="text-red-600" /> : <Menu size={30} />}
                    </button>
                </div>
            </nav>

            {/* --- Mobile Sidebar / Overlay Menu --- */}
            <div className={`fixed inset-0 z-[150] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Background Overlay */}
                <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeMenu}></div>
                
                {/* Menu Drawer */}
                <div className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-5 border-b flex justify-between items-center bg-red-600 text-white">
                            <span className="font-bold text-xl flex items-center"><Droplet size={24} className="mr-1"/> মেনু</span>
                            <button onClick={closeMenu} className="p-1 hover:bg-white/20 rounded-full"><X size={24}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto py-4">
                            <ul className="menu menu-vertical px-2 space-y-1">
                                {navItems.map((item, idx) => (
                                    <li key={idx}>
                                        {item.submenu ? (
                                            <details>
                                                <summary className="font-bold text-gray-700 py-3">{item.name}</summary>
                                                <ul className="pl-4 mt-1 border-l-2 border-red-100 ml-2">
                                                    {item.submenu.map((sub, sIdx) => (
                                                        <li key={sIdx}><NavLink onClick={closeMenu} to={sub.path} className="py-3">{sub.name}</NavLink></li>
                                                    ))}
                                                </ul>
                                            </details>
                                        ) : (
                                            <NavLink onClick={closeMenu} to={item.path} className="font-bold text-gray-700 py-3">{item.name}</NavLink>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-4 border-t space-y-3">
                            {!user ? (
                                <>
                                    <NavLink onClick={closeMenu} to="/register" className="btn btn-block bg-red-600 text-white border-none">রেজিস্ট্রেশন</NavLink>
                                    <NavLink onClick={closeMenu} to="/login" className="btn btn-block btn-outline border-red-600 text-red-600">লগইন</NavLink>
                                </>
                            ) : (
                                <button onClick={() => {logOut(); closeMenu();}} className="btn btn-block btn-outline btn-error font-bold"><LogOut size={18}/> লগ আউট</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
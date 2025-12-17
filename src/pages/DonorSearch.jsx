// src/pages/DonorSearch.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Droplet, User, Phone, Mail } from 'lucide-react';
import useDistrictsAndUpazilas from '../hooks/useDistrictsAndUpazilas'; 

// ব্লাড গ্রুপ অ্যারে
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ডিফল্ট অ্যাভাটারের জন্য URL ব্যবহার করা হলো
const DEFAULT_AVATAR = "https://i.ibb.co.com/WNyfY5cS/profile-1.png";

const DonorSearch = () => {
    const [searchParams, setSearchParams] = useState({
        bloodGroup: '',
        district: '',
        upazila: ''
    });
    // setSearchResults এ শুধু অ্যারে থাকবে
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // 🔥 পরিবর্তন ৪: নতুন মেসেজ স্টেট যোগ করা হলো
    const [noResultsMessage, setNoResultsMessage] = useState('');


    const { 
        districts, 
        upazilas, 
        setSelectedDistrict, 
        loading: geoDataLoading 
    } = useDistrictsAndUpazilas();
    
    // যখন সার্চ প্যারামিটারে জেলা পরিবর্তন হবে, তখন হুককে জানিয়ে দেওয়া
    useEffect(() => {
        if (searchParams.district) {
            setSelectedDistrict(searchParams.district);
        } else {
            setSelectedDistrict('');
        }
    }, [searchParams.district, setSelectedDistrict]);


    // --- ইনপুট হ্যান্ডেলার ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value,
            // জেলা পরিবর্তন হলে উপ-জেলা রিসেট করা
            ...(name === 'district' && { upazila: '' })
        }));
    };

    // --- সার্চ হ্যান্ডেলার ---
    const handleSearch = async (e) => {
        e.preventDefault();
        
        // অন্তত একটি ফিল্ড পূরণ করতে হবে
        if (!searchParams.bloodGroup && !searchParams.district && !searchParams.upazila) {
            setError('অনুগ্রহ করে কমপক্ষে একটি সার্চ ফিল্ড পূরণ করুন।');
            setSearchResults([]);
            // 🔥 মেসেজ রিসেট
            setNoResultsMessage(''); 
            return;
        }

        setError('');
        setIsLoading(true);
        setSearchResults([]);
        setNoResultsMessage(''); // প্রতি সার্চের আগে মেসেজ রিসেট
        
        // কোয়েরি স্ট্রিং তৈরি
        const params = new URLSearchParams(searchParams);
        
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users/donors-search?${params.toString()}`);
            
            // 🔥🔥🔥 ফিক্স: সার্ভার থেকে প্রাপ্ত `donors` অ্যারেটি ব্যবহার করা 🔥🔥🔥
            const { donors, message } = res.data; 
            
            setSearchResults(donors || []); // ensure it's an array
            
            // 🔥 মেসেজ সেট করা
            if (donors && donors.length === 0 && message) {
                setNoResultsMessage(message);
            }

        } catch (err) {
            console.error("Donor search failed:", err);
            // 🔥 যদি সার্ভার থেকে 404/500 এরর আসে, তবে এরর মেসেজ দেখাবে
            setError(err.response?.data?.message || 'ডোনার অনুসন্ধানে ব্যর্থ হয়েছে।');
        } finally {
            setIsLoading(false);
        }
    };

    if (geoDataLoading) {
        return <div className="text-center p-10 min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span><p className='text-red-600 ml-2'>ভূগোল ডেটা লোড হচ্ছে...</p></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-[80vh]">
            <h1 className="text-4xl font-bold text-center text-red-600 mb-4">ডোনার অনুসন্ধান</h1>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">প্রয়োজনীয় ব্লাড গ্রুপ, জেলা ও উপ-জেলা নির্বাচন করে আপনার এলাকার সক্রিয় রক্তদাতাদের খুঁজে বের করুন।</p>

            {/* --- সার্চ ফর্ম --- */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600 max-w-3xl mx-auto mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ব্লাড গ্রুপ */}
                    <div>
                        <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Droplet size={16} className="mr-1"/> ব্লাড গ্রুপ</label>
                        <select
                            id="bloodGroup"
                            name="bloodGroup"
                            value={searchParams.bloodGroup}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">সকল গ্রুপ</option>
                            {bloodGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>

                    {/* জেলা */}
                    <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><MapPin size={16} className="mr-1"/> জেলা</label>
                        <select
                            id="district"
                            name="district"
                            value={searchParams.district}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">সকল জেলা</option>
                            {/* 🔥 হুক থেকে ডেটা ব্যবহার */}
                            {districts.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* উপ-জেলা */}
                    <div>
                        <label htmlFor="upazila" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><MapPin size={16} className="mr-1"/> উপ-জেলা</label>
                        <select
                            id="upazila"
                            name="upazila"
                            value={searchParams.upazila}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                            // 🔥 upazilas ডেটার উপর ভিত্তি করে disabled নিয়ন্ত্রণ
                            disabled={!searchParams.district || upazilas.length === 0}
                        >
                            <option value="">সকল উপ-জেলা</option>
                            {/* 🔥 হুক থেকে ডেটা ব্যবহার */}
                            {upazilas.map(u => (
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                <div className="mt-6 text-center">
                    <button type="submit" className="btn bg-red-600 text-white hover:bg-red-700 w-full md:w-auto" disabled={isLoading}>
                        {isLoading ? <span className="loading loading-spinner"></span> : <Search size={20} className="mr-2"/>}
                        অনুসন্ধান করুন
                    </button>
                </div>
            </form>
            
            {/* --- সার্চ রেজাল্ট --- */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-700 mb-5 border-b pb-2">অনুসন্ধান ফলাফল ({searchResults.length} জন)</h2>
                
                {isLoading && <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>}
                
                {/* 🔥 ফিক্স: noResultsMessage স্টেট ব্যবহার করা হলো */}
                {!isLoading && searchResults.length === 0 && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500">
                            {noResultsMessage || "আপনার সার্চ ক্রাইটেরিয়ায় কোনো সক্রিয় ডোনার খুঁজে পাওয়া যায়নি।"}
                        </p>
                    </div>
                )}
                
                {!isLoading && searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((donor) => (
                            <div key={donor._id} className="card bg-white shadow-xl hover:shadow-2xl transition duration-300 border-t-4 border-red-500">
                                <div className="card-body p-6">
                                    <div className="flex items-start gap-4">
                                        
                                        {/* 🔥🔥🔥 নতুন ফিক্স: ডোনারের ছবি এবং ডিফল্ট অ্যাভাটার যুক্ত করা হলো 🔥🔥🔥 */}
                                        <div className="avatar flex-shrink-0">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500">
                                                <img 
                                                    src={donor.photoURL || DEFAULT_AVATAR} 
                                                    alt={`${donor.name} এর প্রোফাইল ছবি`} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h3 className="card-title text-xl font-extrabold text-gray-800 flex items-center">
                                                    <User size={20} className="mr-1 text-red-600"/>{donor.name || 'নামহীন'}
                                                </h3>
                                                <span className="badge badge-lg bg-red-600 text-white font-bold p-3">
                                                    {donor.bloodGroup}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-1 mt-2 text-gray-600 text-sm">
                                                <p className='flex items-center'><MapPin size={16} className="mr-2 text-red-500"/>
                                                    {donor.upazila || 'উপজেলা অজানা'}, {donor.district || 'জেলা অজানা'}
                                                </p>
                                                <p className='flex items-center'><Phone size={16} className="mr-2 text-red-500"/>
                                                    <a href={`tel:${donor.phoneNumber}`} className="hover:underline">{donor.phoneNumber || 'ফোন নম্বর নেই'}</a>
                                                </p>
                                                <p className='flex items-center text-xs'><Mail size={16} className="mr-2 text-red-500"/>
                                                    {donor.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorSearch;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, MapPin, Droplet, User, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import useDistrictsAndUpazilas from '../hooks/useDistrictsAndUpazilas'; 

// ব্লাড গ্রুপ অ্যারে
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ডিফল্ট অ্যাভাটারের জন্য URL
const DEFAULT_AVATAR = "https://i.ibb.co.com/WNyfY5cS/profile-1.png";

const DonorSearch = () => {
    const [searchParams, setSearchParams] = useState({
        bloodGroup: '',
        district: '',
        upazila: ''
    });

    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noResultsMessage, setNoResultsMessage] = useState('');
    
    // 🔥 নতুন স্টেট: টাইটেল পরিবর্তন করার জন্য
    const [isSearched, setIsSearched] = useState(false);

    // --- পেজিনেশন স্টেট ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // একবারে ১২ জন ডোনার দেখাবে

    const { 
        districts, 
        upazilas, 
        setSelectedDistrict, 
        loading: geoDataLoading 
    } = useDistrictsAndUpazilas();
    
    // জেলা পরিবর্তন হলে উপজেলা রিসেট
    useEffect(() => {
        if (searchParams.district) {
            setSelectedDistrict(searchParams.district);
        } else {
            setSelectedDistrict('');
        }
    }, [searchParams.district, setSelectedDistrict]);

    // --- মেইন ডেটা ফেচিং ফাংশন ---
    const fetchDonors = useCallback(async (isFormSubmit = false) => {
        setIsLoading(true);
        setError('');
        setNoResultsMessage('');
        
        // যদি ইউজার সার্চ বাটনে ক্লিক করে, তবে টাইটেল পরিবর্তন হবে
        if (isFormSubmit) {
            setIsSearched(true);
        }

        const params = new URLSearchParams();
        if (searchParams.bloodGroup) params.append('bloodGroup', searchParams.bloodGroup);
        if (searchParams.district) params.append('district', searchParams.district);
        if (searchParams.upazila) params.append('upazila', searchParams.upazila);
        
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users/donors-search?${params.toString()}`);
            const { donors, message } = res.data; 
            
            setSearchResults(donors || []);
            setCurrentPage(1); 

            if (donors && donors.length === 0 && message) {
                setNoResultsMessage(message);
            }
        } catch (err) {
            console.error("Donor search failed:", err);
            setError(err.response?.data?.message || 'ডোনার অনুসন্ধানে ব্যর্থ হয়েছে।');
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    // পেজ লোড হওয়ার সাথে সাথে সব ডোনার নিয়ে আসা
    useEffect(() => {
        fetchDonors(false);
    }, []);

    // --- ইনপুট হ্যান্ডেলার ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'district' && { upazila: '' })
        }));
    };

    // --- সার্চ সাবমিট হ্যান্ডেলার ---
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchDonors(true); // এখানে true পাস করা হয়েছে টাইটেল পরিবর্তনের জন্য
    };

    // --- পেজিনেশন লজিক ---
    const totalPages = Math.ceil(searchResults.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDonors = searchResults.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 450, behavior: 'smooth' });
    };

    if (geoDataLoading) {
        return (
            <div className="text-center p-10 min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
                <p className='text-red-600 ml-2'>ভূগোল ডেটা লোড হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-[80vh]">
            <h1 className="text-4xl font-bold text-center text-red-600 mb-4">ডোনার অনুসন্ধান</h1>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">প্রয়োজনীয় ব্লাড গ্রুপ, জেলা ও উপ-জেলা নির্বাচন করে আপনার এলাকার সক্রিয় রক্তদাতাদের খুঁজে বের করুন।</p>

            {/* --- সার্চ ফর্ম --- */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600 max-w-3xl mx-auto mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Droplet size={16} className="mr-1"/> ব্লাড গ্রুপ</label>
                        <select name="bloodGroup" value={searchParams.bloodGroup} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">সকল গ্রুপ</option>
                            {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><MapPin size={16} className="mr-1"/> জেলা</label>
                        <select name="district" value={searchParams.district} onChange={handleChange} className="select select-bordered w-full">
                            <option value="">সকল জেলা</option>
                            {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><MapPin size={16} className="mr-1"/> উপ-জেলা</label>
                        <select name="upazila" value={searchParams.upazila} onChange={handleChange} className="select select-bordered w-full" disabled={!searchParams.district || upazilas.length === 0}>
                            <option value="">সকল উপ-জেলা</option>
                            {upazilas.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
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
            
            {/* --- সার্চ রেজাল্ট সেকশন --- */}
            <div className="mt-10" id="results">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
                    {/* 🔥 ডাইনামিক টাইটেল: ইজ সার্চড ট্রু হলে 'অনুসন্ধান ফলাফল' নয়তো 'সকল রক্তদাতা' */}
                    <h2 className="text-2xl font-bold text-gray-700">
                        {isSearched ? "অনুসন্ধান ফলাফল" : "সকল রক্তদাতা"} ({searchResults.length} জন)
                    </h2>
                    {totalPages > 1 && <span className="text-sm text-gray-500 font-medium">পেজ {currentPage} / {totalPages}</span>}
                </div>
                
                {isLoading && <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>}
                
                {!isLoading && searchResults.length === 0 && (
                    <div className="text-center p-10 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500">
                            {noResultsMessage || "আপনার সার্চ ক্রাইটেরিয়ায় কোনো সক্রিয় ডোনার খুঁজে পাওয়া যায়নি।"}
                        </p>
                    </div>
                )}
                
                {!isLoading && searchResults.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentDonors.map((donor) => (
                                <div key={donor._id} className="card bg-white shadow-xl hover:shadow-2xl transition duration-300 border-t-4 border-red-500">
                                    <div className="card-body p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="avatar flex-shrink-0">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500">
                                                    <img 
                                                        src={donor.photoURL || DEFAULT_AVATAR} 
                                                        alt={donor.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="card-title text-lg font-bold text-gray-800 flex items-center">
                                                        <User size={18} className="mr-1 text-red-600"/>{donor.name || 'নামহীন'}
                                                    </h3>
                                                    <span className="badge badge-md bg-red-600 text-white font-bold">{donor.bloodGroup}</span>
                                                </div>
                                                
                                                <div className="space-y-1 mt-2 text-gray-600 text-sm">
                                                    <p className='flex items-center'><MapPin size={14} className="mr-2 text-red-500"/>
                                                        {donor.upazila}, {donor.district}
                                                    </p>
                                                    <p className='flex items-center'><Phone size={14} className="mr-2 text-red-500"/>
                                                        <a href={`tel:${donor.phoneNumber}`} className="hover:underline">{donor.phoneNumber}</a>
                                                    </p>
                                                    <p className='flex items-center text-xs overflow-hidden'><Mail size={14} className="mr-2 text-red-500"/>
                                                        {donor.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- পেজিনেশন কন্ট্রোলস --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 mb-10">
                                <div className="join bg-white shadow-md border">
                                    <button 
                                        className="join-item btn btn-ghost" 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button 
                                            key={index} 
                                            className={`join-item btn btn-md ${currentPage === index + 1 ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-ghost'}`}
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button 
                                        className="join-item btn btn-ghost" 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DonorSearch;
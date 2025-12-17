import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 🔥 useNavigate ইম্পোর্ট করা হলো
import useAxiosSecure from '../../hooks/useAxiosSecure'; 
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm'; // PaymentForm ইম্পোর্ট করা হলো

// আপনার Stripe Publishable Key যোগ করুন
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK); 

const FundingPage = () => {
    const location = useLocation(); 
    const navigate = useNavigate(); // 🔥 useNavigate ইনিশিয়ালাইজ করা হলো
    
    // 🔥 funds এবং loading স্টেটগুলি আর প্রয়োজন নেই, কারণ টেবিল সরিয়ে ফেলা হলো
    // const [funds, setFunds] = useState([]); 
    // const [loading, setLoading] = useState(false); // লোডিং ডিফল্টভাবে false করা হলো
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const axiosSecure = useAxiosSecure(); 

    // 🔥 ডেটা ফেচ করার লজিক (fetchFunds) এখান থেকে সরিয়ে Admin-এর জন্য সুরক্ষিত রুটে ব্যবহার করুন

    // URL প্যারামিটার চেক করে মডাল ওপেন করা 
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        // যদি URL-এ ?donate=true থাকে, তবে মডালটি খুলুন
        if (queryParams.get('donate') === 'true') {
            setIsModalOpen(true);
        }
    }, [location.search]); 


    const handleModalOpen = () => setIsModalOpen(true);
    
    // 🔥🔥🔥 মূল পরিবর্তন: মডাল বন্ধ হলে হোমে রিডাইরেক্ট করা 🔥🔥🔥
    const handleModalClose = (shouldRefreshData = false) => {
        setIsModalOpen(false);
        
        // ১. URL থেকে ক্যোয়ারী প্যারামিটার সরিয়ে দিন
        window.history.replaceState(null, '', location.pathname); 
        
        // ২. ব্যবহারকারীকে পাবলিক হোমে রিডাইরেক্ট করা হলো
        navigate('/', { replace: true }); 
        
        // 🔥 পেমেন্ট সফল হলে (যদি shouldRefreshData = true হয়), অ্যাডমিনের জন্য একটি ট্রিগার করা যেতে পারে, 
        // তবে যেহেতু এটি পাবলিক রুট, তাই অ্যাডমিনকে নিজেই তার ড্যাশবোর্ড রিফ্রেশ করতে হবে।
        // এই ফাংশনের কাজ শুধু ক্লোজ করা এবং রিডাইরেক্ট করা।
    };


    // মডাল বন্ধ করার সময় PaymentForm এর জন্য একটি ডামি ফাংশন
    const dummyFetchFunds = () => {
        console.log("Funding successful. Admin must check the dashboard manually.");
    };


    return (
        <div className="p-6 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                {/* 🔥 এই হেডিংটি আর 'সকল ফান্ডিং' থাকবে না */}
                <h1 className="text-3xl font-bold text-red-600">ফান্ডিং ইনিশিয়েটিভ</h1>
                {/* এই বাটনটি এখনো মডাল খুলতে পারে, কিন্তু নেভিগেশন বারের লিংকটি মুখ্য */}
                <button
                    onClick={handleModalOpen}
                    className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                    এখনই ফান্ড দিন
                </button>
            </div>

            {/* 🔥🔥🔥 ফান্ডিং টেবিল রেন্ডারিং সরিয়ে ফেলা হলো 🔥🔥🔥 */}
            <div className="py-20 text-center text-gray-600">
                <p className="text-xl font-medium">আপনার ডোনেশন আমাদের রক্তদান কার্যক্রম সচল রাখতে সাহায্য করবে।</p>
                <p className="mt-2">উপরে 'এখনই ফান্ড দিন' বাটনে ক্লিক করুন অথবা ন্যাভিগেশন বারের 'ফান্ডিং' লিঙ্কে ক্লিক করুন।</p>
            </div>
            
            {/* পেমেন্ট মডেল */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-xl font-bold text-red-600">ফান্ড প্রদান করুন</h2>
                            <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-800 text-2xl">
                                &times;
                            </button>
                        </div>
                        
                        {/* Elements কম্পোনেন্টের মাধ্যমে PaymentForm রেন্ডার করা */}
                        <Elements stripe={stripePromise}>
                            <PaymentForm 
                                axiosSecure={axiosSecure} 
                                // টেবিল আপডেট করার জন্য এখন ডামি ফাংশন পাঠানো হলো
                                fetchFunds={dummyFetchFunds} 
                                closeModal={handleModalClose}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FundingPage;
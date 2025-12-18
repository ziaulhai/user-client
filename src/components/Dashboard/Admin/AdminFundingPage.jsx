// src/components/Dashboard/Admin/AdminFundingPage.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Shield, DollarSign } from 'lucide-react';

const AdminFundingPage = () => {
    const axiosSecure = useAxiosSecure();

    // ১. ফান্ডিং ডেটা ফেচ করা
    const { data: fundingData = [], isLoading } = useQuery({
        queryKey: ['allFunding'],
        queryFn: async () => {
            // 🔥 URL পরিবর্তন করা হলো: /api/v1/funding/all থেকে /api/v1/funds এ
            // এটি সার্ভার-সাইডের নতুন /api/v1/funds রুটের সাথে মিলছে
            const res = await axiosSecure.get('/api/v1/payment/funds'); 
            
            // ডেটাবেসে amount সেন্টে (cents) সেভ করা থাকলে, এখানে ডলারে (dollars) রূপান্তর করা
            // যদি আপনার সার্ভার Already ডলারে (dollars) রূপান্তর করে থাকে, তাহলে নিচের ম্যাপ ফাংশনটি বাদ দিন।
            // আমরা ধরে নিচ্ছি সার্ভার থেকে amount ডলারে আসছে (যেমন 10.00)। 
            
            return res.data;
        }
    });

    // মোট সংগৃহীত অর্থ গণনা করা
    const totalAmountCollected = fundingData.reduce((sum, item) => sum + item.amount, 0).toFixed(2);


    if (isLoading) {
        return <div className="text-center p-20"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Shield className='mr-2 text-red-600' /> মোট ফান্ডিং ম্যানেজমেন্ট টেবিল
            </h1>

            {/* মোট ফান্ডিং এর একটি সামারি */}
            <div className="stats shadow mb-8 border border-gray-200">
                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-title">মোট সংগৃহীত অর্থ</div>
                    <div className="stat-value text-red-600">
                        ${totalAmountCollected}
                    </div>
                    <div className="stat-desc">মোট {fundingData.length} টি ডোনেশন</div>
                </div>
            </div>

            {/* ফান্ডিং টেবিল */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                <table className="table w-full">
                    <thead className="bg-red-50 text-red-600">
                        <tr>
                            <th>#</th>
                            <th>ডোনারের নাম</th>
                            <th>পরিমাণ</th>
                            <th>তারিখ</th>
                            <th>ট্রানজেকশন আইডি</th>
                            <th>স্ট্যাটাস</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundingData.map((donation, index) => (
                            <tr key={donation._id} className="hover:bg-gray-50">
                                <th>{index + 1}</th>
                                <td>{donation.donorName || 'নামহীন ডোনার'}</td>
                                <td className="font-semibold text-green-700">${donation.amount ? donation.amount.toFixed(2) : '0.00'}</td>
                                {/* সার্ভার থেকে 'fundingDate' বা 'date' আসতে পারে, এখানে 'fundingDate' ব্যবহার করা হলো যা মডেলে ছিল */}
                                <td>{new Date(donation.fundingDate || donation.date).toLocaleDateString('bn-BD')}</td> 
                                <td className="text-sm font-mono">{donation.transactionId}</td>
                                <td>
                                    <span className="badge badge-success text-white">সম্পূর্ণ</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {fundingData.length === 0 && (
                    <div className="p-4 text-center text-gray-500">কোনো ফান্ডিং ডেটা পাওয়া যায়নি।</div>
                )}
            </div>
        </div>
    );
};

export default AdminFundingPage;
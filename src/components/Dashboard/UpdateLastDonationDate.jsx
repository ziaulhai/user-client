import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Calendar, User, CheckCircle } from 'lucide-react';

import useAxiosSecure from '../../../hooks/useAxiosSecure'; // সুরক্ষিত API কল
import useAuth from '../../../hooks/useAuth'; // ব্যবহারকারীর তথ্য

const UpdateLastDonationDate = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    // বর্তমান তারিখকে ডিফল্ট হিসেবে সেট করা
    const today = new Date().toISOString().split('T')[0];
    const [lastDonationDate, setLastDonationDate] = useState(today);

    // যদি ব্যবহারকারী লোড না হয় বা লগইন না থাকে
    if (loading || !user) {
        return <div className="text-center p-20"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // নিশ্চিতকরণ
        Swal.fire({
            title: "নিশ্চিত?",
            text: `আপনি কি ${lastDonationDate} তারিখটিকে আপনার শেষ রক্তদানের তারিখ হিসেবে আপডেট করতে চান?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "হ্যাঁ, আপডেট করুন"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const updateData = {
                        lastDonationDate: lastDonationDate, // yyyy-mm-dd ফর্ম্যাট
                    };
                    
                    // সার্ভারে PATCH রিকোয়েস্টের মাধ্যমে আপডেট করা
                    // আপনার সার্ভার সাইড রুট: PATCH /users/:email
                    const res = await axiosSecure.patch(`/api/v1/users/${user.email}`, updateData);

                    if (res.data.modifiedCount > 0) {
                        Swal.fire(
                            'সফল!',
                            'আপনার শেষ রক্তদানের তারিখ সফলভাবে আপডেট হয়েছে। ধন্যবাদ!',
                            'success'
                        );
                        // প্রোফাইল পেজে নেভিগেট করা
                        navigate('/dashboard/profile'); 
                    } else if (res.data.matchedCount > 0) {
                         Swal.fire('অপরিবর্তিত', 'এই তারিখটি ইতিমধ্যেই সংরক্ষিত আছে।', 'info');
                    }
                    else {
                        Swal.fire('এরর!', 'আপডেট করা যায়নি।', 'error');
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'তারিখ আপডেট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };

    return (
        <div className="p-4 md:p-10 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 border-t-4 border-red-600">
                <h2 className="text-3xl font-bold text-red-600 mb-6 flex items-center">
                    <Calendar className='mr-3' size={30} /> শেষ রক্তদান আপডেট
                </h2>
                <p className="text-gray-600 mb-6">আপনার প্রোফাইলে শেষ রক্তদানের তারিখ আপডেট করুন। সাধারণত এর পরের তিন মাস আপনি রক্তদানের জন্য উপযুক্ত হবেন না।</p>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    
                    <div>
                        <label htmlFor="lastDonationDate" className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
                            <Calendar size={20} className='mr-2' /> শেষ রক্তদানের তারিখ:
                        </label>
                        <input
                            type="date"
                            id="lastDonationDate"
                            value={lastDonationDate}
                            onChange={(e) => setLastDonationDate(e.target.value)}
                            // বর্তমান তারিখের বেশি তারিখ সিলেক্ট করা যাবে না
                            max={today} 
                            required
                            className="input input-bordered w-full p-3 text-lg"
                        />
                    </div>

                    <div className="text-center pt-4">
                        <button type="submit" className="btn bg-red-600 text-white text-lg hover:bg-red-700 w-full">
                            <CheckCircle size={20} /> তারিখ সংরক্ষণ করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateLastDonationDate;
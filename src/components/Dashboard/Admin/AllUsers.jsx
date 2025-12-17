// src/components/Dashboard/Admin/AllUsers.jsx - সংশোধিত ও চূড়ান্ত সংস্করণ

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { User, Shield, CheckCircle, XCircle, ChevronDown, Droplet, MapPin, Heart } from 'lucide-react';
import useAuth from '../../../hooks/useAuth'; 

// স্ট্যাটাসের জন্য ক্লাস
const getStatusBadge = (status) => {
    switch (status) {
        case 'active': return 'badge badge-success text-white font-bold p-3';
        case 'blocked': return 'badge badge-error text-white font-bold p-3';
        default: return 'badge badge-neutral p-3';
    }
};

// রোলের জন্য ক্লাস
const getRoleBadge = (role) => {
    switch (role) {
        case 'admin': return 'badge bg-red-600 text-white font-bold p-3';
        case 'volunteer': return 'badge badge-info text-white font-bold p-3';
        default: return 'badge badge-outline badge-neutral p-3';
    }
};

const AllUsers = () => {
    const axiosSecure = useAxiosSecure();
    const { user: currentUser } = useAuth();

    // ১. সকল ইউজার ডেটা ফেচ করা
    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/api/v1/users'); 
            return res.data;
        }
    });

    // ২. স্ট্যাটাস বা রোল আপডেট করার জন্য জেনেরিক হ্যান্ডেলার
    const handleUpdate = async (userToUpdate, field, value, message) => {
        // নিরাপত্তাজনিত কারণ: অ্যাডমিন নিজেকে ব্লক বা রোল পরিবর্তন করতে পারবে না
        if (userToUpdate.email === currentUser?.email && (field === 'role' || field === 'status')) {
             Swal.fire('সাবধান!', 'নিরাপত্তার কারণে আপনি নিজের অ্যাডমিন রোল বা স্ট্যাটাস পরিবর্তন করতে পারবেন না।', 'warning');
             return;
        }

        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: message,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "হ্যাঁ, পরিবর্তন করুন!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const updateData = { [field]: value };
                    
                    const res = await axiosSecure.patch(`/api/v1/users/role-status/${userToUpdate._id}`, updateData);

                    if (res.data.modifiedCount > 0) {
                        Swal.fire(
                            'সফল!',
                            `ব্যবহারকারী ${field} সফলভাবে আপডেট হয়েছে।`,
                            'success'
                        );
                        refetch(); // ডেটা রিফ্রেশ করা
                    } else {
                        Swal.fire('অপরিবর্তিত', 'কোনো পরিবর্তন সনাক্ত করা যায়নি।', 'info');
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'আপডেট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };
    
    // ৩. রোল হ্যান্ডেলার
    const handleMakeAdmin = (user) => handleUpdate(user, 'role', 'admin', `${user.name} কে কি অ্যাডমিন বানাতে চান?`);
    const handleMakeVolunteer = (user) => handleUpdate(user, 'role', 'volunteer', `${user.name} কে কি ভলান্টিয়ার বানাতে চান?`);
    const handleMakeDonor = (user) => handleUpdate(user, 'role', 'donor', `${user.name} কে কি ডোনার বানাতে চান?`);
    
    // ৪. স্ট্যাটাস হ্যান্ডেলার
    const handleBlockUser = (user) => handleUpdate(user, 'status', 'blocked', `${user.name} কে ব্লক করতে চান?`);
    const handleUnblockUser = (user) => handleUpdate(user, 'status', 'active', `${user.name} কে অ্যাকটিভ করতে চান?`);


    if (isLoading) {
        return <div className="text-center p-20 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }
    
    // 🔥🔥 ডেটা উল্টানোর জন্য লজিক: 
    // নতুন অ্যারে তৈরি করে, সেটিকে উল্টে ম্যাপিং করা হচ্ছে
    const reversedUsers = [...users].reverse(); 

    return (
        <div className="p-4 md:p-8 rounded-xl shadow-2xl bg-white">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b pb-2 flex items-center">
                <Shield className='mr-2' size={30} /> সকল ব্যবহারকারী ({users.length})
            </h1>

            <div className="overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                        <tr className='text-gray-700 bg-gray-100'>
                            <th>#</th>
                            <th>ইউজার তথ্য</th>
                            <th>অবস্থান ও ব্লাড গ্রুপ</th>
                            <th>রোল</th>
                            <th>স্ট্যাটাস</th>
                            <th className='text-center'>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🔥 এখানে পরিবর্তিত (উল্টানো) অ্যারে ব্যবহার করা হলো */}
                        {reversedUsers.map((user, index) => ( 
                            <tr key={user._id} className='hover'>
                                {/* সিরিয়াল নম্বর গণনা: মোট ব্যবহারকারী - ইনডেক্স */}
                                <th>{users.length - index}</th> 
                                <td>
                                    <p className='font-semibold'>{user.name}</p>
                                    <p className='text-sm text-gray-500'>{user.email}</p>
                                </td>
                                <td>
                                    <p className='text-red-600 font-bold flex items-center'><Droplet size={14} className='mr-1'/> {user.bloodGroup || 'N/A'}</p>
                                    <p className='text-xs text-gray-600 flex items-center'><MapPin size={14} className='mr-1'/> {user.upazila || 'N/A'}, {user.district || 'N/A'}</p>
                                </td>
                                <td>
                                    <span className={getRoleBadge(user.role)}>{user.role?.toUpperCase()}</span>
                                </td>
                                <td>
                                    <span className={getStatusBadge(user.status)}>{user.status?.toUpperCase()}</span>
                                </td>
                                <td className='space-x-1 flex flex-wrap gap-1'>
                                    {/* ✅ ফিক্সড লজিক: লগইন করা অ্যাডমিন শুধুমাত্র অন্য ইউজারদেরকে আপডেট করতে পারবে */}
                                    {user.email !== currentUser?.email ? (
                                        <>
                                            {/* রোল পরিবর্তন ড্রপডাউন */}
                                            <div className="dropdown dropdown-bottom dropdown-end">
                                                <div tabIndex={0} role="button" className="btn btn-sm btn-info text-white m-1">
                                                    রোল পরিবর্তন <ChevronDown size={16} />
                                                </div>
                                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                                    {user.role !== 'admin' && <li onClick={() => handleMakeAdmin(user)}><a><Shield size={16} className='text-red-600'/> অ্যাডমিন বানাও</a></li>}
                                                    {user.role !== 'volunteer' && <li onClick={() => handleMakeVolunteer(user)}><a><User size={16} className='text-blue-600'/> ভলান্টিয়ার বানাও</a></li>}
                                                    {user.role !== 'donor' && <li onClick={() => handleMakeDonor(user)}><a><Heart size={16} className='text-red-600'/> ডোনার বানাও</a></li>}
                                                </ul>
                                            </div>

                                            {/* স্ট্যাটাস বাটন */}
                                            {user.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleBlockUser(user)}
                                                    className="btn btn-sm btn-outline btn-error m-1" 
                                                >
                                                    <XCircle size={16} /> ব্লক
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnblockUser(user)}
                                                    className="btn btn-sm btn-outline btn-success m-1" 
                                                >
                                                    <CheckCircle size={16} /> অ্যাকটিভ
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        // নিজের রো-তে অ্যাকশন ডিসেবল থাকবে
                                        <span className="text-sm text-gray-400 p-2"> (আপনি)</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUsers;
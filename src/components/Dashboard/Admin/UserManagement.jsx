// src/components/Dashboard/Admin/UserManagement.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Users, UserPlus, Shield, UserX, UserCheck, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

// রোল ভিত্তিক রং এবং ডিসপ্লে নাম
const getRoleDetails = (role) => {
    switch (role) {
        case 'admin':
            return { color: 'bg-red-600 text-white', icon: Shield, name: 'অ্যাডমিন' };
        case 'volunteer':
            return { color: 'bg-blue-500 text-white', icon: UserPlus, name: 'ভলান্টিয়ার' };
        default:
            return { color: 'bg-green-500 text-white', icon: Users, name: 'ডোনার' };
    }
};

const UserManagement = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    // ১. সমস্ত ইউজার ফেচ করা
    const { data: users = [], isLoading, isError, error } = useQuery({
        queryKey: ['allUsers'],
        queryFn: async () => {
            // ধরে নেওয়া হলো এটি অ্যাডমিনদের জন্য একটি সুরক্ষিত রুট
            const res = await axiosSecure.get('/api/v1/users'); 
            return res.data;
        }
    });

    // ২. রোল পরিবর্তনের মিউটেশন
    const updateRoleMutation = useMutation({
        mutationFn: ({ id, newRole }) => {
            return axiosSecure.patch(`/api/v1/users/role/${id}`, { role: newRole });
        },
        onSuccess: () => {
            toast.success("ব্যবহারকারীর রোল সফলভাবে পরিবর্তন করা হয়েছে!");
            queryClient.invalidateQueries(['allUsers']); 
        },
        onError: (err) => {
            toast.error("রোল পরিবর্তন ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });

    // ৩. স্ট্যাটাস পরিবর্তনের মিউটেশন (ব্লক/আনব্লক)
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, newStatus }) => {
            // স্ট্যাটাস 'active' বা 'blocked' হতে পারে
            return axiosSecure.patch(`/api/v1/users/status/${id}`, { status: newStatus });
        },
        onSuccess: (data, variables) => {
            const statusText = variables.newStatus === 'active' ? 'আনব্লক' : 'ব্লক';
            toast.success(`ব্যবহারকারীকে সফলভাবে ${statusText} করা হয়েছে!`);
            queryClient.invalidateQueries(['allUsers']);
        },
        onError: (err) => {
            toast.error("স্ট্যাটাস পরিবর্তন ব্যর্থ: " + (err.response?.data?.message || 'Unknown Error'));
        }
    });

    // হ্যান্ডলার ফাংশন
    const handleRoleChange = (userId, currentRole) => {
        // নতুন রোল প্রম্পট
        const newRole = prompt(`ব্যবহারকারী ${userId} এর নতুন রোল লিখুন (donor, volunteer, admin)। বর্তমান রোল: ${currentRole}`);
        if (newRole && ['donor', 'volunteer', 'admin'].includes(newRole.toLowerCase())) {
            if (newRole.toLowerCase() !== currentRole) {
                updateRoleMutation.mutate({ id: userId, newRole: newRole.toLowerCase() });
            }
        } else if (newRole !== null) {
            toast.error("অবৈধ রোল ইনপুট!");
        }
    };
    
    const handleStatusToggle = (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        const actionText = newStatus === 'blocked' ? 'ব্লক' : 'আনব্লক';

        if (window.confirm(`আপনি কি নিশ্চিত এই ইউজারকে ${actionText} করতে চান?`)) {
            updateStatusMutation.mutate({ id: userId, newStatus });
        }
    };
    
    // ফিল্টারিং লজিক
    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (isLoading) {
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (isError) {
        return <div className="p-10 text-center text-red-600">ইউজার ডেটা লোড করতে ব্যর্থ: {error.message}</div>;
    }


    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users size={30} className='text-red-600'/> ইউজার ম্যানেজমেন্ট ({users.length})
            </h1>

            {/* --- সার্চ এবং রিফ্রেশ --- */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md mb-6">
                <div className="flex items-center gap-3 w-full md:w-1/3">
                    <Search size={20} className='text-gray-500'/>
                    <input
                        type="text"
                        placeholder="নাম বা ইমেইল দিয়ে সার্চ করুন..."
                        className="input input-bordered input-sm w-full bg-gray-50 border-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    className="btn btn-sm btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-4 md:mt-0"
                    onClick={() => queryClient.invalidateQueries(['allUsers'])}
                    disabled={updateRoleMutation.isLoading || updateStatusMutation.isLoading}
                >
                    <RotateCw size={18} /> ডেটা রিফ্রেশ করুন
                </button>
            </div>

            {/* --- ইউজার তালিকা (টেবিল) --- */}
            <div className="bg-white rounded-xl shadow-xl overflow-x-auto">
                {filteredUsers.length === 0 ? (
                    <p className='p-8 text-center text-gray-500'>কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।</p>
                ) : (
                    <table className="table w-full">
                        {/* টেবিল হেড */}
                        <thead>
                            <tr className='bg-red-50 text-gray-700'>
                                <th>#</th>
                                <th>নাম (ইমেইল)</th>
                                <th>অবস্থান</th>
                                <th>রোল</th>
                                <th>স্ট্যাটাস</th>
                                <th>রোল অ্যাকশন</th>
                                <th>স্ট্যাটাস অ্যাকশন</th>
                            </tr>
                        </thead>
                        {/* টেবিল বডি */}
                        <tbody>
                            {filteredUsers.map((user, index) => {
                                const roleDetail = getRoleDetails(user.role);
                                return (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <th>{index + 1}</th>
                                        <td>
                                            <p className='font-semibold'>{user.name || 'N/A'}</p>
                                            <p className='text-xs text-gray-500'>{user.email}</p>
                                        </td>
                                        <td>{user.upazila || 'N/A'}, {user.district || 'N/A'}</td>
                                        <td>
                                            <div className={`badge badge-lg font-bold ${roleDetail.color} flex items-center gap-1`}>
                                                <roleDetail.icon size={16}/> {roleDetail.name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-lg font-bold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status === 'active' ? 'সক্রিয়' : 'ব্লকড'}
                                            </span>
                                        </td>
                                        <td className='space-x-2'>
                                            {/* রোল পরিবর্তনের বাটন */}
                                            <button 
                                                className="btn btn-sm btn-outline btn-info"
                                                onClick={() => handleRoleChange(user._id, user.role)}
                                                disabled={updateRoleMutation.isLoading || updateStatusMutation.isLoading}
                                                title="রোল পরিবর্তন করুন"
                                            >
                                                রোল পরিবর্তন
                                            </button>
                                        </td>
                                        <td className='space-x-2'>
                                            {/* স্ট্যাটাস টগল বাটন */}
                                            <button 
                                                className={`btn btn-sm btn-ghost ${user.status === 'active' ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                                                onClick={() => handleStatusToggle(user._id, user.status)}
                                                disabled={updateRoleMutation.isLoading || updateStatusMutation.isLoading}
                                                title={user.status === 'active' ? 'ব্লক করুন' : 'আনব্লক করুন'}
                                            >
                                                {user.status === 'active' ? <UserX size={18}/> : <UserCheck size={18}/>}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
};

export default UserManagement;
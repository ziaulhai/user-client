// src/components/Dashboard/Admin/AllUsers.jsx - সংশোধিত ও রেসপন্সিভ সংস্করণ

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { User, Shield, CheckCircle, XCircle, ChevronDown, Droplet, MapPin, Heart, Mail } from 'lucide-react';
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
                        Swal.fire('সফল!', `ব্যবহারকারী ${field} সফলভাবে আপডেট হয়েছে।`, 'success');
                        refetch(); 
                    } else {
                        Swal.fire('অপরিবর্তিত', 'কোনো পরিবর্তন সনাক্ত করা যায়নি।', 'info');
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'আপডেট করা সম্ভব হয়নি।', 'error');
                }
            }
        });
    };
    
    // ৩. রোল হ্যান্ডেলার (পাথ এবং ফাংশন অপরিবর্তিত)
    const handleMakeAdmin = (user) => handleUpdate(user, 'role', 'admin', `${user.name} কে কি অ্যাডমিন বানাতে চান?`);
    const handleMakeVolunteer = (user) => handleUpdate(user, 'role', 'volunteer', `${user.name} কে কি ভলান্টিয়ার বানাতে চান?`);
    const handleMakeDonor = (user) => handleUpdate(user, 'role', 'donor', `${user.name} কে কি ডোনার বানাতে চান?`);
    
    // ৪. স্ট্যাটাস হ্যান্ডেলার
    const handleBlockUser = (user) => handleUpdate(user, 'status', 'blocked', `${user.name} কে ব্লক করতে চান?`);
    const handleUnblockUser = (user) => handleUpdate(user, 'status', 'active', `${user.name} কে অ্যাকটিভ করতে চান?`);

    if (isLoading) {
        return <div className="text-center p-20 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }
    
    const reversedUsers = [...users].reverse(); 

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
                <Shield size={32} /> সকল ব্যবহারকারী ({users.length})
            </h1>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-visible bg-white rounded-xl shadow-md border">
                <div className="grid grid-cols-12 bg-gray-100 p-4 font-bold text-gray-700 uppercase text-xs border-b">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">ইউজার তথ্য</div>
                    <div className="col-span-2 text-center">অবস্থান ও ব্লাড</div>
                    <div className="col-span-2 text-center">রোল</div>
                    <div className="col-span-2 text-center">স্ট্যাটাস</div>
                    <div className="col-span-2 text-center">অ্যাকশন</div>
                </div>

                <div className="divide-y overflow-visible">
                    {reversedUsers.map((user, index) => (
                        <div key={user._id} className="grid grid-cols-12 items-center p-4 hover:bg-red-50 transition-colors overflow-visible">
                            <div className="col-span-1 text-gray-500">{users.length - index}</div>
                            <div className="col-span-3">
                                <p className="font-bold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <div className="col-span-2 flex flex-col items-center">
                                <span className="text-red-600 font-bold flex items-center"><Droplet size={14}/> {user.bloodGroup}</span>
                                <span className="text-[10px] text-gray-500">{user.district}</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className={getRoleBadge(user.role)}>{user.role}</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className={getStatusBadge(user.status)}>{user.status}</span>
                            </div>
                            <div className="col-span-2 flex justify-center gap-2 overflow-visible">
                                {user.email !== currentUser?.email ? (
                                    <>
                                        <div className="dropdown dropdown-left dropdown-end overflow-visible">
                                            <div tabIndex={0} role="button" className="btn btn-xs btn-info text-white">রোল <ChevronDown size={14}/></div>
                                            <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-base-100 rounded-box w-48 border">
                                                {/* বর্তমান রোল বাদে অন্যগুলো শো করার লজিক */}
                                                {user.role !== 'admin' && <li onClick={() => handleMakeAdmin(user)}><a><Shield size={16} className="text-red-600"/>অ্যাডমিন বানাও</a></li>}
                                                {user.role !== 'volunteer' && <li onClick={() => handleMakeVolunteer(user)}><a><User size={16} className="text-blue-600"/>ভলান্টিয়ার বানাও</a></li>}
                                                {user.role !== 'donor' && <li onClick={() => handleMakeDonor(user)}><a><Heart size={16} className="text-pink-600"/>ডোনার বানাও</a></li>}
                                            </ul>
                                        </div>
                                        <button onClick={() => user.status === 'active' ? handleBlockUser(user) : handleUnblockUser(user)} className={`btn btn-xs btn-outline ${user.status === 'active' ? 'btn-error' : 'btn-success'}`}>
                                            {user.status === 'active' ? <XCircle size={14}/> : <CheckCircle size={14}/>}
                                        </button>
                                    </>
                                ) : <span className="text-xs italic text-gray-400">আপনি</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
                {reversedUsers.map((user, index) => (
                    <div key={user._id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-red-500 relative overflow-visible">
                        <div className="absolute top-4 right-4 text-xs font-bold text-gray-300">#{users.length - index}</div>
                        
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-red-100 p-2 rounded-full text-red-600"><User size={20}/></div>
                            <div>
                                <h3 className="font-bold text-gray-800 leading-none">{user.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Mail size={12}/> {user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-[10px] uppercase text-gray-400 font-bold">ব্লাড গ্রুপ ও জেলা</p>
                                <p className="text-sm font-bold text-red-600 flex items-center gap-1"><Droplet size={14}/> {user.bloodGroup} ({user.district})</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-[10px] uppercase text-gray-400 font-bold">বর্তমান রোল</p>
                                <div className={getRoleBadge(user.role)}>{user.role}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4 overflow-visible">
                            <div className={getStatusBadge(user.status)}>{user.status}</div>
                            
                            <div className="flex gap-2 overflow-visible">
                                {user.email !== currentUser?.email ? (
                                    <>
                                        <div className="dropdown dropdown-top dropdown-end">
                                            <div tabIndex={0} role="button" className="btn btn-sm btn-info text-white gap-1">রোল <ChevronDown size={14}/></div>
                                            <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-base-100 rounded-box w-48 border border-gray-200 mb-2">
                                                {/* মোবাইল ভিউতেও লজিক ফিক্স করা হয়েছে */}
                                                {user.role !== 'admin' && <li onClick={() => handleMakeAdmin(user)}><a><Shield size={16} className="text-red-600"/> অ্যাডমিন বানাও</a></li>}
                                                {user.role !== 'volunteer' && <li onClick={() => handleMakeVolunteer(user)}><a><User size={16} className="text-blue-600"/> ভলান্টিয়ার বানাও</a></li>}
                                                {user.role !== 'donor' && <li onClick={() => handleMakeDonor(user)}><a><Heart size={16} className="text-pink-600"/> ডোনার বানাও</a></li>}
                                            </ul>
                                        </div>
                                        <button onClick={() => user.status === 'active' ? handleBlockUser(user) : handleUnblockUser(user)} className={`btn btn-sm ${user.status === 'active' ? 'btn-error' : 'btn-success text-white'}`}>
                                            {user.status === 'active' ? <XCircle size={16}/> : <CheckCircle size={16}/>}
                                        </button>
                                    </>
                                ) : <span className="text-sm italic text-gray-400 font-bold">আপনার প্রোফাইল</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllUsers;
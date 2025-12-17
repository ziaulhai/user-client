import React from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { Trash2, Edit, List, Heart, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// স্ট্যাটাস অনুসারে ব্যাজ কালার (AdminDashboard থেকে ধার করা)
const getStatusClass = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'inprogress': return 'bg-blue-100 text-blue-800';
        case 'done': return 'bg-green-100 text-green-800';
        case 'canceled': return 'bg-gray-100 text-gray-800';
        default: return 'bg-white text-gray-600';
    }
};

const DonorMyDonationRequests = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    // --- ডেটা লোড করার Query ---
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['donorRequests', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            // সার্ভার রুট: GET /api/v1/donation-requests/my-requests
            // সার্ভারে এই রুটটি JWT টোকেন থেকে ইমেইল ব্যবহার করে ফিল্টার করবে।
            const res = await axiosSecure.get(`/api/v1/donation-requests/my-requests`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    // --- রিকোয়েস্ট ডিলিট করার Mutation ---
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            // সার্ভার রুট: DELETE /api/v1/donation-requests/:id
            const res = await axiosSecure.delete(`/api/v1/donation-requests/${id}`);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire('সফল!', 'অনুরোধটি সফলভাবে বাতিল/ডিলিট করা হয়েছে।', 'success');
            queryClient.invalidateQueries({ queryKey: ['donorRequests'] });
            queryClient.invalidateQueries({ queryKey: ['donorStats'] }); // স্ট্যাটাস রিফ্রেশ করার জন্য
        },
        onError: (error) => {
            Swal.fire('এরর!', error.response?.data?.message || 'অনুরোধটি ডিলিট করা সম্ভব হয়নি।', 'error');
        }
    });

    // --- ডিলিট/বাতিল হ্যান্ডেলার ---
    const handleDeleteOrCancel = (req) => {
        const { _id, recipientName, requestStatus } = req;
        
        let confirmText = '';
        let confirmButtonText = '';
        let successMessage = '';

        if (requestStatus === 'pending') {
            confirmText = `আপনি কি ${recipientName} এর ডোনেশন অনুরোধটি বাতিল করতে চান? এটি একবার বাতিল হলে পুনরুদ্ধার করা যাবে না।`;
            confirmButtonText = 'হ্যাঁ, বাতিল করুন';
            successMessage = 'অনুরোধটি সফলভাবে বাতিল করা হয়েছে।';
        } else if (requestStatus === 'canceled' || requestStatus === 'done' || requestStatus === 'inprogress') {
            confirmText = `আপনি কি ${recipientName} এর "${requestStatus.toUpperCase()}" স্ট্যাটাসের অনুরোধটি ডিলিট করতে চান?`;
            confirmButtonText = 'হ্যাঁ, ডিলিট করুন';
            successMessage = 'অনুরোধটি সফলভাবে ডিলিট করা হয়েছে।';
        }

        Swal.fire({
            title: "নিশ্চিত?",
            text: confirmText,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: confirmButtonText
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(_id);
            }
        });
    };
    
    // --- ডোনারের নাম/ইমেইল শো করার লজিক ---
    const getDonorInfo = (req) => {
        if (req.requestStatus === 'pending' || !req.donorName) {
            return {
                name: 'অপেক্ষা করছে...',
                email: ''
            };
        }
        
        // রিকোয়েস্ট ইন প্রগ্রেস হলে বা ডোনার নির্ধারণ হলে
        return {
            name: req.donorName,
            email: req.donorEmail
        };
    };

    if (isLoading) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }
    
    return (
        <div className="p-4 md:p-8 rounded-xl shadow-2xl bg-white">
            <h1 className="text-3xl font-bold text-red-600 mb-6 border-b pb-2 flex items-center"><Heart className='mr-2' /> আমার ডোনেশন অনুরোধ ({requests.length})</h1>

            {requests.length === 0 ? (
                <div className='text-center p-10 bg-gray-50 rounded-xl'>
                    <p className='text-xl text-gray-500'>আপনি এখনও কোনো ডোনেশন অনুরোধ তৈরি করেননি।</p>
                    <Link to="/dashboard/create-donation-request" className='btn bg-red-600 text-white mt-4 hover:bg-red-700'>
                        নতুন অনুরোধ তৈরি করুন
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full table-zebra">
                        <thead>
                            <tr className='text-gray-700 bg-gray-100'>
                                <th>#</th>
                                <th>রোগী ও রক্তের গ্রুপ</th>
                                <th>অবস্থান ও তারিখ</th>
                                <th>ডোনার তথ্য</th>
                                <th>স্ট্যাটাস</th>
                                <th className='text-center'>এডিট/ডিলিট</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req, index) => {
                                const donorInfo = getDonorInfo(req);
                                
                                return (
                                    <tr key={req._id}>
                                        <th>{index + 1}</th>
                                        <td>
                                            <p className='font-semibold'>{req.recipientName}</p>
                                            <p className='text-red-600 font-bold text-sm'>{req.bloodGroup}</p>
                                        </td>
                                        <td>
                                            <p className='text-sm'>{req.recipientUpazila}, {req.recipientDistrict}</p>
                                            <p className='text-xs text-gray-500'>দরকার: {format(new Date(req.donationDate), 'dd MMM, yy')} ({req.donationTime})</p>
                                        </td>
                                        <td>
                                            <p className='font-semibold text-sm'>{donorInfo.name}</p>
                                            <p className='text-xs text-gray-500'>{donorInfo.email}</p>
                                        </td>
                                        <td>
                                            <div className={`badge text-xs font-semibold ${getStatusClass(req.requestStatus)}`}>
                                                {req.requestStatus.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className='space-y-1'>
                                            {/* শুধু 'pending' স্ট্যাটাসের রিকোয়েস্ট এডিট করা যাবে */}
                                            {req.requestStatus === 'pending' && (
                                                <Link 
                                                    to={`/dashboard/edit-donation-request/${req._id}`}
                                                    className="btn btn-xs btn-info text-white w-full" 
                                                >
                                                    <Edit size={12} /> এডিট
                                                </Link>
                                            )}
                                            
                                            {/* 'pending' হলে বাতিল, অন্যথায় ডিলিট */}
                                            <button 
                                                onClick={() => handleDeleteOrCancel(req)}
                                                className="btn btn-xs btn-error text-white w-full" 
                                            >
                                                <Trash2 size={12} /> 
                                                {req.requestStatus === 'pending' ? 'বাতিল' : 'ডিলিট'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DonorMyDonationRequests;
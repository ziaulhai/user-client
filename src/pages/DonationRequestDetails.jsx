import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Phone, Mail, Clock, Calendar, Heart, User, Droplet } from 'lucide-react';
import Swal from 'sweetalert2';

import useAxiosSecure from '../hooks/useAxiosSecure'; // সুরক্ষিত API কল
import useAuth from '../hooks/useAuth'; // ব্যবহারকারীর তথ্য

// রিকোয়েস্ট স্ট্যাটাসের জন্য ক্লাস
const getStatusClass = (status) => {
    const baseClass = 'font-bold px-3 py-1 rounded-full text-white';
    switch (status) {
        case 'pending': return `${baseClass} bg-yellow-600`;
        case 'inprogress': return `${baseClass} bg-blue-600`;
        case 'done': return `${baseClass} bg-green-600`;
        case 'canceled': return `${baseClass} bg-gray-600`;
        default: return `${baseClass} bg-red-600`;
    }
};

const DonationRequestDetails = () => {
    const { id } = useParams();
    // 🌟 পরিবর্তন ১: useAuth থেকে loading স্ট্যাটাসটি ইম্পোর্ট করা হলো
    const { user, loading } = useAuth(); 
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    // 🌟 পরিবর্তন ২: enabled শর্তটি সংজ্ঞায়িত করা হলো
    // loading শেষ না হওয়া পর্যন্ত এবং user?.email নিশ্চিত না হওয়া পর্যন্ত query disable থাকবে
    const isQueryEnabled = !loading && !!user?.email && !!id;

    // ১. ডোনেশন রিকোয়েস্ট ডেটা ফেচ করা
    const { data: request = {}, isLoading, refetch } = useQuery({
        queryKey: ['donationRequest', id, user?.email], // user?.email কে queryKey তে যুক্ত করা হলো
        queryFn: async () => {
            // আইডি এবং ইউজার ইমেল না থাকলে রিকোয়েস্ট পাঠানো হবে না
            if (!id || !user?.email) return {}; 
            
            // ড্যাশবোর্ড থেকে আসার কারণে সুরক্ষিত এপিআই ব্যবহার করা হলো।
            const res = await axiosSecure.get(`/api/v1/donation-requests/${id}`);
            return res.data;
        },
        // 🌟 পরিবর্তন ৩: enabled শর্ত যোগ করা হলো
        enabled: isQueryEnabled, 
    });

    // ২. ডোনার হিসেবে অ্যাসাইন হওয়ার হ্যান্ডেলার
    const handleVolunteer = () => {
        if (!user) {
            Swal.fire('লগইন প্রয়োজন', 'স্বেচ্ছাসেবক হতে অনুগ্রহ করে লগইন করুন।', 'warning');
            return navigate('/login');
        }

        // রিকোয়েস্টকারী নিজের রিকোয়েস্টে ডোনার হতে পারবে না।
        if (request.requesterEmail === user.email) {
            return Swal.fire('সতর্কতা', 'আপনি আপনার নিজের অনুরোধে ডোনার হতে পারবেন না।', 'warning');
        }
        
        // নিশ্চিতকরণ
        Swal.fire({
            title: "স্বেচ্ছাসেবক হবেন?",
            text: `আপনি রক্তদানকারী হিসেবে এই অনুরোধটি গ্রহণ করতে চান? \n(আপনার স্ট্যাটাস 'In Progress' এ পরিবর্তিত হবে)`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
            confirmButtonText: "হ্যাঁ, আমি ডোনার"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const updateData = {
                        requestStatus: 'inprogress',
                        donorEmail: user.email,
                        donorName: user.displayName || 'Anonymous Donor'
                    };
                    
                    // সার্ভারে PATCH রিকোয়েস্টের মাধ্যমে আপডেট করা
                    // 🚨 নোট: আপনার সার্ভার সাইড রুটটি /donation-requests/:id এ PATCH রিকোয়েস্ট হ্যান্ডেল করার জন্য তৈরি করা প্রয়োজন।
                    const res = await axiosSecure.patch(`/donation-requests/${id}`, updateData);

                    if (res.data.modifiedCount > 0) {
                        Swal.fire(
                            'সফল!',
                            'আপনি সফলভাবে ডোনার হিসেবে অ্যাসাইন হয়েছেন! অনুগ্রহ করে রিকোয়েস্টকারীর সাথে যোগাযোগ করুন।',
                            'success'
                        );
                        refetch(); // ডেটা রিফ্রেশ করা
                    } else if (res.data.modifiedCount === 0 && res.data.matchedCount > 0) {
                        // যদি ম্যাচ করে কিন্তু modified না হয়, তার মানে ডোনার আগে থেকেই অ্যাসাইন করা আছে।
                        Swal.fire('সতর্কতা', 'এই অনুরোধে ইতিমধ্যেই একজন ডোনার অ্যাসাইন করা আছে।', 'warning');
                    } else {
                        Swal.fire('এরর!', 'অনুরোধটি আপডেট করা যায়নি।', 'error');
                    }
                } catch (error) {
                    Swal.fire('এরর!', error.response?.data?.message || 'ডোনার হিসেবে অ্যাসাইন হওয়া সম্ভব হয়নি।', 'error');
                }
            }
        });
    };
    
    // --- লোডিং এবং এরর হ্যান্ডেলিং ---
    // 🌟 পরিবর্তন ৪: useAuth থেকে loading যুক্ত করা হলো
    if (loading || isLoading) {
        return <div className="text-center p-20"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (!request._id) {
        return <div className="text-center p-20 text-xl text-gray-500">অনুরোধের তথ্য খুঁজে পাওয়া যায়নি।</div>;
    }

    // ডোনার অ্যাসাইন হওয়ার শর্ত
    // ensure donorEmail is not already present before checking request.donorEmail
    const isAlreadyAssigned = !!request.donorEmail && request.requestStatus !== 'pending'; 
    const canVolunteer = request.requestStatus === 'pending' && !isAlreadyAssigned; 
    
    return (
        <div className="p-4 md:p-10 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* হেডার সেকশন */}
                <div className="bg-red-600 text-white p-6 md:p-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold flex items-center">
                            <Heart className='mr-3' size={30} /> রক্তদানের অনুরোধ
                        </h1>
                        <p className="mt-1 text-red-100 text-lg">{request.recipientName}-এর জন্য</p>
                    </div>
                    <span className={getStatusClass(request.requestStatus)}>
                        {request.requestStatus.toUpperCase()}
                    </span>
                </div>

                {/* মূল তথ্য */}
                <div className="p-6 md:p-8 space-y-8">
                    
                    {/* রোগীর এবং প্রয়োজনীয় তথ্য */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                        <div className='space-y-3'>
                            <h2 className="text-xl font-bold text-gray-700 flex items-center">
                                <User className='mr-2' size={20} /> রোগীর তথ্য
                            </h2>
                            <p><span className="font-medium">রোগীর নাম:</span> {request.recipientName}</p>
                            <p><span className="font-medium flex items-center"><Droplet className='mr-1 text-red-500' size={18} /> ব্লাড গ্রুপ:</span> <span className='text-red-600 text-xl font-extrabold'>{request.bloodGroup}</span></p>
                        </div>
                        <div className='space-y-3'>
                            <h2 className="text-xl font-bold text-gray-700 flex items-center">
                                <Calendar className='mr-2' size={20} /> সময় ও স্থান
                            </h2>
                            <p><span className="font-medium flex items-center"><Calendar className='mr-1' size={18} /> প্রয়োজনীয় তারিখ:</span> {format(new Date(request.donationDate), 'dd MMMM, yyyy')}</p>
                            <p><span className="font-medium flex items-center"><Clock className='mr-1' size={18} /> প্রয়োজনীয় সময়:</span> {request.donationTime}</p>
                        </div>
                    </div>

                    {/* যোগাযোগের তথ্য ও অবস্থান */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                        <div className='space-y-3'>
                            <h2 className="text-xl font-bold text-gray-700 flex items-center">
                                <MapPin className='mr-2' size={20} /> হাসপাতালের ঠিকানা
                            </h2>
                            <p><span className="font-medium">হাসপাতাল:</span> {request.hospitalName}</p>
                            <p><span className="font-medium">অবস্থান:</span> {request.recipientUpazila}, {request.recipientDistrict}</p>
                            <p><span className="font-medium">সম্পূর্ণ ঠিকানা:</span> {request.address}</p>
                        </div>
                           <div className='space-y-3'>
                            <h2 className="text-xl font-bold text-gray-700 flex items-center">
                                <Phone className='mr-2' size={20} /> যোগাযোগের তথ্য
                            </h2>
                            {/* যদি ডোনার অ্যাসাইন না হয়, তবে রিকোয়েস্টকারীর যোগাযোগের তথ্য সবার জন্য দেখা যাবে। */}
                            {/* তবে ইন-প্রগ্রেস বা ডোনার অ্যাসাইন হওয়ার পর ডোনারের তথ্য আলাদাভাবে দেখানোই শ্রেয় */}
                            <p><span className="font-medium flex items-center"><Mail className='mr-1' size={18} /> ইমেল (অনুরোধকারী):</span> <span className='text-blue-600'>{request.requesterEmail}</span></p>
                            <p><span className="font-medium">অনুরোধকারী:</span> {request.requesterName}</p>
                        </div>
                    </div>
                    
                    {/* ডোনারের তথ্য */}
                    <div className="border-b pb-6">
                        <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                            <User className='mr-2' size={20} /> ডোনারের তথ্য (Donor Details)
                        </h2>
                        {request.donorName ? (
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                <p><span className="font-bold">ডোনারের নাম:</span> {request.donorName}</p>
                                <p><span className="font-bold">ডোনারের ইমেল:</span> <span className='text-green-700'>{request.donorEmail}</span></p>
                                <p className='text-sm mt-2 text-green-800'>আপনার অনুরোধটি বর্তমানে **'In Progress'** এ আছে।</p>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                <p className='text-yellow-800 font-semibold'>এখনও কোনো ডোনার অ্যাসাইন করা হয়নি।</p>
                            </div>
                        )}
                    </div>
                    
                    {/* বার্তা */}
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-bold text-red-700">জরুরী বার্তা:</h3>
                        <p className="text-gray-700 mt-1">{request.requestMessage || "কোনো বিশেষ বার্তা দেওয়া হয়নি।"}</p>
                    </div>

                    {/* অ্যাকশন বাটন */}
                    {canVolunteer && user?.email && (
                        <div className="text-center pt-4">
                            <button onClick={handleVolunteer} className="btn bg-red-600 text-white text-lg hover:bg-red-700 px-10">
                                আমি রক্তদান করতে চাই (স্বেচ্ছাসেবক হোন)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonationRequestDetails;
// src/components/Dashboard/UpdateDonationRequest.jsx

import React, { useEffect } from 'react'; // useEffect যোগ করা হলো
import { useParams, useNavigate } from 'react-router-dom'; 
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure'; 
// 🔥🔥🔥 পরিবর্তন ১: districts ইউটিলিটি ফাইল থেকে ইমপোর্ট বাদ দেওয়া হলো 🔥🔥🔥
// import { bloodGroups, getDistricts, getUpazilasByDistrict } from '../../utils/districts'; 
import useDistrictsAndUpazilas from '../../hooks/useDistrictsAndUpazilas'; // 🔥🔥🔥 নতুন ইমপোর্ট 🔥🔥🔥

import toast from 'react-hot-toast';
import { Droplet, MapPin, Calendar, Clock, Hospital, User, Edit } from 'lucide-react';

// 🔥 ব্লাড গ্রুপ অ্যারে সরাসরি এখানে ডিফাইন করা হলো, যেহেতু districts.js ফাইলটি ডিলিট করা হয়েছে।
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];


const UpdateDonationRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm();
    
    // 🔥🔥🔥 পরিবর্তন ২: useDistrictsAndUpazilas হুক ব্যবহার করা হলো 🔥🔥🔥
    const {
        districts, 
        upazilas, 
        loading: geoDataLoading, // হুকের লোডিং স্টেট
        setSelectedDistrict 
    } = useDistrictsAndUpazilas();
    
    // ফর্ম থেকে নির্বাচিত জেলার নাম পর্যবেক্ষণ করা হচ্ছে
    const selectedDistrict = watch('recipientDistrict', ''); 

    // 🔥🔥🔥 পরিবর্তন ৩: জেলা পরিবর্তন হলে হুক আপডেট করা এবং উপজেলা রিসেট করা 🔥🔥🔥
    useEffect(() => {
        if (selectedDistrict) {
            setSelectedDistrict(selectedDistrict);
            // জেলা পরিবর্তন হলে উপজেলা রিসেট করা
            // setValue('recipientUpazila', ''); 
            // 💡 দ্রষ্টব্য: এখানে setValue রিসেট করলে ডেটা লোড হওয়ার সময়ও রিসেট হবে।
            // আমরা চাইব শুধু ইউজার যখন ম্যানুয়ালি ড্রপডাউন পরিবর্তন করবে, তখন যেন নতুন ডেটা আসে। 
            // initial load এর জন্য setValue('recipientUpazila', data.upazila) নিচে রাখা হয়েছে।
        }
    }, [selectedDistrict, setSelectedDistrict]);


    // ------------------------------------
    // ১. ডেটা ফেচ: বর্তমান অনুরোধের ডেটা লোড করা
    // ------------------------------------
    const { data: requestData, isLoading: isDataLoading } = useQuery({
        queryKey: ['donationRequest', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/api/v1/donation-requests/${id}`);
            return res.data;
        },
        enabled: !!id,
        onSuccess: (data) => {
            // ফর্মের মান সেট করা
            setValue('recipientName', data.recipientName);
            // setValue কল করার মাধ্যমে useDistrictsAndUpazilas এ selectedDistrict আপডেট হবে
            setValue('recipientDistrict', data.district); 
            setValue('recipientUpazila', data.upazila);
            setValue('bloodGroup', data.bloodGroup);
            setValue('hospitalName', data.hospitalName);
            setValue('fullAddress', data.fullAddress);
            
            // ডেট ফরমেট YYYY-MM-DD
            const donationDate = data.donationDate ? new Date(data.donationDate).toISOString().split('T')[0] : '';
            setValue('donationDate', donationDate);
            setValue('donationTime', data.donationTime);
            setValue('requestMessage', data.requestMessage); 
            
            if (data.numberOfUnits) {
                setValue('numberOfUnits', data.numberOfUnits);
            }
        }
    });

    // ------------------------------------
    // ২. ডেটা আপডেট: রিকোয়েস্ট আপডেট মিউটেশন
    // ------------------------------------
    const { mutate, isPending } = useMutation({
        mutationFn: async (updatedData) => {
            const res = await axiosSecure.patch(`/api/v1/donation-requests/${id}`, updatedData); 
            return res.data;
        },
        onSuccess: () => {
            toast.success('রক্তদানের অনুরোধ সফলভাবে আপডেট হয়েছে!');
            queryClient.invalidateQueries(['myDonationRequests']); 
            queryClient.invalidateQueries(['donationRequest', id]); 
            navigate('/dashboard/my-donation-requests');
        },
        onError: (error) => {
            console.error("Donation Request update error:", error); 
            
            let errorMessage = 'অনুরোধ আপডেটে ব্যর্থ হয়েছে।';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data.error || 'ভ্যালিডেশন ব্যর্থ হয়েছে।';
                toast.error(`এরর: ${errorMessage}`);
                return; 
            }
            toast.error(errorMessage);
        },
    });

    // ------------------------------------
    // ৩. সাবমিট হ্যান্ডেলার (FINAL FIX)
    // ------------------------------------
    const onSubmit = (data) => {
        
        const updatedRequest = {
            recipientName: data.recipientName,
            bloodGroup: data.bloodGroup,
            donationDate: data.donationDate,
            donationTime: data.donationTime,
            hospitalName: data.hospitalName,
            fullAddress: data.fullAddress,
            // recipientDistrict, recipientUpazila থেকে পরিবর্তন করা হলো
            district: data.recipientDistrict, 
            upazila: data.recipientUpazila, 
            
            // সংখ্যা ফরম্যাটে পাঠানো
            numberOfUnits: requestData?.numberOfUnits ? parseInt(requestData.numberOfUnits) : 1, 
            
            // 🔥🔥🔥 গুরুত্বপূর্ণ: পূর্বের স্ট্যাটাস এবং ডোনারের তথ্য ফেরত পাঠানো হলো 🔥🔥🔥
            donationStatus: requestData?.donationStatus,
            donorName: requestData?.donorName || null,
            donorEmail: requestData?.donorEmail || null,
        };

        // requestMessage হ্যান্ডেলিং
        if (data.requestMessage && data.requestMessage.trim() !== '') {
            updatedRequest.requestMessage = data.requestMessage.trim();
        } else {
            // যদি ফিল্ড ফাঁকা থাকে কিন্তু DB তে মান থাকে, তাহলে সেটি রাখুন
            if (requestData?.requestMessage) {
                updatedRequest.requestMessage = requestData.requestMessage;
            }
        }
        
        console.log("Sending PATCH data with previous status:", updatedRequest); 

        mutate(updatedRequest); 
    };


    if (isDataLoading || geoDataLoading) { // 🔥 geoDataLoading যোগ করা হলো
        return <div className="text-center p-10 min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span><p className='text-red-600 ml-2'>ডেটা লোড হচ্ছে...</p></div>;
    }

    if (!requestData || !requestData._id) {
        return (
            <div className="text-center p-10 min-h-screen">
                <h2 className="text-2xl font-bold text-gray-700">অনুরোধ খুঁজে পাওয়া যায়নি</h2>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-red-600 mb-6 flex items-center"><Edit className='mr-2' size={24}/> অনুরোধ আপডেট করুন</h2>
            <p className="text-gray-600 mb-6">অনুগ্রহ করে শুধুমাত্র প্রয়োজনীয় তথ্য পরিবর্তন করুন।</p>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ১. রোগীর নাম */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><User size={16} className="mr-2"/> রোগীর নাম</span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full"
                            {...register('recipientName', { required: 'রোগীর নাম আবশ্যক' })}
                        />
                        {errors.recipientName && <p className="text-red-500 text-xs mt-1">{errors.recipientName.message}</p>}
                    </div>

                    {/* ২. ব্লাড গ্রুপ */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><Droplet size={16} className="mr-2"/> প্রয়োজনীয় ব্লাড গ্রুপ</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            {...register('bloodGroup', { required: 'ব্লাড গ্রুপ আবশ্যক' })}
                        >
                            <option value="">নির্বাচন করুন</option>
                            {/* 🔥 সরাসরি ব্যবহার করা হলো */}
                            {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
                        </select>
                        {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup.message}</p>}
                    </div>

                    {/* ৩. জেলা */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><MapPin size={16} className="mr-2"/> জেলা</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            {...register('recipientDistrict', { required: 'জেলা আবশ্যক' })}
                        >
                            <option value="">নির্বাচন করুন</option>
                            {/* 🔥 districts হুক থেকে আসছে */}
                            {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                        {errors.recipientDistrict && <p className="text-red-500 text-xs mt-1">{errors.recipientDistrict.message}</p>}
                    </div>

                    {/* ৪. উপ-জেলা */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><MapPin size={16} className="mr-2"/> উপ-জেলা</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            {...register('recipientUpazila', { required: 'উপ-জেলা আবশ্যক' })}
                            // 🔥 জেলা নির্বাচন না হলে বা উপজেলা না থাকলে ড্রপডাউন নিষ্ক্রিয় থাকবে
                            disabled={!selectedDistrict || upazilas.length === 0}
                        >
                            <option value="">নির্বাচন করুন</option>
                            {/* 🔥 upazilas হুক থেকে আসছে */}
                            {upazilas.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        {errors.recipientUpazila && <p className="text-red-500 text-xs mt-1">{errors.recipientUpazila.message}</p>}
                    </div>

                    {/* ৫. হাসপাতালের নাম */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><Hospital size={16} className="mr-2"/> হাসপাতাল / ক্লিনিকের নাম</span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full"
                            {...register('hospitalName', { required: 'হাসপাতালের নাম আবশ্যক' })}
                        />
                        {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName.message}</p>}
                    </div>

                    {/* ৬. পুরো ঠিকানা */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><MapPin size={16} className="mr-2"/> বিস্তারিত ঠিকানা</span>
                        </label>
                        <input 
                            type="text" 
                            className="input input-bordered w-full"
                            {...register('fullAddress', { required: 'বিস্তারিত ঠিকানা আবশ্যক' })}
                        />
                        {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress.message}</p>}
                    </div>

                    {/* ৭. প্রয়োজনীয় তারিখ */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><Calendar size={16} className="mr-2"/> প্রয়োজনীয় তারিখ</span>
                        </label>
                        <input 
                            type="date" 
                            className="input input-bordered w-full"
                            {...register('donationDate', { required: 'তারিখ আবশ্যক' })}
                        />
                        {errors.donationDate && <p className="text-red-500 text-xs mt-1">{errors.donationDate.message}</p>}
                    </div>

                    {/* ৮. প্রয়োজনীয় সময় */}
                    <div>
                        <label className="label">
                            <span className="label-text flex items-center"><Clock size={16} className="mr-2"/> প্রয়োজনীয় সময়</span>
                        </label>
                        <input 
                            type="time" 
                            className="input input-bordered w-full"
                            {...register('donationTime', { required: 'সময় আবশ্যক' })}
                        />
                        {errors.donationTime && <p className="text-red-500 text-xs mt-1">{errors.donationTime.message}</p>}
                    </div>
                </div>

                {/* ৯. কারণ/মন্তব্য */}
                <div className="mt-4">
                    <label className="label">
                        <span className="label-text flex items-center">অনুরোধ বার্তা (ঐচ্ছিক)</span>
                    </label>
                    <textarea 
                        className="textarea textarea-bordered h-24 w-full"
                        {...register('requestMessage')}
                    ></textarea>
                </div>

                {/* সাবমিট বাটন */}
                <div className="mt-8">
                    <button type="submit" className="btn bg-red-600 text-white hover:bg-red-700 w-full" disabled={isPending}>
                        {isPending ? <span className="loading loading-spinner"></span> : <Edit size={20} className="mr-2"/>}
                        আপডেট করুন
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateDonationRequest;
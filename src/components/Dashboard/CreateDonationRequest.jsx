import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ShieldOff } from 'lucide-react'; // নতুন আইকন
// --- প্রয়োজনীয় হুকস ও ইউটিলিটি ---
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { getCurrentDateTime } from '../../utils/dateTimeHelpers';
// --- ডেটা হুক ---
import useDistrictsAndUpazilas from '../../hooks/useDistrictsAndUpazilas'; 

// --- ডেটা ---
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
// -----------------------------------------------------

const CreateDonationRequest = () => {
    const { user } = useAuth(); 
    const axiosSecure = useAxiosSecure(); 
    const navigate = useNavigate(); 

    // প্রোফাইল ডেটা লোড করার জন্য স্টেট
    const [requesterProfile, setRequesterProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // নতুন জিওগ্রাফিক্যাল ডেটা হুক ব্যবহার:
    const { 
        districts, 
        upazilas, 
        loading: loadingGeo, 
        setSelectedDistrict 
    } = useDistrictsAndUpazilas();

    // বর্তমান তারিখ ও সময় ডিফল্ট ভ্যালু হিসেবে নেওয়া
    const { currentDate, currentTime } = getCurrentDateTime();
    
    const { 
        register, 
        handleSubmit, 
        reset, 
        watch, 
        setValue, 
        formState: { errors } 
    } = useForm({
        defaultValues: {
            donationDate: currentDate, 
            donationTime: currentTime, 
        }
    });

    const watchedDistrictName = watch('recipientDistrict');
    
    // ১. অনুরোধকারীর প্রোফাইল ডেটা লোড করা (রোল চেক করার জন্য)
    useEffect(() => {
        // user?.email না থাকলে, প্রোফাইল লোড করার দরকার নেই, শুধু লোডিং অফ করুন
        if (!user?.email) {
            setLoadingProfile(false);
            return;
        }
        
        // প্রোফাইল লোড করুন
        axiosSecure.get(`/api/v1/users/${user.email}`)
            .then(res => {
                setRequesterProfile(res.data);
                setLoadingProfile(false);
            })
            .catch(error => {
                console.error("Error loading requester profile:", error);
                setLoadingProfile(false);
            });
    }, [user, axiosSecure]);


    // ২. নির্বাচিত জেলার নাম পরিবর্তন হলে হুকের setSelectedDistrict আপডেট করা
    useEffect(() => {
        if (watchedDistrictName) {
            setSelectedDistrict(watchedDistrictName);
            setValue('recipientUpazila', '');
        } else {
            setSelectedDistrict(null);
        }
    }, [watchedDistrictName, setSelectedDistrict, setValue]);


    // ৩. ফর্ম সাবমিট হ্যান্ডেলার
    const onSubmit = async (data) => {
        const donationRequest = {
            ...data,
            requesterName: requesterProfile?.name || user?.displayName || 'Unknown',
            requesterEmail: user?.email,
            requestStatus: 'pending',
            createdAt: new Date().toISOString(),
        };

        // নিরাপত্তা নিশ্চিত করার জন্য: ক্লায়েন্ট সাইডেও ডবল চেক
        if (requesterProfile?.role === 'donor') {
            Swal.fire({
                title: "অনুমতি নেই!",
                text: "ডোনার রোলের ইউজাররা রক্তদানের অনুরোধ তৈরি করতে পারে না।",
                icon: "warning"
            });
            return;
        }

        try {
            // ত্রুটিমুক্ত POST রিকোয়েস্ট
            const res = await axiosSecure.post('/api/v1/donation-requests', donationRequest); 

            if (res.data.insertedId) {
                Swal.fire({
                    title: "সফল!",
                    text: "রক্তদানের অনুরোধ সফলভাবে তৈরি করা হয়েছে।",
                    icon: "success"
                });
                reset(); 
                navigate('/dashboard/my-donation-requests'); 
            }
        } catch (error) {
            console.error("Donation Request creation error:", error);
            Swal.fire({
                title: "এরর!",
                text: error.response?.data?.message || "অনুরোধ তৈরি ব্যর্থ হয়েছে।",
                icon: "error"
            });
        }
    };

    if (loadingProfile || loadingGeo) {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }
    
    // 🔥 অ্যাক্সেস গার্ড (নতুন সংযোজন)
    if (requesterProfile?.role === 'donor') {
        return (
            <div className="p-10 min-h-[50vh] flex flex-col items-center justify-center bg-red-50 rounded-xl shadow-lg border border-red-300">
                <ShieldOff className='text-red-600 mb-4' size={60} />
                <h1 className="text-3xl font-extrabold text-red-600">🛑 অ্যাক্সেস নেই (অনুমতি অস্বীকার)!</h1>
                <p className="mt-4 text-gray-700 text-center max-w-lg">
                    আপনার বর্তমান রোল **"ডোনার"**। শুধুমাত্র **ভলান্টিয়ার** এবং **অ্যাডমিন** রোলের ইউজাররাই রক্তদানের অনুরোধ তৈরি করতে পারে।
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    ডোনার হিসাবে আপনি রক্ত ​​দান করতে পারবেন, কিন্তু অন্য কারো জন্য অনুরোধ তৈরি করতে পারবেন না।
                </p>
            </div>
        );
    }
    // 🔥 অ্যাক্সেস গার্ড শেষ
    
    // যদি রোল 'volunteer' বা 'admin' হয় তবে ফর্ম রেন্ডার হবে
    return (
        <div className="p-6 md:p-10 rounded-xl shadow-2xl bg-white max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-red-600 mb-8">নতুন রক্তদানের অনুরোধ তৈরি করুন</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* রিকোয়েস্টকারীর তথ্য (Non-Editable) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">অনুরোধকারীর নাম</span></label>
                        <input type="text" value={requesterProfile?.name || user?.displayName || 'Unknown'} disabled className="input input-bordered bg-gray-200" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">অনুরোধকারীর ইমেল</span></label>
                        <input type="email" value={user?.email || ''} disabled className="input input-bordered bg-gray-200" />
                    </div>
                </div>

                {/* রোগীর তথ্য */}
                <h2 className="text-xl font-semibold mt-6 border-b pb-2 text-gray-700">রোগীর প্রয়োজনীয় তথ্য</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* রোগীর নাম */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">রোগীর নাম *</span></label>
                        <input type="text" placeholder="রোগীর পুরো নাম" className="input input-bordered" {...register("recipientName", { required: true })} />
                        {errors.recipientName && <span className="text-red-500 text-sm">রোগীর নাম প্রয়োজন।</span>}
                    </div>
                    {/* রোগীর ইমেল */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">যোগাযোগের ইমেল *</span></label>
                        <input type="email" placeholder="যোগাযোগের ইমেল" className="input input-bordered" {...register("recipientEmail", { required: true })} />
                        {errors.recipientEmail && <span className="text-red-500 text-sm">ইমেল প্রয়োজন।</span>}
                    </div>
                    {/* প্রয়োজনীয় ব্লাড গ্রুপ */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">প্রয়োজনীয় ব্লাড গ্রুপ *</span></label>
                        <select className="select select-bordered" {...register("bloodGroup", { required: true })}>
                            <option value="">ব্লাড গ্রুপ নির্বাচন করুন</option>
                            {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
                        </select>
                        {errors.bloodGroup && <span className="text-red-500 text-sm">ব্লাড গ্রুপ প্রয়োজন।</span>}
                    </div>
                </div>

                {/* অবস্থান */}
                <h2 className="text-xl font-semibold mt-6 border-b pb-2 text-gray-700">অবস্থান</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* জেলা */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">জেলা *</span></label>
                        <select className="select select-bordered" {...register("recipientDistrict", { required: true })}>
                            <option value="">জেলা নির্বাচন করুন</option>
                            {/* অবজেক্ট ম্যাপ: value/label হিসেবে name ব্যবহার */}
                            {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                        {errors.recipientDistrict && <span className="text-red-500 text-sm">জেলা প্রয়োজন।</span>}
                    </div>
                    {/* উপজেলা */}
                    <div className="form-control">
                        <label className="label"><span className="label-text">উপজেলা *</span></label>
                        <select
                            className="select select-bordered"
                            disabled={!watchedDistrictName} 
                            {...register("recipientUpazila", { required: true })}
                        >
                            <option value="">উপজেলা নির্বাচন করুন</option>
                            {/* অবজেক্ট ম্যাপ: value/label হিসেবে name ব্যবহার */}
                            {upazilas.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        {errors.recipientUpazila && <span className="text-red-500 text-sm">উপজেলা প্রয়োজন।</span>}
                    </div>
                </div>

                {/* হাসপাতাল ও ঠিকানা */}
                <h2 className="text-xl font-semibold mt-6 border-b pb-2 text-gray-700">স্থান ও তারিখ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                        <label className="label"><span className="label-text">হাসপাতালের নাম *</span></label>
                        <input type="text" placeholder="হাসপাতাল বা ক্লিনিকের নাম" className="input input-bordered" {...register("hospitalName", { required: true })} />
                        {errors.hospitalName && <span className="text-red-500 text-sm">হাসপাতালের নাম প্রয়োজন।</span>}
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">হাসপাতালের সম্পূর্ণ ঠিকানা *</span></label>
                        <input type="text" placeholder="বিস্তারিত ঠিকানা" className="input input-bordered" {...register("address", { required: true })} />
                        {errors.address && <span className="text-red-500 text-sm">ঠিকানা প্রয়োজন।</span>}
                    </div>
                </div>

                {/* তারিখ ও সময় */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                        <label className="label"><span className="label-text">রক্তদানের তারিখ *</span></label>
                        <input type="date" className="input input-bordered"
                            min={currentDate} 
                            {...register("donationDate", { required: true })} />
                        {errors.donationDate && <span className="text-red-500 text-sm">তারিখ প্রয়োজন।</span>}
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">রক্তদানের সময় *</span></label>
                        <input type="time" className="input input-bordered" {...register("donationTime", { required: true })} />
                        {errors.donationTime && <span className="text-red-500 text-sm">সময় প্রয়োজন।</span>}
                    </div>
                </div>

                {/* মেসেজ */}
                <div className="form-control">
                    <label className="label"><span className="label-text">জরুরী বার্তা (ঐচ্ছিক)</span></label>
                    <textarea className="textarea textarea-bordered h-24" placeholder="বিশেষ কোনো বার্তা বা নির্দেশনা" {...register("requestMessage")}></textarea>
                </div>

                {/* সাবমিট বাটন */}
                <div className="form-control mt-8">
                    <button type="submit" className="btn bg-red-600 text-white text-lg hover:bg-red-700">অনুরোধ জমা দিন</button>
                </div>
            </form>
        </div>
    );
};

export default CreateDonationRequest;
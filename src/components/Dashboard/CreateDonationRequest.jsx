import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ShieldOff, User, MapPin, Hospital, Calendar, MessageSquare, Send } from 'lucide-react'; 
// --- প্রয়োজনীয় হুকস ও ইউটিলিটি ---
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { getCurrentDateTime } from '../../utils/dateTimeHelpers';
// --- ডেটা হুক ---
import useDistrictsAndUpazilas from '../../hooks/useDistrictsAndUpazilas'; 

// --- ডেটা ---
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateDonationRequest = () => {
    const { user } = useAuth(); 
    const axiosSecure = useAxiosSecure(); 
    const navigate = useNavigate(); 

    const [requesterProfile, setRequesterProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const { 
        districts, 
        upazilas, 
        loading: loadingGeo, 
        setSelectedDistrict 
    } = useDistrictsAndUpazilas();

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
    
    useEffect(() => {
        if (!user?.email) {
            setLoadingProfile(false);
            return;
        }
        
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

    useEffect(() => {
        if (watchedDistrictName) {
            setSelectedDistrict(watchedDistrictName);
            setValue('recipientUpazila', '');
        } else {
            setSelectedDistrict(null);
        }
    }, [watchedDistrictName, setSelectedDistrict, setValue]);

    const onSubmit = async (data) => {
        const donationRequest = {
            ...data,
            requesterName: requesterProfile?.name || user?.displayName || 'Unknown',
            requesterEmail: user?.email,
            requestStatus: 'pending',
            createdAt: new Date().toISOString(),
        };

        if (requesterProfile?.role === 'donor') {
            Swal.fire({
                title: "অনুমতি নেই!",
                text: "ডোনার রোলের ইউজাররা রক্তদানের অনুরোধ তৈরি করতে পারে না।",
                icon: "warning"
            });
            return;
        }

        try {
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
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
                <p className="mt-4 text-gray-500 animate-pulse">তথ্য লোড হচ্ছে...</p>
            </div>
        );
    }
    
    if (requesterProfile?.role === 'donor') {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-10 flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-red-100 text-center">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                    <ShieldOff className='text-red-500' size={80} />
                </div>
                <h1 className="text-3xl font-black text-gray-800">অ্যাক্সেস সংরক্ষিত</h1>
                <p className="mt-4 text-gray-600 leading-relaxed text-lg">
                    দুঃখিত, আপনার রোল <span className="font-bold text-red-600 italic">"ডোনার"</span> হওয়ায় আপনি সরাসরি অনুরোধ তৈরি করতে পারছেন না। 
                </p>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 border border-dashed border-gray-300">
                   অনুরোধ তৈরি করতে হলে আপনার একাউন্টটি ভলান্টিয়ার বা অ্যাডমিন রোলে থাকতে হবে।
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* হেডার সেকশন */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black text-gray-800 mb-3">নতুন রক্তদানের অনুরোধ</h1>
                <p className="text-gray-500">নিচের ফর্মে সঠিক তথ্য প্রদান করে দ্রুত রক্তের ব্যবস্থা করুন।</p>
                <div className="w-24 h-1.5 bg-red-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* কার্ড ১: অনুরোধকারীর প্রোফাইল (ReadOnly) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <User size={20} className="text-red-600" />
                        <h2 className="font-bold text-gray-700">অনুরোধকারীর তথ্য (স্থায়ী)</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">আপনার নাম</label>
                            <input type="text" value={requesterProfile?.name || user?.displayName || 'Unknown'} disabled className="w-full bg-gray-50 border-gray-200 text-gray-600 rounded-lg px-4 py-3 cursor-not-allowed font-medium" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">আপনার ইমেল</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full bg-gray-50 border-gray-200 text-gray-600 rounded-lg px-4 py-3 cursor-not-allowed font-medium" />
                        </div>
                    </div>
                </div>

                {/* কার্ড ২: রোগীর তথ্য ও অবস্থান */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* রোগীর বেসিক ইনফো */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600"><User size={20}/></div>
                            <h2 className="text-xl font-bold text-gray-800">রোগীর তথ্য</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">রোগীর নাম *</label>
                                <input type="text" placeholder="পুরো নাম লিখুন" className={`input input-bordered w-full focus:ring-2 focus:ring-red-500 ${errors.recipientName ? 'border-red-500' : ''}`} {...register("recipientName", { required: true })} />
                                {errors.recipientName && <span className="text-red-500 text-xs mt-1 italic">নাম আবশ্যক</span>}
                            </div>
                            
                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">যোগাযোগের ইমেল *</label>
                                <input type="email" placeholder="ইমেল ঠিকানা" className={`input input-bordered w-full ${errors.recipientEmail ? 'border-red-500' : ''}`} {...register("recipientEmail", { required: true })} />
                                {errors.recipientEmail && <span className="text-red-500 text-xs mt-1 italic">ইমেল আবশ্যক</span>}
                            </div>

                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">ব্লাড গ্রুপ *</label>
                                <select className={`select select-bordered w-full ${errors.bloodGroup ? 'border-red-500' : ''}`} {...register("bloodGroup", { required: true })}>
                                    <option value="">নির্বাচন করুন</option>
                                    {bloodGroups.map(group => <option key={group} value={group}>{group}</option>)}
                                </select>
                                {errors.bloodGroup && <span className="text-red-500 text-xs mt-1 italic">ব্লাড গ্রুপ আবশ্যক</span>}
                            </div>
                        </div>
                    </div>

                    {/* ঠিকানা ও হাসপাতাল */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><MapPin size={20}/></div>
                            <h2 className="text-xl font-bold text-gray-800">ঠিকানা ও অবস্থান</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">জেলা *</label>
                                <select className="select select-bordered w-full" {...register("recipientDistrict", { required: true })}>
                                    <option value="">জেলা</option>
                                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">উপজেলা *</label>
                                <select className="select select-bordered w-full" disabled={!watchedDistrictName} {...register("recipientUpazila", { required: true })}>
                                    <option value="">উপজেলা</option>
                                    {upazilas.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label-text font-semibold mb-2 block leading-none flex items-center gap-1"><Hospital size={16}/> হাসপাতালের নাম *</label>
                            <input type="text" placeholder="হাসপাতালের নাম" className="input input-bordered w-full" {...register("hospitalName", { required: true })} />
                        </div>

                        <div className="form-control">
                            <label className="label-text font-semibold mb-2 block">হাসপাতালের পূর্ণ ঠিকানা *</label>
                            <input type="text" placeholder="রোড, বাড়ি বা এরিয়া নং" className="input input-bordered w-full" {...register("address", { required: true })} />
                        </div>
                    </div>
                </div>

                {/* কার্ড ৩: তারিখ ও সময় এবং বার্তা */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Calendar size={20}/></div>
                                <h2 className="text-xl font-bold text-gray-800">সময়সূচী</h2>
                            </div>
                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">তারিখ *</label>
                                <input type="date" min={currentDate} className="input input-bordered w-full" {...register("donationDate", { required: true })} />
                            </div>
                            <div className="form-control">
                                <label className="label-text font-semibold mb-2 block">সময় *</label>
                                <input type="time" className="input input-bordered w-full" {...register("donationTime", { required: true })} />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><MessageSquare size={20}/></div>
                                <h2 className="text-xl font-bold text-gray-800">জরুরী বার্তা (ঐচ্ছিক)</h2>
                            </div>
                            <textarea className="textarea textarea-bordered w-full h-[125px] focus:ring-2 focus:ring-purple-200" placeholder="রোগীর শারীরিক অবস্থা বা রক্তের জরুরি প্রয়োজনে কোনো নির্দেশনা থাকলে লিখুন..." {...register("requestMessage")}></textarea>
                        </div>
                    </div>
                </div>

                {/* সাবমিট বাটন */}
                <div className="flex justify-center pt-4">
                    <button type="submit" className="group btn bg-red-600 border-none text-white px-12 h-14 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-105 transition-all duration-300">
                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        অনুরোধ জমা দিন
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateDonationRequest;
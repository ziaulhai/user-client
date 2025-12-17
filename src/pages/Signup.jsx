import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';
import localforage from 'localforage';

// কাস্টম হুক ইমপোর্ট করা হলো
import useAuth from '../hooks/useAuth';
import useAxiosPublic from '../hooks/useAxiosPublic';
import useDistrictsAndUpazilas from '../hooks/useDistrictsAndUpazilas';

// 🔥 ImgBB API Key এবং URL
// নিশ্চিত করুন .env ফাইলে VITE_IMGBB_API_KEY সেট করা আছে
const ImgBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 
const ImgBB_URL = `https://api.imgbb.com/1/upload?key=${ImgBB_API_KEY}`;


const Signup = () => {
    const { createUser, updateUserProfile, reloadUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    // 🔥 নতুন স্টেট যোগ করা হলো: রেজিস্ট্রেশনের জন্য লোডিং
    const [isRegistering, setIsRegistering] = useState(false);

    // react-hook-form সেটআপ
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();

    // ইমেজ ফাইল এবং আপলোড লোডিং ম্যানেজমেন্টের জন্য স্টেট
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // 🔥 জেলা ও উপজেলার ডেটা লোড করার জন্য কাস্টম হুক ব্যবহার
    const {
        districts, // জেলা তালিকা
        upazilas, // নির্বাচিত জেলার উপজেলা তালিকা
        loading: dataLoading, // লোডিং স্টেট
        setSelectedDistrict // জেলা পরিবর্তনের ফাংশন
    } = useDistrictsAndUpazilas();

    // ফর্ম থেকে নির্বাচিত জেলার নাম পর্যবেক্ষণ করা
    const selectedDistrictName = watch('district');

    // 🔥 জেলা পরিবর্তন হলে, কাস্টম হুকে ডেটা আপডেট এবং উপজেলা রিসেট 
    useEffect(() => {
        if (selectedDistrictName) {
            setSelectedDistrict(selectedDistrictName);
            // জেলা পরিবর্তন হলে, উপজেলা ভ্যালু রিসেট করা
            setValue('upazila', '');
        }
    }, [selectedDistrictName, setSelectedDistrict, setValue]);

    // --- ImgBB তে ইমেজ আপলোড ফাংশন ---
    const uploadImageToImgBB = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const imgbbResponse = await fetch(ImgBB_URL, {
                method: 'POST',
                body: formData,
            });

            if (!imgbbResponse.ok) {
                throw new Error("ImgBB আপলোড ব্যর্থ হয়েছে");
            }

            const imgbbData = await imgbbResponse.json();

            if (imgbbData.success) {
                setIsUploading(false);
                return imgbbData.data.url;
            } else {
                throw new Error(imgbbData.error?.message || "ইমেজ আপলোডে ব্যর্থতা।");
            }

        } catch (error) {
            console.error("ImgBB upload error:", error);
            setIsUploading(false);
            throw new Error(error.message || "ইমেজ আপলোডে ব্যর্থতা।");
        }
    };


    const onSubmit = async (data) => {
        // 🔥🔥🔥 পরিবর্তন ১: ডেটা অবজেক্টে `phoneNumber` যোগ করা হয়েছে 🔥🔥🔥
        const { name, email, password, bloodGroup, district, upazila, phoneNumber } = data;

        // রেজিস্ট্রেশন বা আপলোড চলছে কিনা, তা চেক করা
        if (isUploading || dataLoading || isRegistering) {
            toast.error("আপলোড প্রক্রিয়া চলছে, ডেটা লোড হচ্ছে অথবা রেজিস্ট্রেশন চলছে, অপেক্ষা করুন।");
            return;
        }

        let finalPhotoURL = "https://i.ibb.co.com/WNyfY5cS/profile-1.png"; // ডিফল্ট ছবি

        // 🔥🔥🔥 রেজিস্ট্রেশন প্রক্রিয়া শুরু: লোডিং চালু 🔥🔥🔥
        setIsRegistering(true);

        try {
            // ১. ছবি আপলোড (যদি নির্বাচিত থাকে)
            if (imageFile) {
                finalPhotoURL = await uploadImageToImgBB(imageFile);
            }

            // ২. Firebase User তৈরি করা
            await createUser(email, password);

            // ৩. User Profile আপডেট করা
            await updateUserProfile(name, finalPhotoURL);

            // 🔥 গুরুত্বপূর্ণ: ইউজার প্রোফাইল আপডেটের পর Auth স্টেট রিফ্রেশ করা
            await reloadUser();

            // ৪. MongoDB তে ইউজার ডেটা সেভ করা
            const userInfo = {
                name: name,
                email: email,
                avatar: finalPhotoURL,
                bloodGroup: bloodGroup,
                district: district,
                upazila: upazila,
                phoneNumber: phoneNumber, // 🔥🔥🔥 পরিবর্তন ২: MongoDB সেভিং ডেটাতে ফোন নম্বর যোগ করা হয়েছে 🔥🔥🔥
                role: 'donor',
                status: 'active',
                createdAt: new Date()
            };

            // সার্ভারে রেজিস্ট্রেশন রুট কল করা
            // এটি POST /api/v1/auth/register রুটে কল করছে
            const res = await axiosPublic.post('/api/v1/auth/register', userInfo); 

            // MongoDB তে ডেটা সফলভাবে ঢোকানো হয়েছে কিনা তা চেক করা
            if (res.data.insertedId || res.data.message === 'User successfully saved') { 
                
                // 🔥 JWT টোকেন সেভ করার লজিক (সাধারণত সার্ভারেই টোকেন তৈরি করে)
                // আপনার সার্ভার response এ যদি token পাঠায়
                if (res.data.token) {
                    await localforage.setItem('access-token', res.data.token);
                }

                // সফল নোটিফিকেশন
                toast.success('রেজিস্ট্রেশন সফল! এখন ড্যাশবোর্ডে প্রবেশ করুন।');
                reset();
                setImageFile(null);

                // রেজিস্ট্রেশন সফল হলে ড্যাশবোর্ডে পাঠানো হলো
                navigate('/dashboard');
            } else {
                // এটি ডেটাবেস সেভ না হওয়ার ক্ষেত্রে দেখাবে
                toast.error('ব্যবহারকারী তৈরি হয়েছে, কিন্তু ডেটাবেসে সেভ করা যায়নি।');
            }

        } catch (error) {
            console.error("Registration Error (Final Check):", error); // ডিবাগিং এর জন্য লগ দেখা হবে

            let errorMessage = 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।';

            // 🔥 চূড়ান্ত ফিক্স: Firebase এরর হ্যান্ডেলিং
            if (error.code && error.code === 'auth/email-already-in-use') {
                errorMessage = 'এই ইমেইলটি দিয়ে ইতিমধ্যে রেজিস্টার করা হয়েছে। অনুগ্রহ করে লগইন করুন।';
            } else if (error.code && error.code.startsWith('auth/')) {
                // অন্যান্য Firebase Auth এরর (যেমন: দুর্বল পাসওয়ার্ড, ভুল প্যারামিটার)
                errorMessage = `Auth Error: ${error.code.split('/')[1].replace(/-/g, ' ')}`;
            } else if (error.message && error.message.includes('ImgBB')) {
                // ছবি আপলোড এরর
                errorMessage = 'ছবি আপলোডে ব্যর্থতা। আবার চেষ্টা করুন।';
            } else if (error.message && error.message.includes('status code 404')) {
                // সার্ভার রুট মিসিং এরর (ব্যাকএন্ড /api/v1/auth/register রুট খুঁজে না পেলে)
                 errorMessage = 'সার্ভার রুটিং ত্রুটি। রেজিস্ট্রেশন রুট খুঁজে পাওয়া যায়নি (404)।';
            } else if (error.message && error.message.includes('status code 500')) {
                 errorMessage = 'সার্ভার ডেটাবেস ত্রুটি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
            }


            // টোস্ট মেসেজ দেখানো
            toast.error(errorMessage);
            // ইস-আপলোডিং শুধু এখানেই বন্ধ করা হয়েছে, যাতে ফাইনালি ব্লকটি ব্যবহার করা যায়।
            setIsUploading(false); 

        } finally {
            // লোডিং বন্ধ
            setIsRegistering(false);
        }
    };

    // পাসওয়ার্ড ভ্যালিডেশনের রুলস
    const passwordRules = {
        required: "পাসওয়ার্ড আবশ্যক।",
        minLength: {
            value: 6,
            message: "পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।"
        },
        pattern: {
            value: /(?=.*[A-Z])/,
            message: "অন্তত একটি বড় হাতের অক্ষর থাকতে হবে।"
        },
        validate: value =>
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value) || "অন্তত একটি বিশেষ অক্ষর থাকতে হবে।"
    };
    
    // 🔥🔥🔥 পরিবর্তন ৩: ফোন নম্বর ভ্যালিডেশনের রুলস (ঐচ্ছিক, আপনি প্রয়োজন অনুসারে কঠোর করতে পারেন) 🔥🔥🔥
    const phoneNumberRules = {
        required: "ফোন নম্বর আবশ্যক।",
        pattern: {
            // শুধুমাত্র সংখ্যা এবং ঐচ্ছিক +88 দিয়ে শুরু হতে পারে। (১১ বা ১৩ অক্ষরের জন্য)
            value: /^(?:\+88)?01[3-9]\d{8}$/, 
            message: "সঠিক বাংলাদেশী ফোন নম্বর ফরম্যাট (১১ ডিজিট) ব্যবহার করুন।"
        }
    };


    // যদি ডেটা লোড হয়, তাহলে লোডিং স্পিনার দেখান
    if (dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
                <p className='text-red-600 ml-2'>অবস্থানের ডেটা লোড হচ্ছে...</p>
            </div>
        );
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-red-600 mb-6">রেজিস্ট্রেশন করুন</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* নাম */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">নাম</label>
                        <input
                            type="text"
                            {...register("name", { required: "নাম আবশ্যক।" })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="আপনার পুরো নাম"
                        />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                    </div>

                    {/* ইমেইল */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">ইমেইল</label>
                        <input
                            type="email"
                            {...register("email", { required: "ইমেইল আবশ্যক।" })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="example@email.com"
                        />
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>

                    {/* ব্লাড গ্রুপ */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">ব্লাড গ্রুপ</label>
                        <select
                            {...register("bloodGroup", { required: "ব্লাড গ্রুপ আবশ্যক।" })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        >
                            <option value="">ব্লাড গ্রুপ নির্বাচন করুন</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                        {errors.bloodGroup && <span className="text-red-500 text-sm">{errors.bloodGroup.message}</span>}
                    </div>

                    {/* জেলা (District) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">জেলা</label>
                        <select
                            {...register("district", { required: "জেলা আবশ্যক।" })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        >
                            <option value="">জেলা নির্বাচন করুন</option>
                            {/* districts অ্যারে ব্যবহার করে তালিকা তৈরি */}
                            {districts.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                        {errors.district && <span className="text-red-500 text-sm">{errors.district.message}</span>}
                    </div>

                    {/* উপজেলা (Upazila) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">উপজেলা</label>
                        <select
                            {...register("upazila", { required: "উপজেলা আবশ্যক।" })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            // জেলা নির্বাচন না হলে বা উপজেলা না থাকলে ড্রপডাউন নিষ্ক্রিয় থাকবে
                            disabled={!selectedDistrictName || upazilas.length === 0}
                        >
                            <option value="">উপজেলা নির্বাচন করুন</option>
                            {/* upazilas অ্যারে ব্যবহার করে তালিকা তৈরি */}
                            {upazilas.map(u => (
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                        {errors.upazila && <span className="text-red-500 text-sm">{errors.upazila.message}</span>}
                    </div>
                    
                    {/* 🔥🔥🔥 পরিবর্তন ৪: ফোন নম্বর ইনপুট ফিল্ড যুক্ত করা হলো 🔥🔥🔥 */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">ফোন নম্বর</label>
                        <input
                            type="tel"
                            {...register("phoneNumber", phoneNumberRules)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="যেমন: 01xxxxxxxxx"
                        />
                        {errors.phoneNumber && <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>}
                    </div>

                    {/* 🔥 ফটো আপলোড ফিল্ড (Photo Upload Field) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">প্রোফাইল ছবি (ঐচ্ছিক, ১ মেগাবাইটের কম)</label>
                        <div className='flex items-center space-x-2'>
                            <input
                                type="file"
                                id="avatar-upload-file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading || isRegistering}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && file.size <= 1048576) { // 1 MB এর চেক
                                        setImageFile(file);
                                    } else if (file) {
                                        toast.error('অনুগ্রহ করে ১ মেগাবাইটের কম সাইজের ছবি নির্বাচন করুন।');
                                        setImageFile(null);
                                        e.target.value = null;
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('avatar-upload-file').click()}
                                disabled={isUploading || isRegistering}
                                className={`flex items-center justify-center px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 w-full ${isUploading || isRegistering ? 'bg-gray-200 text-gray-500' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300'}`}
                            >
                                <Upload size={18} className='mr-2' />
                                {imageFile ? imageFile.name : "ছবি নির্বাচন করুন"}
                            </button>
                        </div>
                        {imageFile && (
                            <p className='text-xs text-green-600 mt-1'>ছবি নির্বাচিত হয়েছে। রেজিস্ট্রেশন করার সময় ছবিটি আপলোড হবে।</p>
                        )}
                    </div>

                    {/* পাসওয়ার্ড */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">পাসওয়ার্ড</label>
                        <input
                            type="password"
                            {...register("password", passwordRules)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                        <p className="text-xs text-gray-500 mt-1">ন্যূনতম ৬ অক্ষর, একটি Capital Letter এবং একটি Special Character লাগবে।</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || dataLoading || isRegistering}
                        className={`w-full text-white py-2 rounded-lg font-bold transition duration-200 shadow-md flex items-center justify-center ${isUploading || dataLoading || isRegistering ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        {/* 🔥 লোডিং লজিক */}
                        {isUploading ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"></span> ছবি আপলোড হচ্ছে...
                            </>
                        ) : isRegistering ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"></span> রেজিস্ট্রেশন হচ্ছে...
                            </>
                        ) : (
                            'রেজিস্টার করুন'
                        )}

                    </button>
                </form>

                <p className="mt-4 text-sm text-center text-gray-600">
                    ইতিমধ্যে একটি অ্যাকাউন্ট আছে?
                    <Link to="/login" className="text-red-600 font-semibold hover:underline ml-1">লগইন করুন</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
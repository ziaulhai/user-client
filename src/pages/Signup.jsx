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
const ImgBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 
const ImgBB_URL = `https://api.imgbb.com/1/upload?key=${ImgBB_API_KEY}`;


const Signup = () => {
    const { createUser, updateUserProfile, reloadUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    // নতুন স্টেট যোগ করা হলো: রেজিস্ট্রেশনের জন্য লোডিং
    const [isRegistering, setIsRegistering] = useState(false);
    // ইমেইল চেক করার জন্য স্টেট
    const [emailError, setEmailError] = useState("");

    // react-hook-form সেটআপ
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();

    // ইমেজ ফাইল এবং আপলোড লোডিং ম্যানেজমেন্টের জন্য স্টেট
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // জেলা ও উপজেলার ডেটা লোড করার জন্য কাস্টম হুক ব্যবহার
    const {
        districts,
        upazilas,
        loading: dataLoading,
        setSelectedDistrict
    } = useDistrictsAndUpazilas();

    // ফর্ম থেকে নির্বাচিত ভ্যালু পর্যবেক্ষণ করা
    const selectedDistrictName = watch('district');
    const password = watch('password'); // কনফার্ম পাসওয়ার্ড চেক করার জন্য

    // জেলা পরিবর্তন হলে, উপজেলা ভ্যালু রিসেট করা
    useEffect(() => {
        if (selectedDistrictName) {
            setSelectedDistrict(selectedDistrictName);
            setValue('upazila', '');
        }
    }, [selectedDistrictName, setSelectedDistrict, setValue]);

    // --- 🔥 পরিবর্তন ১: ইমেইল তৎক্ষণাৎ চেক করার ফাংশন ---
    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (!email) return;

        try {
            // আপনার ব্যাকএন্ডে এই রুটটি থাকতে হবে যা চেক করবে ইমেইল আছে কি না
            const res = await axiosPublic.get(`/api/v1/users/check-email/${email}`);
            if (res.data.exists) {
                setEmailError("এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য ইমেইল দিন।");
            } else {
                setEmailError("");
            }
        } catch (error) {
            console.error("Email verification error:", error);
        }
    };

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
        const { name, email, password, bloodGroup, district, upazila, phoneNumber } = data;

        // যদি আগে থেকেই ইমেইল এরর থাকে তবে সাবমিট হবে না
        if (emailError) {
            toast.error(emailError);
            return;
        }

        if (isUploading || dataLoading || isRegistering) {
            toast.error("অনুগ্রহ করে অপেক্ষা করুন...");
            return;
        }

        let finalPhotoURL = "https://i.ibb.co.com/WNyfY5cS/profile-1.png"; 
        setIsRegistering(true);

        try {
            // ১. ছবি আপলোড
            if (imageFile) {
                finalPhotoURL = await uploadImageToImgBB(imageFile);
            }

            // ২. Firebase User তৈরি
            await createUser(email, password);

            // ৩. User Profile আপডেট
            await updateUserProfile(name, finalPhotoURL);
            await reloadUser();

            // ৪. MongoDB তে ইউজার ডেটা সেভ করা
            const userInfo = {
                name,
                email,
                avatar: finalPhotoURL,
                bloodGroup,
                district,
                upazila,
                phoneNumber,
                role: 'donor',
                status: 'active',
                createdAt: new Date()
            };

            const res = await axiosPublic.post('/api/v1/auth/register', userInfo); 

            if (res.data.insertedId || res.data.message === 'User successfully saved') { 
                if (res.data.token) {
                    await localforage.setItem('access-token', res.data.token);
                }

                toast.success('রেজিস্ট্রেশন সফল!');
                reset();
                setImageFile(null);
                navigate('/dashboard');
            } else {
                toast.error('ডেটাবেসে সেভ করা সম্ভব হয়নি।');
            }

        } catch (error) {
            console.error("Registration Error:", error);
            let errorMessage = 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।';
            }
            toast.error(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    // পাসওয়ার্ড ভ্যালিডেশনের রুলস
    const passwordRules = {
        required: "পাসওয়ার্ড আবশ্যক।",
        minLength: { value: 6, message: "পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।" },
        pattern: { value: /(?=.*[A-Z])/, message: "অন্তত একটি বড় হাতের অক্ষর থাকতে হবে।" },
        validate: value => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value) || "একটি বিশেষ অক্ষর থাকতে হবে।"
    };
    
    const phoneNumberRules = {
        required: "ফোন নম্বর আবশ্যক।",
        pattern: {
            value: /^(?:\+88)?01[3-9]\d{8}$/, 
            message: "সঠিক বাংলাদেশী ১১ ডিজিট নম্বর ব্যবহার করুন।"
        }
    };

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
                <p className='text-red-600 ml-2'>ডেটা লোড হচ্ছে...</p>
            </div>
        );
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-4xl bg-white p-6 md:p-10 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-red-600 mb-8">রেজিস্ট্রেশন করুন</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* --- 🔥 পরিবর্তন ২: ২-কলাম গ্রিড লেআউট --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        
                        {/* নাম */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">নাম</label>
                            <input
                                type="text"
                                {...register("name", { required: "নাম আবশ্যক।" })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
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
                                onBlur={handleEmailBlur}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${emailError ? 'border-red-500' : ''}`}
                                placeholder="example@email.com"
                            />
                            {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
                            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                        </div>

                        {/* ফোন নম্বর */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">ফোন নম্বর</label>
                            <input
                                type="tel"
                                {...register("phoneNumber", phoneNumberRules)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="01xxxxxxxxx"
                            />
                            {errors.phoneNumber && <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>}
                        </div>

                        {/* ব্লাড গ্রুপ */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">ব্লাড গ্রুপ</label>
                            <select
                                {...register("bloodGroup", { required: "ব্লাড গ্রুপ আবশ্যক।" })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="">নির্বাচন করুন</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                            {errors.bloodGroup && <span className="text-red-500 text-sm">{errors.bloodGroup.message}</span>}
                        </div>

                        {/* জেলা */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">জেলা</label>
                            <select
                                {...register("district", { required: "জেলা আবশ্যক।" })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="">জেলা নির্বাচন করুন</option>
                                {districts.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                            {errors.district && <span className="text-red-500 text-sm">{errors.district.message}</span>}
                        </div>

                        {/* উপজেলা */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">উপজেলা</label>
                            <select
                                {...register("upazila", { required: "উপজেলা আবশ্যক।" })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                                disabled={!selectedDistrictName || upazilas.length === 0}
                            >
                                <option value="">উপজেলা নির্বাচন করুন</option>
                                {upazilas.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            {errors.upazila && <span className="text-red-500 text-sm">{errors.upazila.message}</span>}
                        </div>

                        {/* পাসওয়ার্ড */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">পাসওয়ার্ড</label>
                            <input
                                type="password"
                                {...register("password", passwordRules)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                        </div>

                        {/* --- 🔥 পরিবর্তন ৩: কনফার্ম পাসওয়ার্ড ফিল্ড --- */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">কনফার্ম পাসওয়ার্ড</label>
                            <input
                                type="password"
                                {...register("confirmPassword", { 
                                    required: "পাসওয়ার্ডটি পুনরায় টাইপ করুন।",
                                    validate: (value) => value === password || "পাসওয়ার্ডটি মেলেনি।"
                                })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                        </div>

                    </div>

                    {/* ফটো আপলোড (নিচে আলাদা রাখা হয়েছে বড় দেখানোর জন্য) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">প্রোফাইল ছবি (১ মেগাবাইটের কম)</label>
                        <input
                            type="file"
                            id="avatar-upload-file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size <= 1048576) {
                                    setImageFile(file);
                                } else if (file) {
                                    toast.error('ছবি ১ মেগাবাইটের বড় হওয়া যাবে না।');
                                    e.target.value = null;
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload-file').click()}
                            disabled={isUploading || isRegistering}
                            className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 w-full transition"
                        >
                            <Upload size={18} className='mr-2 text-gray-500' />
                            {imageFile ? imageFile.name : "ছবি নির্বাচন করুন"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || dataLoading || isRegistering}
                        className={`w-full text-white py-3 rounded-lg font-bold transition duration-200 shadow-md ${isUploading || dataLoading || isRegistering ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isUploading ? "ছবি আপলোড হচ্ছে..." : isRegistering ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্টার করুন"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-center text-gray-600">
                    ইতিমধ্যে একটি অ্যাকাউন্ট আছে?
                    <Link to="/login" className="text-red-600 font-semibold hover:underline ml-1">লগইন করুন</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
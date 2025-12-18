import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, Scissors } from 'lucide-react'; 
import localforage from 'localforage';
import Cropper from 'react-easy-crop'; 

// কাস্টম হুক ইমপোর্ট
import useAuth from '../hooks/useAuth';
import useAxiosPublic from '../hooks/useAxiosPublic';
import useDistrictsAndUpazilas from '../hooks/useDistrictsAndUpazilas';

// ImgBB API
const ImgBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 
const ImgBB_URL = `https://api.imgbb.com/1/upload?key=${ImgBB_API_KEY}`;

const Signup = () => {
    const { createUser, updateUserProfile, reloadUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [imageError, setImageError] = useState(""); // নতুন স্টেট: ছবির এরর দেখানোর জন্য

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);

    // --- ক্রপার স্টেট ---
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const {
        districts,
        upazilas,
        loading: dataLoading,
        setSelectedDistrict
    } = useDistrictsAndUpazilas();

    const selectedDistrictName = watch('district');
    const password = watch('password'); 

    useEffect(() => {
        if (selectedDistrictName) {
            setSelectedDistrict(selectedDistrictName);
            setValue('upazila', '');
        }
    }, [selectedDistrictName, setSelectedDistrict, setValue]);

    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (!email) return;

        try {
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

    // --- ইমেজ ক্রপিং ফাংশন ---
    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImg = async () => {
        try {
            const image = new Image();
            image.src = tempImage;
            await new Promise((resolve) => (image.onload = resolve));

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
                    resolve({ file, url: URL.createObjectURL(blob) });
                }, 'image/jpeg');
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleCropSave = async () => {
        const { file, url } = await getCroppedImg();
        setImageFile(file);
        setImagePreview(url);
        setImageError(""); // ক্রপ সেভ হলে এরর ক্লিয়ার হবে
        setShowCropper(false);
    };

    const uploadImageToImgBB = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const imgbbResponse = await fetch(ImgBB_URL, {
                method: 'POST',
                body: formData,
            });

            if (!imgbbResponse.ok) throw new Error("ImgBB আপলোড ব্যর্থ হয়েছে");

            const imgbbData = await imgbbResponse.json();
            if (imgbbData.success) {
                setIsUploading(false);
                // 🔥 এখানে .display_url ব্যবহার করা হয়েছে সরাসরি ছবির লিঙ্কের জন্য
                return imgbbData.data.display_url;
            } else {
                throw new Error(imgbbData.error?.message || "ইমেজ আপলোডে ব্যর্থতা।");
            }
        } catch (error) {
            setIsUploading(false);
            throw new Error(error.message || "ইমেজ আপলোডে ব্যর্থতা।");
        }
    };

    const onSubmit = async (data) => {
        const { name, email, password, bloodGroup, district, upazila, phoneNumber } = data;

        // যদি সাবমিট করার সময়ও ছবি না থাকে
        if (!imageFile) {
            setImageError("অনুগ্রহ করে ১ মেগাবাইটের কম সাইজের একটি প্রোফাইল ছবি দিন।");
            return;
        }

        if (emailError) return;

        if (isUploading || dataLoading || isRegistering) return;

        setIsRegistering(true);

        try {
            const finalPhotoURL = await uploadImageToImgBB(imageFile);

            await createUser(email, password);
            await updateUserProfile(name, finalPhotoURL);
            await reloadUser();

            const userInfo = {
                name, 
                email, 
                // 🔥 ডোনার সার্চের সাথে মিল রাখার জন্য avatar-এর বদলে photoURL দেওয়া হয়েছে
                photoURL: finalPhotoURL, 
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
                if (res.data.token) await localforage.setItem('access-token', res.data.token);
                reset();
                setImageFile(null);
                setImagePreview(null);
                navigate('/dashboard');
            } else {
                setImageError("ডেটাবেসে সেভ করা সম্ভব হয়নি।");
            }
        } catch (error) {
            console.error(error);
            setImageError("রেজিস্ট্রেশন ব্যর্থ হয়েছে। ইমেইলটি ইতিমধ্যে ব্যবহার করা হতে পারে।");
        } finally {
            setIsRegistering(false);
        }
    };

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

    // --- সংশোধিত handleImageChange (ইনস্ট্যান্ট এরর চেক) ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileSizeInMB = file.size / (1024 * 1024);
            
            if (fileSizeInMB > 1) {
                // ছবি ১ এমবি-র বেশি হলে তাৎক্ষণিকভাবে এরর মেসেজ সেট হবে
                setImageError('দুঃখিত! ছবিটি ১ মেগাবাইটের বেশি। ছোট সাইজের ছবি দিন।');
                
                // স্টেট ক্লিয়ার করা যাতে আগের ছবি না থাকে
                e.target.value = null; 
                setImageFile(null);
                setImagePreview(null);
                return; 
            }

            // সাইজ ঠিক থাকলে এরর মুছে যাবে এবং ক্রপার আসবে
            setImageError(""); 
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setTempImage(reader.result);
                setShowCropper(true);
            };
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setTempImage(null);
        setImageError("");
        const inputElement = document.getElementById('avatar-upload-file');
        if (inputElement) inputElement.value = null;
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
                
                {/* --- Cropper Modal --- */}
                {showCropper && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                        <div className="bg-white w-full max-w-md rounded-lg overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">ছবিটি ক্রপ করুন (১:১)</h3>
                                <button onClick={() => setShowCropper(false)}><X size={20}/></button>
                            </div>
                            <div className="relative h-80 w-full bg-gray-200">
                                <Cropper
                                    image={tempImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1 / 1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>
                            <div className="p-4 bg-white flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowCropper(false)}
                                    className="flex-1 py-2 bg-gray-200 rounded font-semibold"
                                >বাতিল</button>
                                <button 
                                    type="button"
                                    onClick={handleCropSave}
                                    className="flex-1 py-2 bg-red-600 text-white rounded font-semibold"
                                >সেভ করুন</button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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

                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">কনফার্ম পাসওয়ার্ড</label>
                            <input
                                type="password"
                                {...register("confirmPassword", { 
                                    required: "পাসওয়ার্ডটি পুনরায় টাইপ করুন।",
                                    validate: (value) => value === password || "পাসওয়ার্ডটি মেলেনি।"
                                })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
                        </div>
                    </div>

                    {/* ফটো আপলোড সেকশন উইথ ইন-লাইন এরর */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-center sm:text-left">প্রোফাইল ছবি (১:১ রেশিও, ১ মেগাবাইটের কম)</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {imagePreview && (
                                <div className="relative w-28 h-28 flex-shrink-0">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover rounded-full border-4 border-red-100 shadow-lg" 
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-800 transition shadow-lg"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="w-full">
                                <input
                                    type="file"
                                    id="avatar-upload-file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('avatar-upload-file').click()}
                                    disabled={isUploading || isRegistering}
                                    className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg transition group w-full ${imageError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-500 hover:bg-red-50'}`}
                                >
                                    <Upload size={20} className={`mr-2 ${imageError ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`} />
                                    <span className={`font-medium ${imageError ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'}`}>
                                        {imageFile ? "অন্য ছবি পছন্দ করুন" : "ছবি নির্বাচন করুন"}
                                    </span>
                                </button>
                                {/* ইনপুট ফিল্ডের ঠিক নিচে এরর মেসেজ */}
                                {imageError && <p className="text-red-500 text-sm mt-2 font-semibold">{imageError}</p>}
                            </div>
                        </div>
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
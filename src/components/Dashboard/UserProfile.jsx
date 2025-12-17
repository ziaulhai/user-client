// src/components/Dashboard/UserProfile.jsx

import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure'; 
import { Edit, Save, Shield, Mail, MapPin, User, Droplet, Upload, X, Phone } from 'lucide-react'; 
import { useForm } from 'react-hook-form'; 
import Swal from 'sweetalert2'; 
import useDistrictsAndUpazilas from '../../hooks/useDistrictsAndUpazilas'; 

// ImgBB API Key আপনার .env ফাইল থেকে নেওয়া হয়েছে
const ImgBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 
const ImgBB_URL = `https://api.imgbb.com/1/upload?key=${ImgBB_API_KEY}`;


const UserProfile = () => {
    // 🔥🔥🔥 ফিক্স ১: useAuth থেকে updateUserProfile ফাংশনটি নিয়ে আসা হলো 🔥🔥🔥
    const { user, loading: authLoading, userRole, updateUser, updateUserProfile } = useAuth();
    const axiosSecure = useAxiosSecure();
    
    const { 
        districts, 
        upazilas, 
        loading: dataLoading, 
        setSelectedDistrict 
    } = useDistrictsAndUpazilas();
    
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // নতুন স্টেট: ইমেজ আপলোড ম্যানেজমেন্টের জন্য
    const [imageFile, setImageFile] = useState(null); 
    const [isUploading, setIsUploading] = useState(false); 
    
    // 🔥🔥 টপ বাটনের জন্য 'submit' করার জন্য `useForm` থেকে আলাদাভাবে `getValues` নেওয়া হয়েছে 🔥🔥
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm();
    const selectedDistrictName = watch('district'); 
    
    // --- প্রোফাইল ডেটা লোড করা (অপরিবর্তিত) ---
    useEffect(() => {
        if (user?.email) {
            const safeEmail = encodeURIComponent(user.email);
            axiosSecure.get(`/api/v1/users/${safeEmail}`)
                .then(res => {
                    setProfileData(res.data);
                    reset(res.data); 
                    
                    // ইনিশিয়াল জেলা সেট করা
                    if (res.data.district) {
                        setSelectedDistrict(res.data.district);
                    }
                    
                    // ইনিশিয়াল উপজেলা সেট করা
                    if (res.data.upazila) {
                        setValue('upazila', res.data.upazila);
                    }
                    
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Error loading user profile:", error);
                    setIsLoading(false);
                });
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, axiosSecure, reset, setSelectedDistrict, setValue]); 


    // জেলা পরিবর্তন হলে উপজেলা রিসেট ও হুক আপডেট (অপরিবর্তিত)
    useEffect(() => {
        if (selectedDistrictName) {
            setSelectedDistrict(selectedDistrictName);
            // জেলা পরিবর্তন হলে উপজেলা ফিল্ডটি রিসেট করে ফাঁকা করে দিন 
            if (profileData?.district !== selectedDistrictName) {
                setValue('upazila', '');
            }
        }
    }, [selectedDistrictName, setSelectedDistrict, setValue, profileData]);

    
    // --- ImgBB তে ইমেজ আপলোড ফাংশন (অপরিবর্তিত) ---
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
            setIsUploading(false);
            return imgbbData.data.url; // ImgBB থেকে প্রাপ্ত URL
            
        } catch (error) {
            console.error("ImgBB upload error:", error);
            setIsUploading(false);
            throw new Error("ইমেজ আপলোডে ব্যর্থতা।"); 
        }
    };


    // --- প্রোফাইল আপডেট হ্যান্ডেলার ---
    const onSubmit = async (data) => {
        if (!isEditing) return; 
        
        let photoURL = profileData.photoURL || user.photoURL; // বিদ্যমান URL
        
        try {
            // ১. যদি নতুন ইমেজ ফাইল সিলেক্ট করা হয়, তবে ImgBB তে আপলোড করুন
            if (imageFile) {
                photoURL = await uploadImageToImgBB(imageFile); 
            }

            // ২. সার্ভারে পাঠানোর জন্য ডেটা প্রস্তুত করুন
            const updatedData = {
                name: data.name,
                phoneNumber: data.phoneNumber.trim(), 
                bloodGroup: data.bloodGroup,
                district: data.district,
                upazila: data.upazila,
                lastDonationDate: data.lastDonationDate || null, 
                photoURL: photoURL, // নতুন বা পুরাতন URL
            };

            // ৩. সার্ভারে PATCH রিকোয়েস্ট পাঠান
            const safeEmail = encodeURIComponent(user.email); 
            const response = await axiosSecure.patch(
                `/api/v1/users/${safeEmail}`,
                updatedData
            );

            // ৪. সফল প্রতিক্রিয়া পরিচালনা করুন
            if (response.data.modifiedCount > 0 || response.data.acknowledged) {
                
                // 🔥🔥🔥 ফিক্স ২: Firebase প্রোফাইল আপডেট করা (রিলোডের পর ছবি ধরে রাখতে) 🔥🔥🔥
                // Firebase-এ নাম এবং ছবি সেভ করা হচ্ছে
                if (updateUserProfile) {
                    await updateUserProfile(updatedData.name, updatedData.photoURL);
                } 

                // গ্লোবাল Auth কনটেক্সট আপডেট করা (তাৎক্ষণিক UI রিরেন্ডারের জন্য)
                updateUser({ 
                    photoURL: updatedData.photoURL, 
                    displayName: updatedData.name, // Firebase-এর কনভেনশন অনুযায়ী
                });

                // অন্যান্য লোকাল আপডেট
                setProfileData(prev => ({ ...prev, ...updatedData }));
                setImageFile(null); // ইমেজ ফাইল রিসেট করুন
                
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!',
                    timer: 3000,
                    showConfirmButton: false
                });
                setIsEditing(false);
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'কোন পরিবর্তন নেই',
                    text: 'কোন পরিবর্তন সনাক্ত করা যায়নি।',
                    timer: 3000,
                    showConfirmButton: false
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Profile update error:", error);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: error.response?.data?.message || error.message || 'প্রোফাইল আপডেট করার সময় একটি সমস্যা হয়েছে।',
            });
        }
    };

    // --- টপ বাটন হ্যান্ডলার (Cancel / Save / Edit) (অপরিবর্তিত) ---
    const handleTopButtonClick = () => {
        if (isUploading) return; 

        if (isEditing) {
            handleSubmit(onSubmit)(); 
            
        } else {
            setIsEditing(true);
        }
    };
    
    // --- ক্যানসেল বাটন হ্যান্ডলার (যখন এডিটিং মোডে থাকে) (অপরিবর্তিত) ---
    const handleCancelClick = () => {
        // এডিটিং মোড বন্ধ
        setIsEditing(false);
        // ফর্ম ডেটা রিসেট
        reset(profileData);
        setSelectedDistrict(profileData.district || '');
        setImageFile(null); // ফাইল ইনপুট রিসেট
        Swal.fire({
             toast: true,
             position: 'top-end',
             icon: 'info',
             title: 'আপডেট বাতিল করা হয়েছে',
             showConfirmButton: false,
             timer: 2000
           });
    }

    // --- লোডিং কন্ডিশন (অপরিবর্তিত) ---
    if (authLoading || isLoading || dataLoading) { 
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (!profileData) {
        return <div className="text-center p-10 text-xl text-red-600">প্রোফাইল ডেটা লোড করা যায়নি।</div>;
    }
    
    // --- রেন্ডার অংশ (অপরিবর্তিত) ---
    return (
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-4xl mx-auto">
            
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                    <User size={30} className="text-red-600"/> আমার প্রোফাইল
                </h1>
                
                <div className='flex items-center space-x-2'> 
                    
                    {/* 🔥🔥 ক্যানসেল বাটন (শুধুমাত্র এডিটিং মোডে দৃশ্যমান) 🔥🔥 */}
                    {isEditing && (
                        <button
                            onClick={handleCancelClick}
                            className={`btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 ${isUploading ? 'btn-disabled' : ''}`}
                            disabled={isUploading}
                        >
                            <X size={18} /> <span className='hidden sm:inline'>বাতিল করুন</span>
                        </button>
                    )}
                    
                    {/* 🔥🔥 প্রধান সেভ/আপডেট বাটন (এখন এটিই সেভ করার কাজ করবে) 🔥🔥 */}
                    <button
                        onClick={handleTopButtonClick} 
                        className={`btn ${isEditing ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                        disabled={isUploading}
                        type={isEditing ? 'submit' : 'button'} // এডিটিং মোডে থাকলে সাবমিট হবে
                    >
                        {isUploading ? (
                            <>
                                <span className="loading loading-spinner"></span> <span className='hidden sm:inline'>আপলোড হচ্ছে...</span>
                            </>
                        ) : isEditing ? (
                            <>
                                <Save size={18} /> <span className='hidden sm:inline'>সেভ করুন</span>
                            </>
                        ) : (
                            <>
                                <Edit size={18} /> <span className='hidden sm:inline'>আপডেট করুন</span>
                            </>
                        )}
                    </button>
                    
                </div>
            </div>
            
            {/* প্রোফাইল ফর্ম */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}> 
                
                {/* অ্যাভাটার ও অন্যান্য বেসিক ইনফো */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    
                    {/* অ্যাভাটার ব্লক (ক্লিক ও হোভার ইফেক্ট সহ) */}
                    <div 
                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-200 flex-shrink-0 relative group cursor-pointer"
                        onClick={() => {
                            // শুধুমাত্র এডিটিং মোডে থাকলে ফাইল ইনপুট ট্রিগার হবে
                            if (isEditing) {
                                document.getElementById('file-input-avatar').click();
                            }
                        }}
                    >
                          {/* ছবি প্রিভিউ */}
                          <img 
            src={
                imageFile 
                ? URL.createObjectURL(imageFile) // ১. নতুন ফাইল সিলেক্টেড
                : (profileData?.photoURL || user?.photoURL || "https://i.ibb.co/6P2L1J5/default-avatar.png") // ২ ও ৩. বিদ্যমান বা ডিফল্ট ছবি
            } 
            alt="প্রোফাইল ছবি" 
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
        />
                        
                        {/* এডিটিং মোডে থাকলে ওভারলে */}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white text-center text-xs font-semibold flex flex-col items-center">
                                    <Upload size={20} />
                                    ছবি পরিবর্তন করুন
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-grow space-y-4 w-full">
                        
                        {/* হিডেন ফাইল ইনপুট */}
                        <input
                            type="file"
                            id="file-input-avatar" 
                            accept="image/*"
                            className="hidden" 
                            disabled={!isEditing || isUploading}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size <= 1048576) { // 1 MB এর চেক
                                    setImageFile(file);
                                } else if (file) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'ফাইল বড়',
                                        text: 'অনুগ্রহ করে ১ মেগাবাইটের কম সাইজের ছবি নির্বাচন করুন।',
                                    });
                                    setImageFile(null);
                                    e.target.value = null; // ফাইল ইনপুট রিসেট
                                }
                            }}
                        />
                        
                        {imageFile && isEditing && (
                            <div className='bg-red-100 p-2 rounded text-red-700 text-sm'>
                                <p>নতুন ছবি নির্বাচিত: **{imageFile.name}**</p>
                                <p className='text-xs'>সেভ বাটনে ক্লিক না করা পর্যন্ত আপডেট হবে না।</p>
                            </div>
                        )}
                        
                        {/* নাম */}
                        <div className="form-control">
                            <label className="label"><span className="label-text flex items-center gap-1">নাম</span></label>
                            <input 
                                type="text" 
                                className="input input-bordered w-full"
                                disabled={!isEditing}
                                {...register("name", { required: true })} 
                            />
                            {errors.name && <span className="text-red-500 text-sm mt-1">নাম প্রয়োজন।</span>}
                        </div>
                        
                        {/* ইমেইল */}
                        <div className="form-control">
                            <label className="label"><span className="label-text flex items-center gap-1"><Mail size={16}/> ইমেইল (পরিবর্তনযোগ্য নয়)</span></label>
                            <input 
                                type="email" 
                                className="input input-bordered w-full bg-gray-100"
                                value={profileData.email || user.email}
                                disabled
                            />
                        </div>

                        {/* ফোন নম্বর */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-1">
                                    <Phone size={16}/> ফোন নম্বর <span className='text-red-500'>* (আবশ্যিক)</span>
                                </span>
                            </label>
                            <input 
                                type="tel" 
                                placeholder="আপনার ফোন নম্বর"
                                className="input input-bordered w-full"
                                disabled={!isEditing}
                                {...register("phoneNumber", {
                                    required: 'ফোন নম্বর অবশ্যই পূরণীয়',
                                    minLength: { value: 10, message: "কমপক্ষে ১০ ডিজিট দিন।" },
                                })} 
                            />
                            {errors.phoneNumber && <span className="text-red-500 text-sm mt-1">{errors.phoneNumber.message || "ফোন নম্বর প্রয়োজন।"}</span>}
                        </div>

                    </div>
                </div>

                <div className="divider text-gray-400">অবস্থান এবং রক্তদান</div>
                
                {/* ফর্ম গ্রিড */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* ব্লাড গ্রুপ */}
                    <div className="form-control">
                        <label className="label"><span className="label-text flex items-center gap-1"><Droplet size={16}/> রক্তের গ্রুপ</span></label>
                        <select 
                            className="select select-bordered w-full"
                            disabled={!isEditing}
                            {...register("bloodGroup", { required: true })}
                        >
                            <option value="">নির্বাচন করুন</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                        {errors.bloodGroup && <span className="text-red-500 text-sm mt-1">রক্তের গ্রুপ প্রয়োজন।</span>}
                    </div>

                    {/* শেষ রক্তদানের তারিখ (ঐচ্ছিক) */}
                    <div className="form-control">
                        <label className="label"><span className="label-text flex items-center gap-1"><Shield size={16}/> শেষ রক্তদানের তারিখ (ঐচ্ছিক)</span></label>
                        <input 
                            type="date" 
                            className="input input-bordered w-full"
                            disabled={!isEditing}
                            {...register("lastDonationDate")}
                        />
                    </div>

                    {/* জেলা (District) */}
                    <div className="form-control">
                        <label className="label"><span className="label-text flex items-center gap-1"><MapPin size={16}/> জেলা</span></label>
                        <select 
                            className="select select-bordered w-full"
                            disabled={!isEditing}
                            {...register("district", { required: true })}
                        >
                            <option value="">জেলা নির্বাচন করুন</option>
                            {districts && districts.map(d => ( 
                                <option key={d.id} value={d.name}>{d.name}</option> 
                            ))}
                        </select>
                        {errors.district && <span className="text-red-500 text-sm mt-1">জেলা প্রয়োজন।</span>}
                    </div>

                    {/* উপজেলা (Upazila) */}
                    <div className="form-control">
                        <label className="label"><span className="label-text flex items-center gap-1"><MapPin size={16}/> উপজেলা</span></label>
                        <select 
                            className="select select-bordered w-full"
                            disabled={!isEditing || !selectedDistrictName || (upazilas && upazilas.length === 0)} 
                            {...register("upazila", { required: true })}
                        >
                            <option value="">উপজেলা নির্বাচন করুন</option>
                            {upazilas && upazilas.map(u => ( 
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                        {errors.upazila && <span className="text-red-500 text-sm mt-1">উপজেলা প্রয়োজন।</span>}
                    </div>
                </div>
                
            </form>
        </div>
    );
};

export default UserProfile;
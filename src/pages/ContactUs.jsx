// src/pages/ContactUs.jsx

import React, { useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactUs = () => {

    // useEffect ব্যবহার করে টাইটেল সেট করা হলো
    useEffect(() => {
        document.title = "যোগাযোগ করুন - রক্তদান প্ল্যাটফর্ম";
        
        return () => {
            // অন্য পেজে গেলে ডিফল্ট টাইটেল সেট করুন 
            document.title = "রক্তদান প্ল্যাটফর্ম"; 
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // ভবিষ্যতে এখানে ফর্ম ডেটা ফেচ করে সার্ভারে POST রিকোয়েস্ট পাঠানোর লজিক যোগ হবে।
        alert("বার্তাটি সফলভাবে পাঠানো হয়েছে। ফর্ম হ্যান্ডলিং লজিক এখনো সার্ভারে বাস্তবায়ন করা হয়নি।");
        e.target.reset(); // ফর্ম রিসেট
    };

    return (
        <div className="container mx-auto px-4 py-16">
            
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-red-600 mb-3">আমাদের সাথে যোগাযোগ করুন</h1>
                <p className="text-lg text-gray-600">আপনার প্রশ্ন, পরামর্শ বা কোনো জরুরি প্রয়োজনে আমাদের জানাতে পারেন।</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* --- ক. যোগাযোগের তথ্য --- */}
                <div className="lg:col-span-1 space-y-8 p-6 bg-red-50 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">যোগাযোগের বিবরণ</h2>
                    
                    <div className="flex items-start space-x-3">
                        <Mail size={24} className="text-red-500 flex-shrink-0 mt-1"/>
                        <div>
                            <p className="font-semibold text-gray-800">ইমেল</p>
                            <p className="text-gray-600">support@bloodplatform.com</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                        <Phone size={24} className="text-red-500 flex-shrink-0 mt-1"/>
                        <div>
                            <p className="font-semibold text-gray-800">ফোন</p>
                            <p className="text-gray-600">+880 1XXXXXXXXX</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <MapPin size={24} className="text-red-500 flex-shrink-0 mt-1"/>
                        <div>
                            <p className="font-semibold text-gray-800">ঠিকানা</p>
                            <p className="text-gray-600">চট্টগ্রাম, বাংলাদেশ</p>
                        </div>
                    </div>
                </div>

                {/* --- খ. ফর্ম --- */}
                <div className="lg:col-span-2 p-8 bg-white rounded-lg shadow-xl">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">বার্তা পাঠান</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">আপনার নাম</span>
                            </label>
                            <input type="text" name="name" placeholder="আপনার পুরো নাম" className="input input-bordered w-full" required />
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">আপনার ইমেল</span>
                            </label>
                            <input type="email" name="email" placeholder="example@email.com" className="input input-bordered w-full" required />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">বার্তার বিষয়</span>
                            </label>
                            <input type="text" name="subject" placeholder="জরুরী রক্তদান, সাধারণ প্রশ্ন ইত্যাদি।" className="input input-bordered w-full" required />
                        </div>
                        
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">আপনার বার্তা</span>
                            </label>
                            <textarea name="message" className="textarea textarea-bordered h-32 w-full" placeholder="এখানে আপনার বার্তাটি লিখুন..." required></textarea>
                        </div>
                        
                        <div className="form-control mt-6">
                            <button type="submit" className="btn bg-red-600 text-white hover:bg-red-700 font-bold">
                                বার্তা পাঠান
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* --- গ. ম্যাপ (ঐচ্ছিক) --- */}
            <div className="mt-16 p-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">আমাদের অবস্থান</h2>
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    এখানে একটি Google Maps/Mapbox Embed iframe যুক্ত করা যেতে পারে।
                </div>
            </div>

        </div>
    );
};

export default ContactUs;
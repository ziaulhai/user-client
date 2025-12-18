import React, { useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';

const Contact = () => {
    const form = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 🔥 EmailJS কনফিগারেশন
        // আপনার ইমেইল ziaulhai@outlook.com এ রিসিভ হবে যদি EmailJS-এ এই ইমেইল কানেক্ট থাকে।
        emailjs.sendForm(
            'service_o6g6ybi',   // এখানে আপনার Service ID বসান
            'template_hxa04ar',  // এখানে আপনার Template ID বসান
            form.current, 
            'Plcg00dE06c_YuIMr'    // এখানে আপনার Public Key বসান
        )
        .then((result) => {
            Swal.fire({
                title: 'সফল!',
                text: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করবো।',
                icon: 'success',
                confirmButtonColor: '#EF4444'
            });
            form.current.reset(); // ফর্ম খালি করা
            setIsSubmitting(false);
        }, (error) => {
            console.log(error.text);
            Swal.fire({
                title: 'এরর!',
                text: 'দুঃখিত, বার্তাটি পাঠানো যায়নি। আবার চেষ্টা করুন।',
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
            setIsSubmitting(false);
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                
                {/* হেডার সেকশন */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        আমাদের সাথে <span className="text-red-600">যোগাযোগ</span> করুন
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        আপনার কোনো প্রশ্ন বা পরামর্শ থাকলে নিচের ফর্মের মাধ্যমে আমাদের জানান।
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* বাম পাশ: কন্টাক্ট ইনফো */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-red-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-full text-red-600">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">ফোন করুন</h3>
                                    <p className="text-gray-600 text-sm">+৮৮০ ১৭১২-৩৪৫৬৭৮</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-red-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-full text-red-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">ঠিকানা</h3>
                                    <p className="text-gray-600 text-sm">ঢাকা, বাংলাদেশ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ডান পাশ: ইমেইল ফর্ম */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-xl">
                            <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-semibold">আপনার নাম</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="user_name" // EmailJS ভেরিয়েবল
                                            placeholder="নাম লিখুন" 
                                            className="input input-bordered focus:outline-red-500 w-full bg-gray-50 transition-all" 
                                            required 
                                        />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-semibold">আপনার ইমেইল</span>
                                        </label>
                                        <input 
                                            type="email" 
                                            name="user_email" // EmailJS ভেরিয়েবল
                                            placeholder="email@example.com" 
                                            className="input input-bordered focus:outline-red-500 w-full bg-gray-50 transition-all" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">বিষয়</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="subject" // EmailJS ভেরিয়েবল
                                        placeholder="কি বিষয়ে জানাতে চান?" 
                                        className="input input-bordered focus:outline-red-500 w-full bg-gray-50 transition-all" 
                                        required 
                                    />
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">বার্তা</span>
                                    </label>
                                    <textarea 
                                        name="message" // EmailJS ভেরিয়েবল
                                        rows="5" 
                                        placeholder="আপনার বিস্তারিত বার্তা লিখুন..." 
                                        className="textarea textarea-bordered focus:outline-red-500 w-full bg-gray-50 transition-all" 
                                        required
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`btn btn-error w-full text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.01] ${isSubmitting ? 'loading' : ''}`}
                                >
                                    {isSubmitting ? 'পাঠানো হচ্ছে...' : (
                                        <div className="flex items-center gap-2">
                                            ইমেইল করুন <Send size={18} />
                                        </div>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
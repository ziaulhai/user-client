import React from 'react';
import { Target, Eye, Heart, Shield, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const OurMission = () => {
    const values = [
        {
            icon: <Heart className="text-red-500" size={32} />,
            title: "নিঃস্বার্থ সেবা",
            description: "বিনা মূল্যে এবং নিঃস্বার্থভাবে মুমূর্ষু মানুষের পাশে দাঁড়ানোই আমাদের প্রধান লক্ষ্য।"
        },
        {
            icon: <Shield className="text-blue-500" size={32} />,
            title: "বিশ্বস্ততা",
            description: "রক্তদাতা ও গ্রহীতার তথ্যের সর্বোচ্চ গোপনীয়তা এবং নিরাপত্তা নিশ্চিত করা।"
        },
        {
            icon: <Globe className="text-green-500" size={32} />,
            title: "সামাজিক ঐক্য",
            description: "রক্তদানের মাধ্যমে একটি বৈষম্যহীন এবং সচেতন সমাজ গড়ে তোলা।"
        },
        {
            icon: <Award className="text-orange-500" size={32} />,
            title: "মান নিয়ন্ত্রণ",
            description: "রক্তদান প্রক্রিয়ায় সঠিক গাইডলাইন এবং সচেতনতা নিশ্চিত করা।"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* --- হিরো সেকশন --- */}
            <section className="relative py-20 bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img 
                        src="https://i.ibb.co.com/spkdJDXy/hero-blood-donate.jpg" 
                        alt="Background" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-6">আমাদের লক্ষ্য ও উদ্দেশ্য</h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
                        প্রযুক্তির সর্বোচ্চ ব্যবহারের মাধ্যমে রক্তদানকে সহজতর করা এবং প্রতিটি জীবন রক্ষায় অতন্দ্র প্রহরীর মতো কাজ করা।
                    </p>
                </div>
            </section>

            {/* --- মিশন ও ভিশন --- */}
            <section className="py-16 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* মিশন */}
                    <div className="p-8 bg-red-50 rounded-3xl border border-red-100 relative overflow-hidden group">
                        <Target className="text-red-600 mb-6 group-hover:scale-110 transition-transform" size={48} />
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">আমাদের মিশন</h2>
                        <p className="text-gray-600 leading-relaxed italic">
                            "আমাদের মিশন হলো একটি সেন্ট্রালাইজড ডিজিটাল প্ল্যাটফর্ম তৈরি করা যেখানে প্রতি সেকেন্ডে রক্তের প্রয়োজনে থাকা মানুষ মুহূর্তেই একজন স্বেচ্ছাসেবী রক্তদাতার সন্ধান পাবে। আমরা রক্তদানের ভয় দূর করে তরুণ প্রজন্মকে উদ্বুদ্ধ করতে কাজ করি।"
                        </p>
                    </div>

                    {/* ভিশন */}
                    <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 relative overflow-hidden group">
                        <Eye className="text-blue-600 mb-6 group-hover:scale-110 transition-transform" size={48} />
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">আমাদের ভিশন</h2>
                        <p className="text-gray-600 leading-relaxed italic">
                            "এমন একটি বাংলাদেশ গড়া যেখানে রক্তের অভাবে আর একটি প্রাণও ঝরে পড়বে না। প্রতিটি জেলা এবং উপজেলায় আমাদের নেটওয়ার্ক বিস্তৃত করার মাধ্যমে জরুরি স্বাস্থ্যসেবায় আমূল পরিবর্তন আনা।"
                        </p>
                    </div>
                </div>
            </section>

            {/* --- আমাদের মূল মূল্যবোধ --- */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">আমাদের মূল মূল্যবোধ</h2>
                        <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 text-center border border-gray-100">
                                <div className="inline-block p-4 bg-gray-50 rounded-full mb-6">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                                <p className="text-gray-600 text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- কল টু অ্যাকশন --- */}
            <section className="py-20 container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto bg-red-600 rounded-[2rem] p-10 md:p-16 text-white shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">আপনি কি আমাদের সাথে যুক্ত হতে চান?</h2>
                    <p className="text-lg mb-10 opacity-90">আপনার এক ব্যাগ রক্ত বাঁচাতে পারে একটি পরিবার। আজই নিবন্ধিত হয়ে মানবতার সেবায় অংশ নিন।</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register" className="text-red-600 font-semibold hover:underline ml-1"><button className="btn bg-white text-red-600 hover:bg-gray-100 border-none px-8 font-bold">রক্তদাতা হিসেবে যোগ দিন</button></Link>
                        <button className="btn btn-outline border-white text-white hover:bg-white hover:text-red-600 px-8 font-bold">আরও জানুন</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OurMission;
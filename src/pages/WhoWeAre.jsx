import React from 'react';
import { Heart, Users, ShieldCheck, Target, Droplet } from 'lucide-react';

const WhoWeAre = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- হিরো সেকশন --- */}
            <section className="bg-red-600 py-20 text-white text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">আমরা কারা</h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
                        আমরা এমন একটি প্ল্যাটফর্ম যা মুমূর্ষু রোগীর প্রয়োজনে রক্তদাতা ও গ্রহীতার মাঝে সেতুবন্ধন তৈরি করে।
                    </p>
                </div>
            </section>

            {/* --- আমাদের উদ্দেশ্য ও পরিচিতি --- */}
            <section className="py-16 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <Users className="mr-3 text-red-600" size={32} /> আমাদের পরিচয়
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            রক্তদান একটি মানবিক কাজ। আমাদের লক্ষ্য হলো আধুনিক প্রযুক্তির মাধ্যমে রক্তদান প্রক্রিয়াকে আরও সহজ এবং দ্রুত করা। আমরা বিশ্বাস করি, সঠিক সময়ে রক্তের সঠিক গ্রুপ খুঁজে পাওয়া একজনের জীবন বাঁচাতে পারে।
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            স্বেচ্ছাসেবী রক্তদাতাদের একটি বিশাল নেটওয়ার্ক তৈরি করা এবং রক্তদানের প্রয়োজনীয়তা সম্পর্কে জনসচেতনতা বৃদ্ধি করাই আমাদের প্রধান কাজ।
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-b-4 border-red-500">
                            <Heart className="mx-auto text-red-500 mb-2" size={30} />
                            <h3 className="font-bold text-gray-800">মানবিকতা</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-b-4 border-blue-500">
                            <ShieldCheck className="mx-auto text-blue-500 mb-2" size={30} />
                            <h3 className="font-bold text-gray-800">নিরাপত্তা</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-b-4 border-green-500">
                            <Target className="mx-auto text-green-500 mb-2" size={30} />
                            <h3 className="font-bold text-gray-800">লক্ষ্য</h3>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-b-4 border-orange-500">
                            <Droplet className="mx-auto text-orange-500 mb-2" size={30} />
                            <h3 className="font-bold text-gray-800">রক্তদান</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- আমাদের বৈশিষ্ট্য --- */}
            <section className="bg-white py-16 border-t border-gray-200">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">কেন আমাদের সাথে থাকবেন?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-gray-50 hover:bg-red-50 transition duration-300">
                            <h4 className="text-xl font-bold text-red-600 mb-3">সহজ ডোনার খোঁজা</h4>
                            <p className="text-gray-600">খুব সহজেই এলাকা এবং গ্রুপের ভিত্তিতে রক্তদাতার তথ্য খুঁজে পাওয়ার সুবিধা।</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 hover:bg-red-50 transition duration-300">
                            <h4 className="text-xl font-bold text-red-600 mb-3">সম্পূর্ণ ফ্রি প্ল্যাটফর্ম</h4>
                            <p className="text-gray-600">আমাদের এই সেবাটি সম্পূর্ণ বিনামূল্যে এবং অলাভজনক একটি মানবিক উদ্যোগ।</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gray-50 hover:bg-red-50 transition duration-300">
                            <h4 className="text-xl font-bold text-red-600 mb-3">জরুরি সাপোর্ট</h4>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WhoWeAre;
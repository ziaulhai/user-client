import React from 'react';
import { Lock, Eye, ShieldCheck, Database, Bell, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
    const currentDate = new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const policySections = [
        {
            icon: <Database className="text-red-500" size={24} />,
            title: "তথ্য সংগ্রহ",
            content: "আপনি যখন আমাদের সাইটে রেজিস্ট্রেশন করেন বা কন্টেন্ট প্রকাশ করেন, তখন আমরা আপনার নাম, ইমেইল ঠিকানা এবং প্রোফাইল তথ্য সংগ্রহ করি। এছাড়াও ব্রাউজিং অভিজ্ঞতার উন্নতির জন্য আমরা কুকিজ (Cookies) ব্যবহার করতে পারি।"
        },
        {
            icon: <Eye className="text-red-500" size={24} />,
            title: "তথ্যের ব্যবহার",
            content: "সংগৃহীত তথ্যগুলো আমরা আপনার প্রোফাইল পরিচালনা করতে, নতুন পোস্ট সম্পর্কে আপডেট জানাতে এবং সাইটের নিরাপত্তা বজায় রাখতে ব্যবহার করি। আমরা কোনো অবস্থাতেই আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।"
        },
        {
            icon: <ShieldCheck className="text-red-500" size={24} />,
            title: "তথ্যের নিরাপত্তা",
            content: "আপনার তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে আমরা আধুনিক এনক্রিপশন এবং সিকিউরিটি প্রোটোকল ব্যবহার করি। তবে ইন্টারনেটে তথ্য আদান-প্রদান ১০০% নিরাপদ নয়, তাই আমরা সতর্কতার সাথে কাজ করি।"
        },
        {
            icon: <Lock className="text-red-500" size={24} />,
            title: "আপনার অধিকার",
            content: "আপনি যেকোনো সময় আপনার ব্যক্তিগত তথ্য পরিবর্তন, আপডেট বা আমাদের ডাটাবেজ থেকে মুছে ফেলার অনুরোধ করার অধিকার রাখেন। আপনার ড্যাশবোর্ড থেকে আপনি সরাসরি প্রোফাইল এডিট করতে পারেন।"
        },
        {
            icon: <Bell className="text-red-500" size={24} />,
            title: "নীতিমালা পরিবর্তন",
            content: "ভবিষ্যতে আমাদের গোপনীয়তা নীতিতে কোনো বড় পরিবর্তন আনা হলে, আমরা আপনাকে ইমেইল বা সাইটে নোটিশের মাধ্যমে জানিয়ে দেব।"
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* হেডার সেকশন */}
                <div className="bg-red-600 p-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">গোপনীয়তা নীতি</h1>
                    <p className="text-red-100 italic">আপডেট করা হয়েছে: {currentDate}</p>
                </div>

                {/* কন্টেন্ট সেকশন */}
                <div className="p-6 md:p-10">
                    <div className="flex items-start gap-4 mb-10 bg-red-50 p-5 rounded-xl border-l-4 border-red-500">
                        <Lock className="text-red-600 shrink-0 mt-1" size={28} />
                        <p className="text-gray-700 leading-relaxed italic">
                            আমাদের পরিষেবা ব্যবহার করার সময় আপনার গোপনীয়তা রক্ষা করা আমাদের অন্যতম অগ্রাধিকার। আমাদের এই নীতিমালায় জানানো হয়েছে আমরা কীভাবে আপনার তথ্যগুলো সংগ্রহ এবং সুরক্ষা করি।
                        </p>
                    </div>

                    <div className="space-y-10">
                        {policySections.map((section, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 group">
                                <div className="md:w-1/4 flex flex-row md:flex-col items-center md:items-start gap-2">
                                    <div className="p-3 bg-red-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800 md:mt-2">{section.title}</h2>
                                </div>
                                <div className="md:w-3/4">
                                    <p className="text-gray-600 leading-relaxed text-[16px]">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* কন্টাক্ট সেকশন */}
                    <div className="mt-16 bg-gray-100 rounded-2xl p-8 text-center">
                        <Mail className="mx-auto text-red-500 mb-4" size={40} />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">গোপনীয়তা সংক্রান্ত প্রশ্ন?</h3>
                        <p className="text-gray-600 mb-6">আপনার তথ্যের নিরাপত্তা নিয়ে কোনো প্রশ্ন থাকলে সরাসরি আমাদের সাথে যোগাযোগ করুন।</p>
                        <a 
                            href="mailto:privacy@yourdomain.com" 
                            className="btn btn-error text-white rounded-full px-10 hover:shadow-lg transition-all"
                        >
                            যোগাযোগ করুন
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
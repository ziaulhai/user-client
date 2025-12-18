import React from 'react';
import { ShieldCheck, FileText, UserCheck, AlertCircle, Scale } from 'lucide-react';

const TermsAndConditions = () => {
    // বর্তমান তারিখ ফরম্যাট করার জন্য
    const currentDate = new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const sections = [
        {
            icon: <UserCheck className="text-red-500" size={24} />,
            title: "১. সাধারণ শর্তাবলী",
            content: "আমাদের ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি আমাদের সকল শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে। আপনি যদি এই শর্তাবলীতে সম্মত না হন, তবে অনুগ্রহ করে সাইটটি ব্যবহার করা থেকে বিরত থাকুন।"
        },
        {
            icon: <FileText className="text-red-500" size={24} />,
            title: "২. কন্টেন্ট ব্যবহারের নিয়ম",
            content: "এই সাইটের সকল ব্লগ পোস্ট, ইমেজ এবং অন্যান্য কন্টেন্ট আমাদের নিজস্ব সম্পদ। অনুমতি ছাড়া কোনো কন্টেন্ট কপি, রি-পাবলিশ বা বাণিজ্যিক কাজে ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।"
        },
        {
            icon: <ShieldCheck className="text-red-500" size={24} />,
            title: "৩. ব্যবহারকারীর একাউন্ট",
            content: "রেজিস্ট্রেশন করার সময় আপনাকে সঠিক তথ্য প্রদান করতে হবে। আপনার একাউন্টের পাসওয়ার্ড এবং তথ্যের নিরাপত্তা বজায় রাখার দায়িত্ব সম্পূর্ণ আপনার। যেকোনো সন্দেহজনক কার্যক্রমের জন্য আমরা একাউন্ট স্থগিত করার ক্ষমতা রাখি।"
        },
        {
            icon: <AlertCircle className="text-red-500" size={24} />,
            title: "৪. দায়বদ্ধতা সীমাবদ্ধতা",
            content: "ব্লগ পোস্টে প্রকাশিত তথ্যসমূহ লেখকের নিজস্ব মতামত। তথ্যের নির্ভুলতা যাচাই করে গ্রহণ করার অনুরোধ রইল। কোনো তথ্যের কারণে কোনো প্রকার ক্ষতির সম্মুখীন হলে কর্তৃপক্ষ দায়ী থাকবে না।"
        },
        {
            icon: <Scale className="text-red-500" size={24} />,
            title: "৫. পরিবর্তন ও সংশোধন",
            content: "কর্তৃপক্ষ যেকোনো সময় কোনো পূর্ব ঘোষণা ছাড়াই এই শর্তাবলী পরিবর্তন বা পরিমার্জন করার অধিকার সংরক্ষণ করে। পরিবর্তনের পর সাইট ব্যবহার চালিয়ে যাওয়া মানে আপনি নতুন শর্তাবলীতে সম্মত হয়েছেন।"
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* হেডার সেকশন */}
                <div className="bg-red-600 p-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">ব্যবহারের শর্তাবলী</h1>
                    <p className="text-red-100 italic">সর্বশেষ আপডেট: {currentDate}</p>
                </div>

                {/* কন্টেন্ট সেকশন */}
                <div className="p-6 md:p-10 space-y-8">
                    <p className="text-gray-600 leading-relaxed text-lg border-l-4 border-red-500 pl-4 bg-red-50 py-3 rounded-r-lg">
                        আমাদের প্ল্যাটফর্মে স্বাগতম। আমরা চাই আপনি একটি সুন্দর এবং নিরাপদ পরিবেশের মধ্যে আমাদের ব্লগগুলো পড়ুন। নিচে আমাদের ব্যবহারের নিয়মাবলী বিস্তারিত দেওয়া হলো:
                    </p>

                    <div className="grid gap-8">
                        {sections.map((section, index) => (
                            <div key={index} className="group hover:bg-gray-50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed ml-12">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                 
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
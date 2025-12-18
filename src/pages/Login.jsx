// src/pages/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth'; // আপনি তৈরি করেছেন
import { toast } from 'react-hot-toast'; // টোস্ট নোটিফিকেশনের জন্য
import { Eye, EyeOff } from 'lucide-react'; // আইকনের জন্য

const Login = () => {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard"; // লগইন সফল হলে কোথায় যাবে

    // পাসওয়ার্ড শো/হাইড করার স্টেট
    const [showPassword, setShowPassword] = useState(false);

    // react-hook-form ব্যবহার করা হলো
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        const { email, password } = data;

        try {
            // Firebase Login
            await signIn(email, password);

            toast.success('লগইন সফল! ড্যাশবোর্ডে স্বাগতম।');
            navigate(from, { replace: true }); // ইউজারকে কাঙ্ক্ষিত রুটে রিডাইরেক্ট করা
        } catch (error) {
            console.error(error);
            let errorMessage = 'লগইন ব্যর্থ হয়েছে।';

            // Firebase এরর মেসেজ হ্যান্ডেল করা
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'এই ইমেইলের কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'পাসওয়ার্ডটি ভুল দিয়েছেন।';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'ইমেইল ফরম্যাট সঠিক নয়।';
            }
            
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-red-600 mb-6">লগইন করুন</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">ইমেইল</label>
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="example@email.com"
                        />
                        {errors.email && <span className="text-red-500 text-sm">ইমেইল আবশ্যক।</span>}
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">পাসওয়ার্ড</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", { required: true })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <span className="text-red-500 text-sm">পাসওয়ার্ড আবশ্যক।</span>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition duration-200 shadow-md"
                    >
                        লগইন
                    </button>
                </form>

                <p className="mt-4 text-sm text-center text-gray-600">
                    এখনও অ্যাকাউন্ট নেই? 
                    <Link to="/register" className="text-red-600 font-semibold hover:underline ml-1">রেজিস্ট্রেশন করুন</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
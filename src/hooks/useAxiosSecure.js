// useAxiosSecure.js - চূড়ান্ত সংশোধিত এবং নির্ভরযোগ্য ভার্সন

import axios from "axios";
import { useEffect } from "react";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";

// ফিক্স: সার্ভারের সাথে মিলিয়ে '/api/v1' অংশটি বাদ দেওয়া হলো (যদি থাকে)
const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

const useAxiosSecure = () => {
    const { logOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // ১. রিকোয়েস্ট ইন্টারসেপ্টর: JWT টোকেন যোগ করা
        const requestInterceptor = axiosSecure.interceptors.request.use(async (config) => {

            // 🔥 ফিক্স: অ্যাসিঙ্ক্রোনাসলি টোকেন লোড করা
            const token = await localforage.getItem('access-token');

            // 🔥 ডায়াগনস্টিক লগ: ব্রাউজার কনসোলে টোকেন স্ট্যাটাস চেক
            console.log('INTERCEPTOR CHECK: Token retrieved:', token ? 'Token Found' : 'NO TOKEN FOUND');
            // console.log('Request Interceptor Fired. Target URL:', config.baseURL + config.url);

            if (token) {
                // টোকেনটিকে Authorization হেডারে Bearer স্কিমা সহ যুক্ত করা
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                // টোকেন না পেলে অনুরোধ বাতিল করা বা 401 ট্রিগার করা উচিত
                console.warn("Attempted to send secure request without token.");
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        // ২. রেসপন্স ইন্টারসেপ্টর: 401/403 এরর হ্যান্ডেল করা
        const responseInterceptor = axiosSecure.interceptors.response.use((response) => {
            return response;
        }, async (error) => {
            const status = error.response?.status;

            if (status === 401 || status === 403) {
                console.error(`Authorization Error (${status}) detected. Logging out.`);

                // টোকেন এক্সপায়ার হওয়ার কারণে 403 এলে লগআউট করা
                await logOut();
                navigate('/login');
            }
            return Promise.reject(error);
        });

        // ক্লিনআপ ফাংশন
        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        };
    }, [logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;
import axios from "axios";
import { useEffect } from "react";
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";
import localforage from "localforage"; // টোকেন স্টোর করার জন্য localforage ব্যবহার করা হচ্ছে

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// JWT Token সহ সুরক্ষিত API কলের জন্য Axios Instance
const axiosSecure = axios.create({
    baseURL: API_BASE_URL
});

const useAxiosSecure = () => {
    const { logOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // রিকোয়েস্ট ইন্টারসেপ্টর: প্রতিবার রিকোয়েস্ট পাঠানোর আগে JWT টোকেন যোগ করা
        const requestInterceptor = axiosSecure.interceptors.request.use(async (config) => {
            const token = await localforage.getItem('access-token');
            if (token) {
                // টোকেন যোগ করা হলো
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        // রেসপন্স ইন্টারসেপ্টর: টোকেন মেয়াদোত্তীর্ণ হলে লগআউট করানো
        const responseInterceptor = axiosSecure.interceptors.response.use((response) => {
            return response;
        }, async (error) => {
            const status = error.response?.status;
            
            // 401 (Unauthorized) বা 403 (Forbidden) হলে লগআউট
            if (status === 401 || status === 403) {
                await logOut();
                navigate('/login');
            }
            return Promise.reject(error);
        });

        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
        };
    }, [logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;
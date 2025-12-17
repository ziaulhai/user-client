import axios from "axios";

// সার্ভারের বেস URL সেট করা হলো
const axiosPublic = axios.create({
    // নিশ্চিত করুন যে এই URL টি আপনার ব্যাকএন্ড সার্ভারের ঠিকানার সাথে হুবহু মেলে।
    // আপনার সার্ভার যদি পোর্টে চলে, তবে পোর্ট নম্বর দিন।
    // JWT/Private API কলগুলোর জন্য আমরা useAxiosSecure তৈরি করব।
    baseURL: 'https://blood-donation-gray-kappa.vercel.app'
});

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;
// src/hooks/useAxiosPublic.js

import axios from "axios";

// বেস URL আপনার সার্ভার URL হওয়া উচিত
const axiosPublic = axios.create({
    baseURL: 'https://blood-donation-gray-kappa.vercel.app', // আপনার সার্ভার URL

});

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;
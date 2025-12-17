// src/hooks/useRole.jsx

import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure"; // ধরে নিচ্ছি আপনি এটি তৈরি করেছেন

const useRole = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure(); 
    
    // ইউজার না থাকলে বা লোডিং চললে রোল চেকিং শুরু হবে না
    const isEnabled = !loading && !!user; 

    const { data: role, isLoading: isRoleLoading } = useQuery({
        queryKey: [user?.email, 'userRole'],
        // queryটি তখনই রান হবে যখন user থাকবে (isEnabled)
        enabled: isEnabled, 
        queryFn: async () => {
            if (user?.email) {
                // 🔥🔥 গুরুত্বপূর্ণ: এই API রুটটি আপনার সার্ভারকে কল করবে
                // এবং ইউজার ইমেলের বিপরীতে তার 'role' (যেমন 'admin', 'volunteer', 'donor') রিটার্ন করবে।
                const res = await axiosSecure.get(`/api/v1/users/role/${user.email}`); 
                // শুধুমাত্র রোল স্ট্রিং (যেমন 'admin') রিটার্ন করা হলো
                return res.data.role; 
            }
            // ইউজার না থাকলে ডিফল্ট রোল 'donor' বা 'guest' রিটার্ন করা যেতে পারে
            return 'donor'; 
        },
    });

    // রোলটি স্ট্রিং হিসেবে রিটার্ন করবে ('admin', 'volunteer', 'donor')
    // এবং লোডিং স্টেটাস রিটার্ন করবে
    return { role, isRoleLoading };
};

export default useRole;
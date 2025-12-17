import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure'; 

const useAdmin = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // useQuery ব্যবহার করে সার্ভার থেকে ইউজারের রোল চেক করা
    const { data: roleData, isLoading: isAdminLoading } = useQuery({
        // queryKey নিশ্চিত করে যে প্রতি ইউজারের জন্য শুধুমাত্র একবার চেক করা হবে
        queryKey: ['isAdmin', user?.email],
        
        // Auth লোড না হলে এবং ইউজার লগইন করা থাকলে তবেই ফেচ করবে
        enabled: !loading && !!user?.email, 
        
        queryFn: async () => {
            if (!user?.email) return { role: 'donor' };

            // রোল ডেটা ফেচ করা
            const res = await axiosSecure.get(`/api/v1/users/role/${user.email}`); 
            return res.data; 
        }
    });

    const isAdmin = roleData?.role === 'admin';

    // অবজেক্ট হিসেবে ডেটা ফেরত দেওয়া হয়েছে
    return { isAdmin, isAdminLoading };
};

export default useAdmin;
// src/hooks/useAuth.js

import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider'; // AuthProvider থেকে AuthContext ইম্পোর্ট

/**
 * useAuth হুকটি AuthContext থেকে ইউজার ডেটা এবং অথেন্টিকেশন ফাংশনগুলো সরবরাহ করে।
 */
const useAuth = () => {
    const auth = useContext(AuthContext);
    
    // AuthProvider এর বাইরে ব্যবহার করলে এরর দেবে
    if (!auth) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    
    return auth;
};

export default useAuth;
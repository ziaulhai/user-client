// src/providers/AuthProvider.jsx

import { createContext, useEffect, useState } from 'react';
import auth from '../firebase/firebase.config'; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    updateProfile 
} from 'firebase/auth';
// axios দরকার নেই, কারণ useAxiosPublic/Secure ব্যবহার করা হচ্ছে
import localforage from 'localforage'; 
import useAxiosPublic from '../hooks/useAxiosPublic';

export const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [jwtFetched, setJwtFetched] = useState(false); // 🔥 নতুন স্টেট: JWT লোড হয়েছে কি না ট্র্যাক করার জন্য
    const axiosPublic = useAxiosPublic(); 

    // --- Firebase Auth Methods (পরিবর্তন নেই) ---
    // ... (createUser, signIn, logOut, updateUserProfile, reloadUser, updateUser লজিক একই থাকবে)
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logOut = async () => {
        setLoading(true);
        await localforage.removeItem('access-token');
        setUserRole(null);
        setUserStatus(null);
        setJwtFetched(false); // রিসেট
        return signOut(auth);
    };

    const updateUserProfile = (name, photo) => {
        return updateProfile(auth.currentUser, {
            displayName: name, photoURL: photo
        });
    };
    
    const reloadUser = async () => {
        if (auth.currentUser) {
            try {
                await auth.currentUser.reload(); 
                setUser({ ...auth.currentUser }); 
                setJwtFetched(false); // রি-ফেচ ট্রিগার
            } catch (error) {
                console.error("Failed to reload user:", error);
            }
        }
    };
    
    const updateUser = (newUserData) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,    
                ...newUserData 
            };
        });
    };
    // ---------------------------------------------


    // --- ১. Firebase Auth State এবং JWT টোকেন ম্যানেজমেন্ট (প্রথম ধাপ) ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                const userInfo = { email: currentUser.email };
                
                try {
                    // JWT টোকেন পাওয়ার জন্য সার্ভারে কল (useAxiosPublic ব্যবহার করছে)
                    const res = await axiosPublic.post(`/jwt`, userInfo); 
                    
                    if (res.data.token) {
                        await localforage.setItem('access-token', res.data.token);
                    }
                    // টোকেন সফলভাবে হ্যান্ডেল হয়েছে
                    setJwtFetched(true); 

                } catch (error) {
                    console.warn("JWT Handling Error:", error.message);
                    
                    // ত্রুটি হলে শুধুমাত্র টোকেন স্টেট রিসেট
                    await localforage.removeItem('access-token');
                    setJwtFetched(true); // এরর হলেও, হ্যান্ডলিং শেষ
                }
            } else {
                // ইউজার লগআউট করেছে
                await localforage.removeItem('access-token');
                setJwtFetched(true); // হ্যান্ডলিং শেষ
                setUserRole(null);
                setUserStatus(null);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, [axiosPublic]);


    // --- ২. ইউজার রোল ফেচিং (JWT লোড হওয়ার উপর নির্ভরশীল) ---
    useEffect(() => {
        // 🔥 এই লজিকটি শুধুমাত্র তখনই চলবে যখন:
        // ১. JWT হ্যান্ডেল করা শেষ (jwtFetched === true)
        // ২. ইউজার লগইন অবস্থায় আছে (user আছে)
        if (user && jwtFetched) {
            
            const fetchUserRoleAndStatus = async () => {
                try {
                    // ⭐ ফিক্স: ডেটাবেজ থেকে রোল এবং স্ট্যাটাস ফেচ করার জন্য কল
                    // ধরে নিলাম আপনার ব্যাকএন্ড রুট হচ্ছে /users/:email, 
                    // এবং এটি JWT টোকেন ছাড়াই (বা useAxiosPublic দিয়ে) কাজ করে।
                    const userRes = await axiosPublic.get(`/api/v1/users/${user.email}`); 
                    
                    if (userRes.data) {
                        setUserRole(userRes.data.role); // ✅ রোল সেট হলো
                        setUserStatus(userRes.data.status); // ✅ স্ট্যাটাস সেট হলো
                    } else {
                        // যদি ডেটাবেজে ইউজার না থাকে
                        setUserRole('donor'); 
                        setUserStatus('active');
                    }
                    
                } catch (error) {
                    // যদি রোল ফেচিং এ ৪০৪ বা অন্য এরর আসে
                    console.error("Role/Status Fetch Error (Check API route /users/:email):", error.message);
                    setUserRole('donor'); // ডিফল্ট রোল
                    setUserStatus('active'); // ডিফল্ট স্ট্যাটাস
                }
            };

            fetchUserRoleAndStatus();

        } else if (!user && jwtFetched) {
            // লগআউট অবস্থায় রোল রিসেট
            setUserRole(null);
            setUserStatus(null);
        }
        
    }, [user, jwtFetched, axiosPublic]); // user এবং jwtFetched-এর উপর নির্ভর করে

    
    const authInfo = {
        user,
        loading,
        userRole,
        userStatus,
        createUser,
        signIn,
        logOut,
        updateUserProfile,
        reloadUser,
        updateUser 
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
// src/hooks/useAuth.jsx

import { useContext } from "react";
// আপনার AuthProvider.jsx ফাইলটি যেখানে আছে, সেই পাথ অনুযায়ী এটি ঠিক করুন
import { AuthContext } from "../providers/AuthProvider"; 

const useAuth = () => {
    // AuthProvider থেকে ডেটা useContext hook এর মাধ্যমে ব্যবহার করা হলো
    const auth = useContext(AuthContext);
    return auth;
};

export default useAuth;
// src/routes/PrivateRoute.jsx

import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth"; // আপনার Auth Context হুক

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // লোডিং স্ক্রিন
        return <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-dots loading-lg text-red-600"></span>
        </div>
    }

    if (user) {
        return children; // ইউজার লগইন করা থাকলে
    }

    // ইউজার লগইন না থাকলে তাকে লগইন পেজে রিডাইরেক্ট করা
    return <Navigate to="/login" state={{ from: location }} replace></Navigate>
};

export default PrivateRoute;
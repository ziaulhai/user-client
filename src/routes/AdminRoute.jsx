// src/routes/AdminRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAdmin from '../hooks/useAdmin'; // আপনার তৈরি করা হুক

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const { isAdmin, isAdminLoading } = useAdmin();
    const location = useLocation();

    if (loading || isAdminLoading) {
        // লোডিং স্ক্রিন
        return <div className="text-center p-10 min-h-[50vh] flex items-center justify-center"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    if (user && isAdmin) {
        return children;
    }

    // ইউজার লগইন না থাকলে বা অ্যাডমিন না হলে লগইন পেজে রিডাইরেক্ট করা
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;
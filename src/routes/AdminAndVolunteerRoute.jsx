// src/routes/AdminAndVolunteerRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // আপনার AuthProvider থেকে ডেটা আনার হুক
import useRole from '../hooks/useRole'; // আপনার কাস্টম হুক যা ব্যবহারকারীর রোল দেবে

const AdminAndVolunteerRoute = ({ children }) => {
    const { user, loading } = useAuth(); // Auth context থেকে ইউজার ও লোডিং স্টেট নিন
    const { role, isRoleLoading } = useRole(); // আপনার কাস্টম হুক থেকে রোল নিন
    const location = useLocation();

    // ১. লোডিং স্টেট
    if (loading || isRoleLoading) {
        return <div className="text-center p-20"><span className="loading loading-spinner loading-lg text-red-600"></span></div>;
    }

    // ২. অ্যাক্সেস চেকিং: যদি ইউজার লগইন করে থাকে এবং রোল হয় 'admin' অথবা 'volunteer'
    const hasAccess = user && (role === 'admin' || role === 'volunteer');

    if (hasAccess) {
        return children;
    }

    // ৩. যদি অ্যাক্সেস না থাকে, তবে লগইন পেজে রিডাইরেক্ট
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminAndVolunteerRoute;
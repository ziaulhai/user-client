import { createBrowserRouter } from "react-router-dom";



// কম্পোনেন্ট ইম্পোর্ট
import PublicHome from "../pages/PublicHome";

import PublicBlogPosts from "../pages/PublicBlogPosts";

import UpdateBlogPost from "../components/Dashboard/Admin/UpdateBlogPost";

import ContactUs from "../pages/ContactUs";

import App from "../App";

import Login from "../pages/Login";

import Signup from "../pages/Signup";

import DashboardLayout from "../layout/DashboardLayout";

import DonorDashboard from "../components/Dashboard/Donor/DonorDashboard";

import UserProfile from "../components/Dashboard/UserProfile";

import PrivateRoute from "./PrivateRoute";

import CreateDonationRequest from "../components/Dashboard/CreateDonationRequest";

import MyDonationRequests from "../components/Dashboard/MyDonationRequests";

import PublicDonationRequests from "../pages/PublicDonationRequests";

import DonationRequestDetails from "../pages/DonationRequestDetails";

import DonorSearch from "../pages/DonorSearch";

import BlogDetails from "../pages/BlogDetails";

import AdminRoute from "./AdminRoute";

// 🔥 নতুন ইম্পোর্ট: ডোনেশন রিকোয়েস্ট আপডেট কম্পোনেন্ট

import UpdateDonationRequest from "../components/Dashboard/UpdateDonationRequest";

import FundingPage from "../components/Dashboard/FundingPage";
import AdminFundingPage from "../components/Dashboard/Admin/AdminFundingPage";
import AdminAndVolunteerRoute from "./AdminAndVolunteerRoute";

// --- অ্যাডমিন ইম্পোর্ট ---

import AllUsers from "../components/Dashboard/Admin/AllUsers";

import AllDonationRequests from "../components/Dashboard/Admin/AllDonationRequests";

import AdminHome from "../components/Dashboard/Admin/AdminHome"; // <--- AdminDashboard এর পরিবর্তে

import CreateBlogPost from "../components/Dashboard/Admin/CreateBlogPost"; // <--- নতুন ইম্পোর্ট

import AllBlogPosts from "../components/Dashboard/Admin/AllBlogPosts"; // <--- নতুন ইম্পোর্ট

// --- ---



const router = createBrowserRouter([

    {

        path: "/",

        element: <App />,

        children: [

            // ১. হোম পেজ

            {

                index: true,

                element: <div> <PublicHome/> </div>,

            },

            // allblog

                {

                path: "/blogs",

                element: <div> <PublicBlogPosts/> </div>,

            },

            // 🔥 ডায়নামিক ব্লগ পোস্ট রুটটি এখানে যোগ করুন
            {
                path: "/blog/:id", // :id হলো ডায়নামিক প্যারামিটার
                element: <BlogDetails />, // আপনার তৈরি করা ব্লগ ডিটেইলস কম্পোনেন্ট
            },
            
            {
                path: "/funding",
                element: <FundingPage />,
            },

            {
                path: "contact-us", // URL হবে /contact
                element: <ContactUs />,
            },
           

            // ২. পাবলিক ডোনেশন রিকোয়েস্ট রুট

            {

                path: "/donation-requests",

                element: <PublicDonationRequests />,

            },

           

            // ৩. ডোনেশন রিকোয়েস্ট ডিটেইলস পেজ (সুরক্ষিত)

            {

                path: "/donation-request/:id",

                element: <PrivateRoute>

                             <DonationRequestDetails />

                         </PrivateRoute>

            },

           

            // ৪. ডোনার সার্চ পেজ

            {

                path: "/search",

                element: <DonorSearch />,

            },



            // ৫. ব্লগ ডিটেইলস পেজ (পাবলিক)

            {

                path: "/blogs/:id",

                element: <BlogDetails />,

            },



            // 🔥 নতুন '/donate' রুট

            {

                path: "/donate",

                element: <PrivateRoute>

                             <CreateDonationRequest />

                         </PrivateRoute>,

            },

        ]

    },

    // --- Auth Routes ---

    {

        path: "/login",

        element: <Login />,

    },

    {

        path: "/register",

        element: <Signup />,

    },

   

    // --- ড্যাশবোর্ড রুট (সুরক্ষিত) ---

    {

        path: "/dashboard",

        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,

        children: [

            // ১. ড্যাশবোর্ড হোম (ডোনারদের জন্য ডিফল্ট)
            
            // 🔥 ব্লগ পোস্ট আপডেট রুট
            {
                // এই পাথটি আপনার onClick এ ব্যবহৃত পাথের সাথে মিলতে হবে
                path: "edit-blog/:id", // ড্যাশবোর্ড চাইল্ড হিসেবে লিখুন
                element: <AdminRoute><UpdateBlogPost /></AdminRoute>, // UpdateBlogPost কম্পোনেন্ট ব্যবহার করুন
            },
            
            // ...

            {

                index: true,

                element: <DonorDashboard />,

            },

            // 🔥🔥🔥 ফান্ডিং পেজ রুট যোগ করা হলো 🔥🔥🔥
{
            path: "admin-funding", 
            // AdminRoute এর পরিবর্তে AdminAndVolunteerRoute ব্যবহার করা হলো
            element: <AdminAndVolunteerRoute><AdminFundingPage /></AdminAndVolunteerRoute>, 
        },

            // ২. আমার প্রোফাইল রুট

            {

                path: "profile",

                element: <UserProfile />,

            },

            // ৩. নতুন অনুরোধ তৈরি করুন রুট

            {

                path: "create-donation-request",

                element: <CreateDonationRequest />,

            },

            // ৪. আমার সব অনুরোধ দেখার রুট

            {

                path: "my-donation-requests",

                element: <MyDonationRequests />,

            },

           

            // 🔥 নতুন আপডেট রুট যোগ করা হলো 🔥

            {

                // এই পাথটি আপনার এররের সাথে মিলে যায়: /dashboard/update-donation-request/6939678d04a9eb309d682c02

                path: "update-donation-request/:id",

                element: <UpdateDonationRequest />,

            },

           

            // --- অ্যাডমিন রুট (AdminRoute দ্বারা অতিরিক্ত সুরক্ষিত) ---

           

            // ৫. অ্যাডমিন ড্যাশবোর্ড হোম

            {

                path: "admin-home",

                element: <AdminRoute><AdminHome /></AdminRoute>, // <--- AdminHome ব্যবহার করা হলো

            },

            // ৬. সকল ইউজার ম্যানেজমেন্ট

            {

                path: "all-users",

                element: <AdminRoute><AllUsers /></AdminRoute>,

            },

            // ৭. সকল ডোনেশন রিকোয়েস্ট ম্যানেজমেন্ট

            {

                path: "all-donation-requests",

                element: <AdminRoute><AllDonationRequests /></AdminRoute>,

            },

            // ৮. নতুন ব্লগ পোস্ট তৈরি

            {

                path: "create-blog-post",

                element: <AdminRoute><CreateBlogPost /></AdminRoute>,

            },

            // ৯. সকল ব্লগ পোস্ট ম্যানেজমেন্ট

            {

                path: "all-blog-posts",

                element: <AdminRoute><AllBlogPosts /></AdminRoute>,

            },

        ]

    }

]);



export default router;
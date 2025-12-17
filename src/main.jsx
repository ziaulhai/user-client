import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/Routes.jsx'; // আপনার রাউটার ফাইল
import AuthProvider from './providers/AuthProvider.jsx'; // আপনার Auth Provider

// *** TanStack Query এর জন্য প্রয়োজনীয় ইম্পোর্ট ***
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

// ১. QueryClient ইনস্ট্যান্স তৈরি
const queryClient = new QueryClient(); 
// **********************************************

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ২. AuthProvider এর বাইরে QueryClientProvider দিয়ে মুড়ে দিন */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
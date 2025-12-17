// src/utils/dateTimeHelpers.js

// Note: এই ফাংশনটি কাজ করার জন্য আপনার date-fns প্যাকেজটি ইনস্টল করা আবশ্যক।
// (npm install date-fns)
import { format } from 'date-fns';

/**
 * বর্তমান তারিখ এবং সময়কে YYYY-MM-DD এবং HH:mm ফরম্যাটে রিটার্ন করে।
 * এটি ফর্মের ডিফল্ট ভ্যালু হিসেবে ব্যবহার করা হয়।
 * @returns {object} { currentDate: string, currentTime: string }
 */
export const getCurrentDateTime = () => {
    const now = new Date();
    // YYYY-MM-DD ফরম্যাট
    const currentDate = format(now, 'yyyy-MM-dd'); 
    // HH:mm ফরম্যাট (24-ঘন্টা)
    const currentTime = format(now, 'HH:mm');

    return { currentDate, currentTime };
};
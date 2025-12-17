// src/hooks/useDistrictsAndUpazilas.js

import { useState, useEffect, useCallback } from 'react';

const useDistrictsAndUpazilas = () => {
    // ... (অন্যান্য স্টেটস অপরিবর্তিত)
    const [districts, setDistricts] = useState([]); 
    const [upazilas, setUpazilas] = useState([]);   
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔥 ফেচ করা ডেটা রাখার জন্য ইন্টারনাল স্টেট: এটিই আপনার চূড়ান্ত অবজেক্ট
    const [geoData, setGeoData] = useState({}); 

    // --- ডেটা ফেচ এবং ট্রান্সফরমেশন ---
    useEffect(() => {
        const fetchGeoData = async () => {
            setLoading(true);
            try {
                // 🔥 Public folder থেকে শুধুমাত্র একটি JSON ফাইল লোড করা
                const res = await fetch('/bd_geo_combined.json'); 
                
                if (!res.ok) {
                    throw new Error("Failed to fetch location data.");
                }

                // এটি হবে: { "Comilla": ["Debidwar", "Barura", ...], ... }
                const rawGeoData = await res.json(); 

                // জেলার তালিকা তৈরি এবং স্টেট আপডেট
                const districtNames = Object.keys(rawGeoData);
                const transformedDistricts = districtNames.map((name, index) => ({
                    id: String(index + 1), 
                    name: name
                }));

                setDistricts(transformedDistricts);
                setGeoData(rawGeoData); // মূল ডেটা ম্যাপ স্টেট-এ সেভ করা হলো
                setLoading(false);

            } catch (error) {
                console.error("Error fetching location data:", error);
                setLoading(false);
            }
        };

        fetchGeoData();
    }, []);


    // --- নির্বাচিত জেলার উপর ভিত্তি করে উপজেলা আপডেট ---
    useEffect(() => {
        if (selectedDistrict && Object.keys(geoData).length > 0) {
            const upazilaNames = geoData[selectedDistrict];
            
            if (upazilaNames && upazilaNames.length > 0) {
                // 🔥 উপজেলা নামগুলোকে JSX-এর জন্য object-এ ট্রান্সফর্ম করা হলো
                const upazilaList = upazilaNames.map((name, index) => ({
                    id: `${selectedDistrict}-${index + 1}`,
                    name: name
                }));
                setUpazilas(upazilaList);
            } else {
                setUpazilas([]);
            }
        } else {
            setUpazilas([]);
        }
    }, [selectedDistrict, geoData]); 
    
    // ... (rest of the code is unchanged)

    const updateSelectedDistrict = useCallback((districtName) => {
        setSelectedDistrict(districtName);
    }, []);

    return {
        districts, 
        upazilas, 
        loading,
        selectedDistrict,
        setSelectedDistrict: updateSelectedDistrict 
    };
};

export default useDistrictsAndUpazilas;
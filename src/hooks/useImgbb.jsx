import axios from 'axios';

// ImgBB API Key টি .env ফাইল থেকে নেওয়া হয়েছে
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY; 
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

const useImgbb = () => {
    
    // ফাইল (File Object) ইনপুট নেবে এবং ImgBB URL রিটার্ন করবে
    const uploadImage = async (imageFile) => {
        if (!imageFile) {
            console.error("No image file provided.");
            return null;
        }

        if (!IMGBB_API_KEY) {
            console.error("IMGBB API Key is missing. Check your .env file.");
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await axios.post(
                `${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // সফল হলে ImgBB থেকে পাওয়া ছবির URL রিটার্ন করা হলো
            if (response.data.success) {
                return response.data.data.url;
            } else {
                console.error("ImgBB upload failed:", response.data.error.message);
                return null;
            }

        } catch (error) {
            console.error("Error during image upload:", error);
            // axios error handling
            if (error.response) {
                console.error("ImgBB server response error:", error.response.data);
            }
            return null;
        }
    };

    return { uploadImage };
};

export default useImgbb;
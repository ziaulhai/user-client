import React, { useState, useEffect } from 'react'; 
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useAuth from '../../hooks/useAuth'; // 🔥 Path সংশোধন করা হয়েছে
import toast from 'react-hot-toast'; 

// PaymentForm কম্পোনেন্ট: props হিসেবে প্রয়োজনীয় ফাংশন এবং হুক পাচ্ছে
const PaymentForm = ({ axiosSecure, fetchFunds, closeModal }) => { 
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [price, setPrice] = useState(1); // ডিফল্ট বা সর্বনিম্ন $1
    const [processing, setProcessing] = useState(false);

    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuth();

    // 🔥 ১. useEffect ব্যবহার করে clientSecret লোড করা (যখনই মূল্য বা ইউজার পরিবর্তন হবে)
    useEffect(() => {
        // ন্যূনতম $1 নিশ্চিত করা হলো
        if (price < 1 || !user?.email || !axiosSecure) {
            setClientSecret('');
            return; 
        }

        setError('');
        setProcessing(true); // ইন্টেন্ট তৈরির সময় প্রসেসিং দেখানো

        // ব্যাকএন্ডে সেন্টে (price * 100) পাঠানো হলো (Stripe-এর জন্য)
        const amountInCents = Math.round(price * 100); 

        axiosSecure.post('/api/v1/payment/create-payment-intent', { price: amountInCents }) 
            .then(res => {
                setClientSecret(res.data.clientSecret);
                setProcessing(false); 
            })
            .catch(err => {
                console.error("Client Secret Error:", err);
                setError("পেমেন্ট ইন্টেন্ট তৈরি করা যায়নি।");
                setProcessing(false); 
            });
    }, [price, axiosSecure, user?.email]); // ডিপেন্ডেন্সিগুলি নিশ্চিত করা হলো


    // 🔥 ২. পেমেন্ট নিশ্চিতকরণ ফাংশন
    const createPaymentIntent = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || price < 1 || !clientSecret) {
            setError(clientSecret ? 'পেমেন্ট গেটওয়ে প্রস্তুত নয় বা মূল্য কম।' : 'পেমেন্ট লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।');
            return;
        }
        
        const card = elements.getElement(CardElement);

        setProcessing(true);
        setError('');

        try {
            // পেমেন্ট নিশ্চিত করা
            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                clientSecret, // useEffect থেকে প্রাপ্ত clientSecret ব্যবহার করা হলো
                {
                    payment_method: {
                        card: card,
                        billing_details: {
                            email: user?.email || 'anonymous@example.com',
                            name: user?.displayName || 'Anonymous Donor'
                        },
                    },
                },
            );

            if (confirmError) {
                setError(confirmError.message);
                setProcessing(false);
                toast.error(`পেমেন্ট ব্যর্থ: ${confirmError.message}`);
                return;
            }

            if (paymentIntent.status === "succeeded") {
                // ৩. পেমেন্ট সফল হলে ডেটাবেজে রেকর্ড সেভ করা
                const fundRecord = {
                    donorName: user.displayName || 'Anonymous Donor',
                    donorEmail: user.email,
                    amount: price, // ডেটাবেজে ডলারের পরিমাণ সেভ করা হলো
                    transactionId: paymentIntent.id,
                    fundingDate: new Date(),
                };

                // 🔥 axiosSecure ব্যবহার করে ফান্ড রেকর্ড ডেটাবেজে সেভ করা হলো
                const saveRes = await axiosSecure.post('/api/v1/funds', fundRecord); 
                
                if(saveRes.data.insertedId){
                    // ৪. সাফল্যের বার্তা দেখানো এবং ড্যাশবোর্ড আপডেট করা
                    toast.success(`সাফল্য! আপনি $${price.toFixed(2)} ফান্ড প্রদান করেছেন!`);
                    
                    // এটি আপনার অ্যাডমিন ড্যাশবোর্ড আপডেট করার জন্য ব্যবহৃত হতে পারে
                    // তবে যেহেতু এটি পাবলিক, শুধু ক্লোজ করাই যথেষ্ট
                    fetchFunds(); 
                    
                    closeModal(); // মডাল বন্ধ করা
                } else {
                    setError('পেমেন্ট সফল হয়েছে, কিন্তু ডেটাবেজে রেকর্ড সেভ হয়নি।');
                    toast.error('ডেটাবেজ সেভ ত্রুটি। অ্যাডমিনকে যোগাযোগ করুন।');
                }
            }
        } catch (err) {
            setError('পেমেন্ট প্রক্রিয়াকরণে বা ডেটা সেভ করতে ত্রুটি হয়েছে।');
            console.error('Final Transaction Error:', err);
            toast.error('অজানা ত্রুটি।');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={createPaymentIntent} className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">ফান্ডের পরিমাণ (USD)</label>
                <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={price}
                    // onChange-এ মূল্যকে কমপক্ষে $1 নিশ্চিত করা হলো
                    onChange={(e) => setPrice(Number(e.target.value) >= 1 ? Number(e.target.value) : 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="কমপক্ষে ১ ডলার"
                    required
                />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">কার্ডের তথ্য</label>
                <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-red-500">
                    <CardElement 
                        options={{
                            style: {
                                base: { fontSize: '16px' },
                            },
                        }}
                    />
                </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <button
                type="submit"
                disabled={!stripe || !elements || processing || price < 1 || !clientSecret}
                className={`w-full py-2 font-semibold rounded-lg transition ${
                    !stripe || !elements || processing || price < 1 || !clientSecret
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
                {processing 
                    ? 'প্রক্রিয়াকরণ চলছে...' 
                    : clientSecret 
                        ? `ফান্ড প্রদান করুন ($${price.toFixed(2)} USD)` 
                        : 'পেমেন্ট লোড হচ্ছে...'}
            </button>
        </form>
    );
};

export default PaymentForm;
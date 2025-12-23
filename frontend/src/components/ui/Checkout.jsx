import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ConfettiAnimation from './ConfettiAnimation';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [failureReason, setFailureReason] = useState('');
    const [successOrderId, setSuccessOrderId] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        shippingAddress: '',
        phone: '',
        email: '',
        orderType: 'PURCHASE'
    });

    useEffect(() => {
        fetchCartItems();
        loadRazorpayScript();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/cart`);
            setCartItems(response.data);
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity;
        }, 0);
        
        return Math.max(0, subtotal - appliedDiscount);
    };

    const getDiscount = () => {
        return appliedDiscount || 0;
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setCouponLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/coupons/validate`, {
                code: couponCode.trim(),
                orderAmount: cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0),
                orderType: 'PURCHASE',
                productCategory: cartItems[0]?.product?.subcategory || cartItems[0]?.product?.category
            });
            
            console.log('Coupon response:', response.data);
            setAppliedCoupon(response.data.coupon);
            setAppliedDiscount(response.data.discountAmount);
            
            const discountAmount = response.data.discountAmount || 0;
            console.log('Discount amount from response:', discountAmount);
            
            setShowConfetti(true);
            toast.success(`Coupon applied! You saved ₹${discountAmount}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setAppliedDiscount(0);
        setCouponCode('');
        toast.success('Coupon removed');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCheckout = async () => {
        if (!formData.shippingAddress || !formData.phone || !formData.email) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const checkoutData = {
                orderType: formData.orderType,
                shippingAddress: formData.shippingAddress,
                phone: formData.phone,
                email: formData.email,
                couponCode: appliedCoupon?.code || null,
                items: cartItems.map(item => ({
                    productId: item.product?.id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    customizationNotes: item.customizationNotes
                }))
            };

            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/checkout/create-order`, checkoutData);
            const { orderId, amount, currency, keyId, mockPayment } = response.data;

            if (mockPayment) {
                // Mock payment for testing
                const confirmPayment = window.confirm(
                    `Test Payment\n\nAmount: ₹${(amount / 100).toFixed(2)}\n\nUse Indian test cards:\n• 5267 3181 8797 5449 (Mastercard)\n• 4111 1111 1111 1111 (Visa - if international enabled)\n\nClick OK for mock payment or Cancel to use real Razorpay`
                );
                
                if (confirmPayment) {
                    await verifyPayment({
                        razorpay_order_id: orderId,
                        razorpay_payment_id: 'pay_mock_' + Date.now(),
                        razorpay_signature: 'mock_signature'
                    });
                }
            } else {
                // Real Razorpay payment
                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency,
                    name: 'Pradha Fashion Outlet',
                    description: 'Order Payment',
                    order_id: orderId,
                    handler: async function (response) {
                        await verifyPayment(response);
                    },
                    modal: {
                        ondismiss: function() {
                            setFailureReason('Payment was cancelled by user');
                            setShowFailureModal(true);
                        }
                    },
                    prefill: {
                        name: formData.name,
                        email: formData.email,
                        contact: formData.phone
                    },
                    theme: {
                        color: '#3399cc'
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            const errorMsg = error.response?.data?.error || 'Failed to create order. Please try again.';
            setFailureReason(errorMsg);
            setShowFailureModal(true);
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentResponse) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/checkout/verify-payment`, {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
            });
            
            setSuccessOrderId(response.data.orderId || 'N/A');
            setShowSuccessModal(true);
            
            // Clear cart after successful payment
            setCartItems([]);
        } catch (error) {
            console.error('Payment verification failed:', error);
            const errorMsg = error.response?.data?.error || 'Payment verification failed. Please contact support.';
            setFailureReason(errorMsg);
            setShowFailureModal(true);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        navigate('/orders');
    };

    const handleFailureClose = () => {
        setShowFailureModal(false);
        setFailureReason('');
    };

    const handleRetryPayment = () => {
        setShowFailureModal(false);
        setFailureReason('');
        handleCheckout();
    };

    return (
        <>
            <ConfettiAnimation 
                show={showConfetti} 
                onComplete={() => setShowConfetti(false)} 
            />
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
                        <div className="text-green-500 text-6xl mb-4 animate-bounce">✓</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 mb-2">Your order has been confirmed and will be processed soon.</p>
                        <p className="text-sm text-gray-500 mb-6">Order ID: {successOrderId}</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleSuccessClose}
                                className="w-full bg-[#8B1538] text-white px-6 py-3 rounded-lg hover:bg-[#6B0F2A] font-semibold"
                            >
                                View My Orders
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full border border-[#8B1538] text-[#8B1538] px-6 py-2 rounded-lg hover:bg-[#8B1538] hover:text-white"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Failure Modal */}
            {showFailureModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
                        <div className="text-red-500 text-6xl mb-4">✗</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed!</h2>
                        <p className="text-gray-600 mb-2">Your payment could not be processed.</p>
                        <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded">{failureReason}</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleRetryPayment}
                                className="w-full bg-[#8B1538] text-white px-6 py-3 rounded-lg hover:bg-[#6B0F2A] font-semibold"
                            >
                                Retry Payment
                            </button>
                            <button
                                onClick={handleFailureClose}
                                className="w-full border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-500">Need help?</p>
                                <a href="https://wa.me/917972177226" target="_blank" rel="noopener noreferrer" className="text-[#8B1538] hover:underline text-sm">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                            <div>
                                <p className="font-medium">{item.product?.name}</p>
                                {item.product?.subcategory !== 'Jewellery' && (
                                    <p className="text-sm text-gray-600">Size: {item.size}, Color: {item.color}</p>
                                )}
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{(item.product?.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t space-y-2">
                        {appliedCoupon && (
                            <>
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>₹{cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedCoupon.code}):</span>
                                    <span>-₹{getDiscount().toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total: ₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                    
                    {/* Coupon Section */}
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="font-semibold mb-3">Have a coupon?</h3>
                        {!appliedCoupon ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    className="flex-1 p-2 border rounded"
                                />
                                <button
                                    onClick={applyCoupon}
                                    disabled={couponLoading}
                                    className="bg-[#8B1538] text-white px-4 py-2 rounded hover:bg-[#6B0F2A] disabled:opacity-50"
                                >
                                    {couponLoading ? 'Applying...' : 'Apply'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                                <div>
                                    <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                                    <p className="text-sm text-green-600">You saved ₹{getDiscount().toFixed(2)}!</p>
                                </div>
                                <button
                                    onClick={removeCoupon}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Shipping Address *</label>
                            <textarea
                                name="shippingAddress"
                                value={formData.shippingAddress}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={loading || cartItems.length === 0}
                            className="w-full bg-[#8B1538] text-white py-3 rounded-lg font-semibold hover:bg-[#6B0F2A] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                `Pay ₹${calculateTotal().toFixed(2)}`
                            )}
                        </button>
                    </form>
                </div>
            </div>
            </div>
        </>
    );
};

export default Checkout;
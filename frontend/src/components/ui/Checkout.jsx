import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
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
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/cart`);
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
        return cartItems.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity;
        }, 0);
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
                items: cartItems.map(item => ({
                    productId: item.product?.id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    customizationNotes: item.customizationNotes
                }))
            };

            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/checkout/create-order`, checkoutData);
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
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentResponse) => {
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/checkout/verify-payment`, {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
            });
            
            alert('Payment successful! Your order has been confirmed.');
            // Clear cart and redirect
            window.location.href = '/orders';
        } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
        }
    };

    return (
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
                                <p className="text-sm text-gray-600">Size: {item.size}, Color: {item.color}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{(item.product?.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total: ₹{calculateTotal().toFixed(2)}</span>
                        </div>
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
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay ₹${calculateTotal().toFixed(2)}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
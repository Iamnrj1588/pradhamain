import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/cart`);
            setCartItems(response.data);
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/cart/${itemId}?quantity=${newQuantity}`);
            fetchCartItems();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/cart/${itemId}`);
            fetchCartItems();
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity;
        }, 0);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        navigate('/checkout');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading cart...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            
            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Continue Shopping
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center space-x-4">
                                {item.product?.images && item.product.images.length > 0 && (
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-20 h-20 object-contain rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{item.product?.name}</h3>
                                    <p className="text-gray-600">Size: {item.size} | Color: {item.color}</p>
                                    <p className="text-lg font-bold text-blue-600">₹{item.product?.price}</p>
                                    {item.customizationNotes && (
                                        <p className="text-sm text-gray-500">Note: {item.customizationNotes}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">₹{(item.product?.price * item.quantity).toFixed(2)}</p>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-600 hover:text-red-800 text-sm mt-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xl font-semibold">Total: ₹{calculateTotal().toFixed(2)}</span>
                            <button
                                onClick={handleCheckout}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
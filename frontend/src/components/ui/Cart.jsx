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
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/cart`);
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
            await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/cart/${itemId}?quantity=${newQuantity}`);
            fetchCartItems();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/cart/${itemId}`);
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>
            
            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <a href="/" className="bg-[#8B1538] text-white px-6 py-2 rounded-lg hover:bg-[#6B0F2A]">
                        Continue Shopping
                    </a>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                {item.product?.images && item.product.images.length > 0 && (
                                    <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-2">{item.product?.name}</h3>
                                    {item.product?.subcategory !== 'Jewellery' && (
                                        <p className="text-gray-600 text-sm mb-1">Size: {item.size} | Color: {item.color}</p>
                                    )}
                                    <p className="text-lg font-bold text-[#8B1538] mb-2">₹{item.product?.price}</p>
                                    {item.customizationNotes && (
                                        <p className="text-sm text-gray-500">Note: {item.customizationNotes}</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end space-y-2">
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
                                        <p className="text-lg font-bold mb-1">₹{(item.product?.price * item.quantity).toFixed(2)}</p>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                            <span className="text-xl font-semibold">Total: ₹{calculateTotal().toFixed(2)}</span>
                            <button
                                onClick={handleCheckout}
                                className="w-full sm:w-auto bg-[#8B1538] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6B0F2A]"
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
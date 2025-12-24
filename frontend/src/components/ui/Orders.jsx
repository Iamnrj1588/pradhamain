import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'}/api/checkout/orders`);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PAID: 'bg-green-100 text-green-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            SHIPPED: 'bg-purple-100 text-purple-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading orders...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">My Orders</h1>
            
            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No orders found</p>
                    <a href="/" className="text-blue-600 hover:underline mt-2 inline-block">
                        Continue Shopping
                    </a>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                                <div>
                                    <h3 className="text-lg font-semibold">Order #{order.id.slice(-8)}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Type: {order.orderType}
                                        {order.rentalDays && ` (${order.rentalDays} days)`}
                                    </p>
                                </div>
                                <div className="flex sm:flex-col sm:text-right items-center sm:items-end justify-between sm:justify-start">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <p className="text-lg font-bold sm:mt-2">₹{order.totalAmount}</p>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        <strong>Shipping Address:</strong><br className="sm:hidden" />
                                        <span className="sm:ml-1">{order.shippingAddress}</span>
                                    </p>
                                    <p>
                                        <strong>Contact:</strong><br className="sm:hidden" />
                                        <span className="sm:ml-1">{order.phone} | {order.email}</span>
                                    </p>
                                    {order.rentalStartDate && (
                                        <p>
                                            <strong>Rental Period:</strong><br className="sm:hidden" />
                                            <span className="sm:ml-1">{order.rentalStartDate} to {order.rentalEndDate}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
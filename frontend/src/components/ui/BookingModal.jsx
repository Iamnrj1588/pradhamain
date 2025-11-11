import React, { useState } from 'react';
import { X, Calendar, User, CreditCard } from 'lucide-react';

const BookingModal = ({ dress, isOpen, onClose, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    selectedSize: '',
    chestMeasurement: '',
    waistMeasurement: '',
    hipMeasurement: '',
    customerNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return days * dress.pricePerDay;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user from localStorage (assuming user is logged in)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_URL}/api/rental/bookings?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dressId: dress.id,
          ...formData
        })
      });

      if (response.ok) {
        const booking = await response.json();
        onBookingSuccess(booking);
        onClose();
        setFormData({
          startDate: '',
          endDate: '',
          selectedSize: '',
          chestMeasurement: '',
          waistMeasurement: '',
          hipMeasurement: '',
          customerNotes: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Booking failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book Dress</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dress Info */}
        <div className="p-6 border-b">
          <div className="flex space-x-4">
            {dress.imageUrls && dress.imageUrls[0] && (
              <img
                src={dress.imageUrls[0]}
                alt={dress.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{dress.name}</h3>
              <p className="text-pink-600 font-bold">₹{dress.pricePerDay}/day</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Size
            </label>
            <select
              required
              value={formData.selectedSize}
              onChange={(e) => setFormData({...formData, selectedSize: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Choose Size</option>
              {dress.availableSizes && dress.availableSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Measurements */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Measurements (for customization)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Chest (inches)"
                  value={formData.chestMeasurement}
                  onChange={(e) => setFormData({...formData, chestMeasurement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Waist (inches)"
                  value={formData.waistMeasurement}
                  onChange={(e) => setFormData({...formData, waistMeasurement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Hip (inches)"
                  value={formData.hipMeasurement}
                  onChange={(e) => setFormData({...formData, hipMeasurement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Optional: Provide measurements for better fitting</p>
          </div>

          {/* Customer Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={formData.customerNotes}
              onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Any special requests or notes..."
            />
          </div>

          {/* Total Amount */}
          {formData.startDate && formData.endDate && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-pink-600">₹{calculateTotal()}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
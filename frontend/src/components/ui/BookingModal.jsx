import React, { useState, useEffect } from 'react';
import { X, Calendar, User, CreditCard, CheckCircle, Tag } from 'lucide-react';
import ConfettiAnimation from './ConfettiAnimation';

const BookingModal = ({ dress, isOpen, onClose, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    selectedSize: '',
    chestMeasurement: '',
    waistMeasurement: '',
    hipMeasurement: '',
    customerNotes: '',
    requiresDelivery: false,
    deliveryAddress: '',
    couponCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset coupon state when dress changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCouponDiscount(0);
      setCouponMessage('');
      setAppliedCoupon(null);
      setFormData(prev => ({...prev, couponCode: ''}));
    }
  }, [dress?.id, isOpen]);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081';

  const calculateSubtotal = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const timeDiff = end - start;
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    return days * dress.pricePerDay;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - couponDiscount);
  };

  const applyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: formData.couponCode,
          orderAmount: calculateSubtotal(),
          orderType: 'RENTAL',
          productCategory: dress.subcategory || dress.category
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discountAmount);
        setCouponMessage(`Coupon applied! You saved ₹${result.discountAmount}`);
        setShowConfetti(true);
      } else {
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponMessage(result.error || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage('Failed to validate coupon');
    }
  };

  const removeCoupon = () => {
    setFormData({...formData, couponCode: ''});
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user from localStorage (assuming user is logged in)
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!user || !user.id) {
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`${API_URL}/api/rental/bookings?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dressId: dress.id,
          ...formData,
          couponCode: appliedCoupon?.code || null
        })
      });

      if (response.ok) {
        const booking = await response.json();
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onBookingSuccess(booking);
          onClose();
          setFormData({
            startDate: '',
            endDate: '',
            selectedSize: '',
            chestMeasurement: '',
            waistMeasurement: '',
            hipMeasurement: '',
            customerNotes: '',
            requiresDelivery: false,
            deliveryAddress: ''
          });
        }, 2000);
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

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Successful!</h3>
          <p className="text-gray-600">You will receive a confirmation email shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfettiAnimation 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
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

        {/* Delivery Notice */}
        <div className="p-6 border-b bg-yellow-50">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">📦</span>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Delivery & Pickup Note:</h4>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Rental delivery and pickup are not included in the rental price. 
                If you require home delivery or pickup, additional charges will apply based on location and distance. 
                Our team will contact you after booking to confirm delivery availability and charges.
              </p>
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

          {/* Size Selection - Hidden for Jewellery */}
          {dress.subcategory !== 'Jewellery' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Size
              </label>
              <select
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
          )}

          {/* Measurements - Hidden for Jewellery */}
          {dress.subcategory !== 'Jewellery' && (
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
          )}

          {/* Delivery Option */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.requiresDelivery}
                onChange={(e) => setFormData({...formData, requiresDelivery: e.target.checked, deliveryAddress: e.target.checked ? formData.deliveryAddress : ''})}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm font-medium text-gray-700">I require home delivery/pickup (additional charges apply)</span>
            </label>
          </div>

          {/* Delivery Address */}
          {formData.requiresDelivery && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address (Optional)
              </label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter your complete address for delivery/pickup..."
              />
            </div>
          )}

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

          {/* Coupon Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline w-4 h-4 mr-1" />
              Coupon Code (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.couponCode}
                onChange={(e) => setFormData({...formData, couponCode: e.target.value.toUpperCase()})}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={appliedCoupon}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-4 py-2 bg-[#8B1538] text-white rounded-md hover:bg-[#6B0F2A] transition duration-200"
                >
                  Apply
                </button>
              )}
            </div>
            {couponMessage && (
              <p className={`text-sm mt-1 ${couponDiscount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {couponMessage}
              </p>
            )}
          </div>

          {/* Total Amount */}
          {formData.startDate && formData.endDate && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Coupon Discount:</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-pink-600">₹{calculateTotal()}</span>
                  </div>
                </div>
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
    </>
  );
};

export default BookingModal;
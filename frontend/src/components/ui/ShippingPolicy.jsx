import { useState, useEffect } from 'react';
import Loader from './Loader';

const ShippingPolicyPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">Shipping Policy</h1>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-left">
        <p className="text-sm text-gray-500">Last Updated: 09/12/2025</p>
        
        <p className="text-lg">
          At Pradha Fashion Outlet, we are committed to delivering your orders safely and on time. Please review our shipping policy below.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Shipping Areas</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>We currently ship across India</li>
            <li>Local delivery available in our service area</li>
            <li>International shipping may be available on request</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Processing Time</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Ready-to-ship items: 1-2 business days</li>
            <li>Customized items: 7-15 business days (depending on complexity)</li>
            <li>Rental items: Same day or next day pickup/delivery</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Delivery Time</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Local delivery: 1-2 days</li>
            <li>Within state: 3-5 business days</li>
            <li>Other states: 5-7 business days</li>
            <li>Remote areas: 7-10 business days</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Shipping Charges</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Free shipping on orders above ₹2000</li>
            <li>Standard shipping: ₹100-200 (based on location and weight)</li>
            <li>Express delivery: Additional charges apply</li>
            <li>Cash on Delivery: ₹50 extra charges</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Order Tracking</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>You will receive tracking details via SMS/Email once shipped</li>
            <li>Track your order using the provided tracking number</li>
            <li>Contact us for any delivery-related queries</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Delivery Guidelines</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Please ensure someone is available to receive the package</li>
            <li>Verify the package condition before accepting delivery</li>
            <li>Report any damage or missing items immediately</li>
            <li>Provide accurate delivery address and contact details</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Special Circumstances</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Delays may occur during festivals, monsoons, or unforeseen events</li>
            <li>We are not responsible for delays caused by courier partners</li>
            <li>Customized orders may require additional time for quality assurance</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Contact for Shipping Queries</h2>
          <p className="mb-3">For any shipping-related questions, contact us:</p>
          <div className="space-y-2">
            <p>📧 <a href="mailto:pradhafashionoutlet@gmail.com" className="text-[#8B1538] hover:underline">pradhafashionoutlet@gmail.com</a></p>
            <p>📞 <a href="tel:+918308721599" className="text-[#8B1538] hover:underline">8308721599</a></p>
            <p>📱 <a href="https://wa.me/917972177226" className="text-[#8B1538] hover:underline">WhatsApp: 7972177226</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
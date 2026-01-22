import { useState, useEffect } from 'react';
import Loader from './Loader';

const RefundPolicyPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <h1 className="page-title">Refund & Cancellation Policy</h1>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-left">
        <p className="text-sm text-gray-500">Last Updated: 09/12/2025</p>
        
        <p className="text-lg">
          At Pradha Fashion Outlet, we want you to be completely satisfied with your purchase. Please read our refund and cancellation policy carefully.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Customized Products</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong>Non-refundable:</strong> All customized items (lehengas, blouses, tailored outfits) are made specifically for you and cannot be returned or refunded.</li>
            <li><strong>Measurement responsibility:</strong> Please ensure accurate measurements are provided. We are not responsible for fitting issues due to incorrect measurements.</li>
            <li><strong>Design changes:</strong> Once production begins, design changes are not possible.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Ready-to-Wear Products</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong>Return window:</strong> 7 days from delivery date</li>
            <li><strong>Condition:</strong> Items must be unused, unwashed, with original tags</li>
            <li><strong>Refund process:</strong> Refunds processed within 5-7 business days after item inspection</li>
            <li><strong>Return shipping:</strong> Customer bears return shipping costs unless item is defective</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Rental Items</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong>Non-refundable:</strong> Rental fees are non-refundable once booking is confirmed</li>
            <li><strong>Cancellation:</strong> 48 hours notice required for cancellation</li>
            <li><strong>Damage charges:</strong> Additional charges apply for damages beyond normal wear</li>
            <li><strong>Late return:</strong> Extra charges for late returns as per rental agreement</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Order Cancellation</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong>Before production:</strong> Full refund if cancelled before work begins</li>
            <li><strong>During production:</strong> Partial refund based on work completed</li>
            <li><strong>Ready products:</strong> Can be cancelled before shipping for full refund</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Defective Products</h2>
          <ul className="space-y-2 list-disc pl-6">
            <li>Manufacturing defects reported within 48 hours of delivery</li>
            <li>Full refund or replacement provided for genuine defects</li>
            <li>Photo evidence required for defect claims</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Refund Process</h2>
          <ol className="space-y-2 list-decimal pl-6">
            <li>Contact us at pradhafashionoutlet@gmail.com with order details</li>
            <li>Return authorization will be provided if eligible</li>
            <li>Ship item back with provided return label</li>
            <li>Refund processed after item inspection (5-7 business days)</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#8B1538] mb-4">Contact for Returns</h2>
          <div className="space-y-2">
            <p>📧 <a href="mailto:pradhafashionoutlet@gmail.com" className="text-[#8B1538] hover:underline">pradhafashionoutlet@gmail.com</a></p>
            <p>📞 <a href="tel:+918308721599" className="text-[#8B1538] hover:underline">+91 83087 21599</a></p>
            <p>💬 <a href="https://wa.me/917972177226" target="_blank" rel="noopener noreferrer" className="text-[#8B1538] hover:underline">WhatsApp Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
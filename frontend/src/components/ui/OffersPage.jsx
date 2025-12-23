import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Tag, Clock } from 'lucide-react';
import { toast } from 'sonner';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081'}/api/coupons/offers`);
      setOffers(response.data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied!`);
  };

  const getApplicabilityText = (offer) => {
    switch (offer.applicableTo) {
      case 'PURCHASE_ONLY': return 'Purchase Items Only';
      case 'RENTAL_ONLY': return 'Rental Items Only';
      case 'SPECIFIC_CATEGORY': return `${offer.specificCategory} Only`;
      case 'SPECIFIC_PRODUCT': return 'Specific Product';
      default: return 'All Products';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Special Offers & Coupons</h1>
      
      {offers.length > 0 ? (
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <Card key={offer.id} className="border-2 border-[#8B1538]/20 hover:border-[#8B1538]/40 transition-colors">
              <CardHeader className="bg-gradient-to-r from-[#8B1538]/10 to-[#DAA520]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#8B1538]" />
                    <CardTitle className="text-[#8B1538]">{offer.code}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-[#DAA520] text-white">
                    {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">{offer.description || 'Special discount offer'}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Applicable to:</span>
                    <span>{getApplicabilityText(offer)}</span>
                  </div>
                  
                  {offer.minOrderAmount && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Min order:</span>
                      <span>₹{offer.minOrderAmount}</span>
                    </div>
                  )}
                  
                  {offer.maxDiscount && offer.discountType === 'PERCENTAGE' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Max discount:</span>
                      <span>₹{offer.maxDiscount}</span>
                    </div>
                  )}
                  
                  {offer.validUntil && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => copyToClipboard(offer.code)}
                  className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code: {offer.code}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Offers</h3>
          <p className="text-gray-500">Check back later for exciting deals and discounts!</p>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
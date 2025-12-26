import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import BookingModal from './BookingModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081';

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dress, setDress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchDress();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchDress = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rental/dresses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDress(data);
      } else {
        toast.error('Dress not found');
        navigate('/rentals');
      }
    } catch (error) {
      console.error('Failed to fetch dress:', error);
      toast.error('Failed to load dress details');
      navigate('/rentals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!dress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dress Not Found</h2>
          <Button onClick={() => navigate('/rentals')} className="bg-pink-600 hover:bg-pink-700">
            Back to Rentals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 text-pink-600 hover:bg-pink-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Dress Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              {dress.imageUrls && dress.imageUrls.length > 0 ? (
                <img
                  src={dress.imageUrls[selectedImage]}
                  alt={dress.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Image Available</span>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {dress.imageUrls && dress.imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {dress.imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${dress.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dress Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-pink-600 text-white">{dress.subcategory}</Badge>
                {dress.category && (
                  <Badge variant="outline" className="border-pink-600 text-pink-600">{dress.category}</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{dress.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{dress.category} • {dress.subcategory}</p>
              <div className="flex items-center gap-2 mb-6">
                <p className="text-3xl font-bold text-pink-600">₹{dress.pricePerDay}</p>
                <span className="text-gray-500">per day</span>
              </div>
            </div>

            {/* Description */}
            {dress.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{dress.description}</p>
              </div>
            )}

            {/* Available Sizes */}
            {dress.subcategory !== 'Jewellery' && dress.availableSizes && dress.availableSizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {dress.availableSizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Important Fitting Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start">
                <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">IMPORTANT FITTING NOTICE</p>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    For the best fitting, we request you to visit our store for a trial. If you're sure about the sizes you gave, we can alter the dress as per your measurements.
                  </p>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <div className="pt-4">
              <Button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg"
                size="lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Now
              </Button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">Category:</span>
                  <p className="text-gray-600">{dress.category}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Occasion:</span>
                  <p className="text-gray-600">{dress.subcategory}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Rental Rate:</span>
                  <p className="text-gray-600">₹{dress.pricePerDay} per day</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Availability:</span>
                  <p className="text-green-600 font-medium">Available for booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          dress={dress}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={(booking) => {
            toast.success('Booking successful! You will receive a confirmation email shortly.');
            setShowBookingModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default RentalDetail;
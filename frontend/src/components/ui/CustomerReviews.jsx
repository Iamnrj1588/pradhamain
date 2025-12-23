import React, { useState, useEffect } from 'react';
import { Star, Upload, X, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';
const API = `${BACKEND_URL}/api`;

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API}/feedback`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create feedback
      const feedbackResponse = await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (feedbackResponse.ok) {
        const feedback = await feedbackResponse.json();

        // Upload images if any
        if (selectedImages.length > 0) {
          const formDataImages = new FormData();
          selectedImages.forEach(image => {
            formDataImages.append('images', image);
          });

          await fetch(`${API}/feedback/${feedback.id}/images`, {
            method: 'POST',
            body: formDataImages
          });
        }

        setFormData({ name: '', email: '', rating: 5, comment: '' });
        setSelectedImages([]);
        setShowForm(false);
        setShowThankYou(true);
        fetchReviews();
        setTimeout(() => setShowThankYou(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files].slice(0, 3));
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${
          interactive ? 'cursor-pointer hover:text-yellow-400' : ''
        }`}
        onClick={interactive ? () => onRate(i + 1) : undefined}
      />
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {renderStars(formData.rating, true, (rating) => setFormData({...formData, rating}))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                placeholder="Share your experience with us..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">Max 3 images</span>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{review.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{review.comment}</p>
            
            {review.imageUrls && review.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {review.imageUrls.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setLightboxImage(imageUrl)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-8 overflow-auto" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-none max-h-none" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Review" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 bg-white text-black rounded-full p-2 hover:bg-gray-200 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">Your review has been submitted successfully. We appreciate your feedback!</p>
            <button
              onClick={() => setShowThankYou(false)}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;
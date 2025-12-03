import React, { useState, useEffect } from 'react';
import { Star, Upload, X } from 'lucide-react';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/feedback`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create feedback
      const feedbackResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/feedback`, {
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

          await fetch(`${process.env.REACT_APP_API_URL}/api/feedback/${feedback.id}/images`, {
            method: 'POST',
            body: formDataImages
          });
        }

        setFormData({ customerName: '', rating: 5, comment: '' });
        setSelectedImages([]);
        setShowForm(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files].slice(0, 5));
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
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
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
                <span className="text-sm text-gray-500">Max 5 images</span>
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
                <h3 className="font-semibold text-lg">{review.customerName}</h3>
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
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => window.open(imageUrl, '_blank')}
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
    </div>
  );
};

export default CustomerReviews;
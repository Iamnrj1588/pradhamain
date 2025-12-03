import React, { useState, useEffect } from 'react';
import { Star, Upload, X } from 'lucide-react';

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    comment: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/feedback`);
      const data = await response.json();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedFeedback = await response.json();
        
        if (formData.images.length > 0) {
          const imageFormData = new FormData();
          formData.images.forEach(image => {
            imageFormData.append('images', image);
          });

          await fetch(`${API_URL}/api/feedback/${savedFeedback.id}/images`, {
            method: 'POST',
            body: imageFormData
          });
        }

        alert('Feedback submitted successfully!');
        setFormData({ name: '', email: '', rating: 0, comment: '', images: [] });
        setShowForm(false);
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'hover:text-yellow-400'}`}
            onClick={() => !readonly && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Feedback</h1>
          <p className="text-lg text-gray-600">Share your experience with us</p>
        </div>

        <div className="mb-8 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition duration-200"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating 
                  rating={formData.rating} 
                  onRatingChange={(rating) => setFormData({...formData, rating})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Share your experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {formData.images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 transition duration-200"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Customer Reviews</h2>
          {feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{feedback.name}</h3>
                    <StarRating rating={feedback.rating} readonly />
                  </div>
                  <p className="text-gray-600 mb-3">{feedback.comment}</p>
                  {feedback.imageUrls && feedback.imageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {feedback.imageUrls.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Feedback ${index}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedback;
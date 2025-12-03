import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Eye, CheckCircle, XCircle } from 'lucide-react';

const RentalImageSlider = ({ dress }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = dress.imageUrls || [];

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="h-48 bg-[#F5F5DC] flex items-center justify-center text-[#8B1538]">
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">No Image</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-48 bg-[#F5F5DC] overflow-hidden">
      <img
        src={images[currentImageIndex]}
        alt={dress.name}
        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdminRentalDashboard = () => {
  const [activeTab, setActiveTab] = useState('dresses');
  const [dresses, setDresses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddDress, setShowAddDress] = useState(false);
  const [editingDress, setEditingDress] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

  useEffect(() => {
    if (activeTab === 'dresses') {
      fetchDresses();
    } else {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchDresses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/rental/dresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching dresses:', error);
      setDresses([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rental/bookings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/rental/bookings/${bookingId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
          <p className="text-gray-600">Manage rental dresses and bookings</p>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dresses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dresses'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dresses ({dresses.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Bookings ({bookings.length})
            </button>
          </nav>
        </div>

        {activeTab === 'dresses' ? (
          <DressesTab 
            dresses={dresses}
            onAddDress={() => setShowAddDress(true)}
            onEditDress={setEditingDress}
            onRefresh={fetchDresses}
          />
        ) : (
          <BookingsTab 
            bookings={bookings}
            onUpdateStatus={updateBookingStatus}
          />
        )}

        {(showAddDress || editingDress) && (
          <DressModal
            dress={editingDress}
            onClose={() => {
              setShowAddDress(false);
              setEditingDress(null);
            }}
            onSuccess={() => {
              fetchDresses();
              setShowAddDress(false);
              setEditingDress(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const DressesTab = ({ dresses, onAddDress, onEditDress, onRefresh }) => {
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onAddDress}
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Dress
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(dresses || []).map((dress) => (
          <div key={dress.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <RentalImageSlider dress={dress} />
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{dress.name}</h3>
              <p className="text-pink-600 font-bold mb-2">₹{dress.pricePerDay}/day</p>
              <p className="text-sm text-gray-600 mb-1">{dress.category} • {dress.subcategory}</p>
              <p className="text-xs text-gray-500 mb-1">{dress.color}</p>
              {(dress.chest || dress.waist || dress.hip) && (
                <p className="text-xs text-gray-500 mb-3">
                  {dress.chest && `Chest: ${dress.chest}`}
                  {dress.waist && ` | Waist: ${dress.waist}`}
                  {dress.hip && ` | Hip: ${dress.hip}`}
                </p>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => onEditDress(dress)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <span className={`px-2 py-1 rounded text-xs ${
                  dress.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {dress.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingsTab = ({ bookings, onUpdateStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dates
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                  <div className="text-sm text-gray-500">{booking.user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{booking.dress.name}</div>
                <div className="text-sm text-gray-500">Size: {booking.selectedSize}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {booking.startDate} to {booking.endDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ₹{booking.totalAmount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {booking.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DressModal = ({ dress, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: dress?.name || '',
    description: dress?.description || '',
    pricePerDay: dress?.pricePerDay || '',
    category: dress?.category || "Women's Festival",
    subcategory: dress?.subcategory || 'Navratri',
    occasion: dress?.occasion || '',
    color: dress?.color || '',
    availableSizes: dress?.availableSizes || [],
    chest: dress?.chest || '',
    waist: dress?.waist || '',
    hip: dress?.hip || '',
    available: dress?.available ?? true
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = dress 
        ? `${API_URL}/api/admin/rental/dresses/${dress.id}`
        : `${API_URL}/api/admin/rental/dresses`;
      
      const method = dress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedDress = await response.json();
        
        if (images.length > 0) {
          console.log('Uploading images for dress ID:', savedDress.id);
          const imageFormData = new FormData();
          images.forEach(image => {
            imageFormData.append('images', image);
          });

          const imageUploadUrl = `${API_URL}/api/admin/rental/dresses/${savedDress.id}/images`;
          console.log('Image upload URL:', imageUploadUrl);
          
          const imageResponse = await fetch(imageUploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: imageFormData
          });
          
          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error('Image upload failed:', imageResponse.status, errorText);
            throw new Error(`Image upload failed: ${imageResponse.status} ${errorText}`);
          }
          
          console.log('Images uploaded successfully');
        }

        onSuccess();
      }
    } catch (error) {
      console.error('Error saving dress:', error);
      alert('Failed to save dress. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {dress ? 'Edit Dress' : 'Add New Dress'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Day (₹)
                </label>
                <input
                  type="number"
                  required
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Women's Festival">Women's Festival</option>
                  <option value="Women's Wedding">Women's Wedding</option>
                  <option value="Women's Party">Women's Party</option>
                  <option value="Women's Traditional">Women's Traditional</option>
                  <option value="Women's Blouses">Women's Blouses</option>
                  <option value="Women's Maternity">Women's Maternity</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Men's Wedding">Men's Wedding</option>
                  <option value="Men's Party">Men's Party</option>
                  <option value="Men's Traditional">Men's Traditional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occasion
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {formData.category === "Women's Festival" && (
                    <>
                      <option value="Navratri">Navratri</option>
                      <option value="Diwali">Diwali</option>
                      <option value="Holi">Holi</option>
                      <option value="Karva Chauth">Karva Chauth</option>
                    </>
                  )}
                  {formData.category === "Women's Wedding" && (
                    <>
                      <option value="Wedding">Wedding</option>
                      <option value="Pre-Wedding">Pre-Wedding</option>
                      <option value="Reception">Reception</option>
                      <option value="Sangam">Sangam</option>
                      <option value="Mehendi">Mehendi</option>
                      <option value="Haldi">Haldi</option>
                    </>
                  )}
                  {formData.category === "Women's Party" && (
                    <>
                      <option value="Party">Party</option>
                      <option value="Cocktail">Cocktail</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                    </>
                  )}
                  {formData.category === "Women's Traditional" && (
                    <>
                      <option value="Puja">Puja</option>
                      <option value="Temple Visit">Temple Visit</option>
                      <option value="Cultural Event">Cultural Event</option>
                    </>
                  )}
                  {formData.category === "Women's Blouses" && (
                    <>
                      <option value="Designer Blouses">Designer Blouses</option>
                    </>
                  )}
                  {formData.category === "Women's Maternity" && (
                    <>
                      <option value="Maternity Outfits">Maternity Outfits</option>
                    </>
                  )}
                  {formData.category === "Jewellery" && (
                    <>
                      <option value="Jewellery">Jewellery</option>
                    </>
                  )}
                  {formData.category === "Men's Wedding" && (
                    <>
                      <option value="Wedding Outfit">Wedding Outfit</option>
                      <option value="Reception Outfit">Reception Outfit</option>
                    </>
                  )}
                  {formData.category === "Men's Party" && (
                    <>
                      <option value="Party Wears">Party Wears</option>
                    </>
                  )}
                  {formData.category === "Men's Traditional" && (
                    <>
                      <option value="Traditional Outfits">Traditional Outfits</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                value={Array.isArray(formData.availableSizes) ? formData.availableSizes.join(', ') : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const sizes = value ? value.split(',').map(s => s.trim()).filter(s => s) : [];
                  setFormData({ ...formData, availableSizes: sizes });
                }}
                placeholder="S, M, L, XL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chest (inches)
                </label>
                <input
                  type="text"
                  value={formData.chest || ''}
                  onChange={(e) => setFormData({...formData, chest: e.target.value})}
                  placeholder="32-34"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waist (inches)
                </label>
                <input
                  type="text"
                  value={formData.waist || ''}
                  onChange={(e) => setFormData({...formData, waist: e.target.value})}
                  placeholder="26-28"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hip (inches)
                </label>
                <input
                  type="text"
                  value={formData.hip || ''}
                  onChange={(e) => setFormData({...formData, hip: e.target.value})}
                  placeholder="36-38"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    setImages(prev => [...prev, ...files]);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img src={URL.createObjectURL(file)} alt={`Image ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Available for rent</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (dress ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRentalDashboard;
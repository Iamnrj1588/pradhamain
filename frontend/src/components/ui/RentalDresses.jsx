import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Filter, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingModal from './BookingModal';

const RentalDresses = () => {
  const [dresses, setDresses] = useState([]);
  const [filteredDresses, setFilteredDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedDress, setSelectedDress] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://localhost:8081';

  useEffect(() => {
    fetchDresses();
  }, []);

  useEffect(() => {
    // Check for subcategory parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const subcategoryParam = urlParams.get('subcategory');
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
      // Apply filter immediately when dresses are loaded
      if (dresses.length > 0) {
        applyFilters('', subcategoryParam);
      }
    }
  }, [dresses]);

  useEffect(() => {
    if (selectedSubcategory && dresses.length > 0) {
      applyFilters('', selectedSubcategory);
    }
  }, [selectedSubcategory, dresses]);

  const fetchDresses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rental/dresses`);
      const data = await response.json();
      setDresses(Array.isArray(data) ? data : []);
      setFilteredDresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching dresses:', error);
      setDresses([]);
      setFilteredDresses([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setFilteredDresses(Array.isArray(dresses) ? dresses : []);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/rental/dresses/available?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setFilteredDresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error checking availability:', error);
      setFilteredDresses([]);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(''); // Reset subcategory when category changes
    applyFilters(category, '');
  };

  const filterBySubcategory = (subcategory) => {
    console.log('Filtering by subcategory:', subcategory);
    console.log('Available dresses:', dresses.map(d => ({ name: d.name, subcategory: d.subcategory })));
    setSelectedSubcategory(subcategory);
    setSelectedCategory(''); // Reset category filter when filtering by subcategory
    applyFilters('', subcategory);
  };

  const applyFilters = (category, subcategory) => {
    let filtered = Array.isArray(dresses) ? dresses : [];
    
    if (category && category !== '') {
      filtered = filtered.filter(dress => dress.category === category);
    }
    
    if (subcategory && subcategory !== '') {
      filtered = filtered.filter(dress => dress.subcategory === subcategory);
    }
    
    setFilteredDresses(filtered);
  };

  const categories = [...new Set((dresses || []).map(dress => dress.category))];
  const subcategories = selectedCategory 
    ? [...new Set((dresses || []).filter(dress => dress.category === selectedCategory).map(dress => dress.subcategory))]
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Outfit Rentals</h1>
          <p className="text-lg text-gray-600">Rent beautiful outfits for your special occasions - Women's & Men's Collections</p>
        </div>

        {/* Important Fitting Notice */}
        <div className="mb-8">
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
        </div>

        {/* Mobile Category Menu */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setShowMobileCategories(!showMobileCategories)}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg flex items-center justify-between"
          >
            <span>Browse Categories</span>
            <Menu className="w-5 h-5" />
          </button>
          
          {showMobileCategories && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileCategories(false)}>
              <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Categories</h3>
                    <button onClick={() => setShowMobileCategories(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold mb-3 text-pink-600">Women's Collection</h4>
                  <div className="space-y-2 mb-6">
                    {['Navratri', 'Wedding', 'Pre-Wedding', 'Reception', 'Sangam', 'Party', 'Designer Blouses', 'Maternity Outfits', 'Jewellery'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { filterBySubcategory(cat); setShowMobileCategories(false); }}
                        className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold mb-3 text-blue-600">Men's Collection</h4>
                  <div className="space-y-2">
                    {['Wedding Outfit', 'Reception Outfit', 'Party Wears', 'Traditional Outfits'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { filterBySubcategory(cat); setShowMobileCategories(false); }}
                        className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Women's Category Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Women's Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CategoryCard 
              title="Navratri Outfits" 
              image="/images/categories/womens-navratri-outfit.jpeg" 
              onClick={() => filterBySubcategory('Navratri')}
            />
            <CategoryCard 
              title="Wedding Outfits" 
              image="/images/categories/womens-wedding-outfit.jpeg" 
              onClick={() => filterBySubcategory('Wedding')}
            />
            <CategoryCard 
              title="Pre-Wedding" 
              image="/images/categories/womens-pre-wedding.jpeg" 
              onClick={() => filterBySubcategory('Pre-Wedding')}
            />
            <CategoryCard 
              title="Reception" 
              image="/images/categories/womens-reception.jpeg" 
              onClick={() => filterBySubcategory('Reception')}
            />
            <CategoryCard 
              title="Sangam" 
              image="/images/categories/womens-sangam.jpeg" 
              onClick={() => filterBySubcategory('Sangam')}
            />
            <CategoryCard 
              title="Party Wear" 
              image="/images/categories/womens-party-wear.jpeg" 
              onClick={() => filterBySubcategory('Party')}
            />
            <CategoryCard 
              title="Designer Blouses" 
              image="/images/categories/womens-designer-blouses.jpeg" 
              onClick={() => filterBySubcategory('Designer Blouses')}
            />
            <CategoryCard 
              title="Maternity Outfits" 
              image="/images/categories/womens-maternity-outfits.jpeg" 
              onClick={() => filterBySubcategory('Maternity Outfits')}
            />
          </div>
          
          {/* Jewellery Highlight Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 mt-6">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-2">💎</span>
              <h3 className="text-xl font-semibold text-amber-800">Premium Jewellery Rentals</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-amber-700 mb-4">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Authentic & Certified Pieces</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Insured & Secure</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Professional Cleaning</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <CategoryCard 
                title="Jewellery" 
                image="/images/categories/womens-jewellery.jpeg" 
                onClick={() => filterBySubcategory('Jewellery')}
              />
            </div>
          </div>
        </div>

        {/* Men's Category Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Men's Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CategoryCard 
              title="Wedding Outfit" 
              image="/images/categories/mens-wedding-outfit.jpeg" 
              onClick={() => filterBySubcategory('Wedding Outfit')}
            />
            <CategoryCard 
              title="Reception Outfit" 
              image="/images/categories/mens-reception-outfit.jpeg" 
              onClick={() => filterBySubcategory('Reception Outfit')}
            />
            <CategoryCard 
              title="Party Wears" 
              image="/images/categories/mens-party-wear.jpeg" 
              onClick={() => filterBySubcategory('Party Wears')}
            />
            <CategoryCard 
              title="Traditional Outfits" 
              image="/images/categories/mens-traditional-outfit.jpeg" 
              onClick={() => filterBySubcategory('Traditional Outfits')}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => filterByCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Occasion
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => filterBySubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Occasions</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>

            {/* Check Availability Button */}
            <div className="flex items-end">
              <button
                onClick={checkAvailability}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition duration-200"
              >
                Check Availability
              </button>
            </div>
          </div>
        </div>

        {/* Dresses Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(filteredDresses || []).map((dress) => (
            <DressCard 
              key={dress.id} 
              dress={dress} 
              onBookNow={(dress) => {
                setSelectedDress(dress);
                setShowBookingModal(true);
              }}
            />
          ))}
        </div>

        {/* Booking Modal */}
        <BookingModal
          dress={selectedDress}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDress(null);
          }}
          onBookingSuccess={(booking) => {
            alert('Booking successful! You will receive a confirmation email shortly.');
          }}
        />

        {(!filteredDresses || filteredDresses.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No dresses available for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryCard = ({ title, image, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="relative cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      <div className="aspect-square">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-white font-semibold text-center px-2 text-sm md:text-base">{title}</h3>
        </div>
      </div>
    </div>
  );
};

const DressCard = ({ dress, onBookNow }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = dress.imageUrls || [];
  const navigate = useNavigate();

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const handleBookNow = (e) => {
    e.stopPropagation(); // Prevent card click when clicking book now
    onBookNow(dress);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(`/rental/${dress.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square sm:aspect-[4/5] bg-gray-200">
        {dress.imageUrls && dress.imageUrls.length > 0 ? (
          <>
            <img
              src={dress.imageUrls[selectedImage]}
              alt={dress.name}
              className="w-full h-full object-cover"
            />
            {dress.imageUrls.length > 1 && (
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {dress.imageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    className={`w-2 h-2 rounded-full ${
                      selectedImage === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{dress.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-2">{dress.category} • {dress.subcategory}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg sm:text-2xl font-bold text-pink-600">₹{dress.pricePerDay}</span>
          <span className="text-xs sm:text-sm text-gray-500">per day</span>
        </div>

        {dress.subcategory !== 'Jewellery' && (
          <div className="flex flex-wrap gap-1 mb-3 hidden sm:flex">
            {dress.availableSizes && dress.availableSizes.map((size) => (
              <span
                key={size}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        <button 
          onClick={handleBookNow}
          className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition duration-200 text-xs sm:text-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default RentalDresses;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaCartPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const subCategories = {
  Men: ['T-shirt', 'Pant', 'Shirt', 'Sport', 'Banyan', 'Hoodies', 'Tracks', 'Cargo'],
  Women: ['Saree', 'Punjabi', 'Dress', 'Lehnga', 'Kurti', 'T-shirt', 'Pant'],
  Kids: ['T-shirt', 'Pant']
};

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [codAvailable, setCodAvailable] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const { isLoggedIn, cart, addToCart, removeFromCart } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/products');
      
      setAllProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
      
      const initialSelected = data.reduce((acc, product) => {
        if (product._id && product.variants?.length) {
          acc[product._id] = 0;
        }
        return acc;
      }, {});
      
      setSelectedVariants(initialSelected);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  useEffect(() => {
    let filtered = [...allProducts];

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(product => product.subCategory === selectedSubCategory);
    }

    if (codAvailable) {
      filtered = filtered.filter(product => product.codAvailable === true);
    }

    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [searchQuery, allProducts, selectedCategory, selectedSubCategory, codAvailable, priceRange]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setCodAvailable(false);
    setPriceRange([0, 10000]);
  };

  const isInCart = (productId) => {
    return cart?.some(item => item.productId?._id === productId) || false;
  };

  const handleCartAction = async (product) => {
    if (!isLoggedIn) {
      setSelectedProduct(product);
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (isInCart(product._id)) {
        await removeFromCart(product._id);
        toast.success('Removed from cart!');
      } else {
        const result = await addToCart(product._id);
        if (result.success) {
          toast.success('Item Added to cart!');
        } else {
          toast.error('Item Already Exist In cart!');
        }
      }
    } catch (error) {
      console.error('Cart action failed:', error);
      toast.error('Item Already Exist In cart!');
    }
  };

  const handleBuyNow = async (product) => {
    if (!isLoggedIn) {
      setSelectedProduct(product);
      setShowLoginPrompt(true);
      return;
    }

    try {
      navigate('/checkout', { 
        state: { 
          product
        } 
      });
    } catch (error) {
      toast.error('Failed to proceed to checkout');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!allProducts.length) return <div className="text-center py-10">No products available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filters Section */}
      <div className="bg-white p-4 shadow-sm">
        <div className="container mx-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory('');
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">All Categories</option>
                  {Object.keys(subCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Subcategory</label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                >
                  <option value="">All Subcategories</option>
                  {selectedCategory && subCategories[selectedCategory].map(subCat => (
                    <option key={subCat} value={subCat}>{subCat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="codFilter"
                  checked={codAvailable}
                  onChange={(e) => setCodAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="codFilter" className="ml-2 text-sm text-gray-600">
                  COD Available
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Our Collection</h1>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">No products match your filters.</p>
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  {product.variants?.[selectedVariants[product._id] || 0]?.images?.[0] ? (
                    <img
                      src={product.variants[selectedVariants[product._id] || 0].images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleCartAction(product)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      isInCart(product._id) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700'
                    } shadow-md hover:shadow-lg`}
                  >
                    {isInCart(product._id) ? <FaShoppingCart /> : <FaCartPlus />}
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-gray-600 mb-2">₹{product.price}</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${
                    product.codAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.codAvailable ? 'COD Available' : 'COD Not Available'}
                  </span>
                  <p className="text-xs text-gray-500 mb-3 capitalize">
                    {product.category} • {product.subCategory}
                  </p>
                  
                  {product.variants?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Colors:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((v, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedVariants(prev => ({
                              ...prev,
                              [product._id]: idx
                            }))}
                            className={`w-5 h-5 rounded-full border ${
                              (selectedVariants[product._id] || 0) === idx ? 'ring-1 ring-blue-500' : ''
                            }`}
                            style={{ backgroundColor: v.color.toLowerCase() }}
                            disabled={v.quantity <= 0}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-xs ${
                      product.variants?.[selectedVariants[product._id] || 0]?.quantity > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {product.variants?.[selectedVariants[product._id] || 0]?.quantity > 0 
                        ? `${product.variants?.[selectedVariants[product._id]]?.quantity} Pieces Available` 
                        : 'Out of stock'}
                    </span>
                    
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      disabled={!product.variants?.[selectedVariants[product._id] || 0]?.quantity}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Login Required</h3>
              <p className="text-gray-600 mb-4">
                Please login to add items to your cart or buy item.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-3 py-1 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
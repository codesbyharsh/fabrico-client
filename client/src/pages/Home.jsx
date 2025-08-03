import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/products');
      
      // Ensure we're working with an array
      const productsData = Array.isArray(res.data) ? res.data : [];
      setProducts(productsData);
      
      // Initialize selected variants
      const initialSelected = {};
      productsData.forEach(product => {
        if (product._id && product.variants?.length) {
          initialSelected[product._id] = 0; // Default to first variant
        }
      });
      setSelectedVariants(initialSelected);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (productId, variantIndex) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
  };

  const handleCartAction = (product, actionType) => {
    if (!isLoggedIn) {
      setSelectedProduct({...product, actionType});
      setShowLoginPrompt(true);
      return;
    }
    
    if (actionType === 'add') {
      addToCart(product);
    } else if (actionType === 'buy') {
      buyNow(product);
    }
  };

  const addToCart = (product) => {
    const variantIndex = selectedVariants[product._id] || 0;
    const variant = product.variants?.[variantIndex];
    
    console.log('Added to cart:', {
      productId: product._id,
      variant,
      quantity: 1
    });
  };

  const buyNow = (product) => {
    const variantIndex = selectedVariants[product._id] || 0;
    const variant = product.variants?.[variantIndex];
    
    console.log('Buy now:', {
      productId: product._id,
      variant,
      quantity: 1
    });
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!products.length) return <div className="text-center py-10">No products available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => {
          const selectedVariantIndex = selectedVariants[product._id] || 0;
          const variant = product.variants?.[selectedVariantIndex] || {};
          
          return (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {variant.images?.[0] ? (
                  <img
                    src={variant.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                
                <button
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  onClick={() => handleCartAction(product, 'add')}
                >
                  <FaShoppingCart className="text-gray-700" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-600 mb-2">₹{product.price}</p>
                <p className="text-sm text-gray-500 mb-3 capitalize">
                  {product.category} • {product.subCategory}
                </p>
                
                {product.variants?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Colors:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleVariantChange(product._id, idx)}
                          className={`w-6 h-6 rounded-full border ${
                            selectedVariantIndex === idx ? 'ring-2 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: v.color.toLowerCase() }}
                          title={`${v.color} (${v.quantity} available)`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {product.sizes?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Sizes:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-100 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-sm font-medium ${
                    variant.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {variant.quantity > 0 
                      ? `${variant.quantity} available` 
                      : 'Out of stock'}
                  </span>
                  
                  <button
                    onClick={() => handleCartAction(product, 'buy')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                    disabled={!variant.quantity || variant.quantity <= 0}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {showLoginPrompt && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Login Required</h3>
            <p className="mb-4">
              Please login to {selectedProduct?.actionType === 'add' 
                ? 'add items to your cart' 
                : 'complete your purchase'}.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
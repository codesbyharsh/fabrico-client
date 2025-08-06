import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaCartPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  
  const { isLoggedIn, cart, addToCart, removeFromCart } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/products');
      
      setProducts(Array.isArray(data) ? data : []);
      
      // Initialize selected variants
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

const isInCart = (productId) => {
  const inCart = cart?.some(item => item.productId?._id === productId) || false;
  console.log(`isInCart check for ${productId}:`, inCart, 'Current cart:', cart);
  return inCart;
};

 const handleCartAction = async (product) => {
  console.log('Starting cart action for:', product._id, 'Current cart:', cart);
  
  if (!isLoggedIn) {
    setSelectedProduct(product);
    setShowLoginPrompt(true);
    return;
  }

  try {
    if (isInCart(product._id)) {
      console.log('Attempting to remove from cart');
      const result = await removeFromCart(product._id);
      console.log('Remove result:', result);
      toast.success('Removed from cart!');
    } else {
      console.log('Attempting to add to cart');
      const result = await addToCart(product._id);
      console.log('Add result:', result);
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
     
      // Navigate to checkout with product details
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
  if (!products.length) return <div className="text-center py-10">No products available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => {
          const variantIndex = selectedVariants[product._id] || 0;
          const variant = product.variants?.[variantIndex] || {};
          const productInCart = isInCart(product._id);

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
                onClick={() => {
                  console.log('Before click - isInCart:', isInCart(product._id), 'Product ID:', product._id);
                  handleCartAction(product);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full shadow ${
                  isInCart(product._id) 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200`}
                style={{ border: '2px solid red' }} // Temporary for visibility
              >
                {isInCart(product._id) ? (
                  <FaShoppingCart style={{ color: isInCart(product._id) ? 'white' : 'black' }} />
                ) : (
                  <FaCartPlus style={{ color: isInCart(product._id) ? 'white' : 'black' }} />
                )}
              </button>

              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-gray-600 mb-2">₹{product.price}</p>
                 <span className={`text-xs px-2 py-1 rounded-full ${
                    product.codAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.codAvailable ? 'COD Available' : 'COD Not Available'}
                  </span>
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
                          onClick={() => setSelectedVariants(prev => ({
                            ...prev,
                            [product._id]: idx
                          }))}
                          className={`w-6 h-6 rounded-full border ${
                            variantIndex === idx ? 'ring-2 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: v.color.toLowerCase() }}
                          disabled={v.quantity <= 0}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-sm font-medium ${
                    variant.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {variant.quantity > 0 ? 'In stock' : 'Out of stock'}
                  </span>
                  
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                    disabled={!variant.quantity}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/login')}
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
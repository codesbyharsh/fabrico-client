import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.error || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              // In your component
  <img
    src={imageError ? '/images/placeholder.jpg' : product.image || 'https://placehold.co/300x200'}
    alt={product.name}
    className="w-full h-48 object-cover"
    onError={() => setImageError(true)}
  />
              <button 
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                onClick={() => console.log('Add to cart:', product)}
              >
                <FaShoppingCart className="text-gray-700" />
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-600 mb-2">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-3">{product.category}</p>
              
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => console.log('Buy now:', product)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
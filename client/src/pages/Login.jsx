import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    console.log('Added to cart:', product);
    // Implement your cart logic here
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button 
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                onClick={() => addToCart(product)}
              >
                <FaShoppingCart className="text-gray-700" />
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mb-3">{product.category}</p>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                  disabled={product.stock <= 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
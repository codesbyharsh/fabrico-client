// client/src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SimplifiedCartProductItem from '../components/SimplifiedCartProductItem';
import { useNavigate, useLocation } from 'react-router-dom';

const Cart = () => {
  const { cart, currentUser, removeFromCart, markCartAsSeen } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

  useEffect(() => {
    // Reset the unseen cart count when the cart page loads
    markCartAsSeen();
    
    const fetchCartDetails = async () => {
      try {
        if (currentUser) {
          const response = await axios.get(
            `http://localhost:5000/api/cart/${currentUser._id}`
          );
          setCartItems(response.data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCartDetails();
  }, [currentUser, cart, markCartAsSeen]);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Product removed from cart');
    } catch (error) {
      toast.error('Failed to remove product');
      console.error('Remove product error:', error);
    }
  };

  // Navigate to checkout with the entire cart
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      toast.error('Please login to proceed to checkout');
      return;
    }
navigate('/checkout', { state: { cartItems } });
  };


  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.productId?.price || 0),
      0
    );
  };

  if (loading) return <div className="text-center py-10">Loading cart...</div>;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaShoppingBag className="mx-auto text-5xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <SimplifiedCartProductItem
              key={item._id || item.productId._id}
              product={item.productId}
              onRemove={() => handleRemoveItem(item.productId._id)}
              onBuyNow={() => navigate('/checkout', { state: { cartItems: [item] } })}
            />
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 border-t pt-3">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
           <button
              onClick={handleProceedToCheckout}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
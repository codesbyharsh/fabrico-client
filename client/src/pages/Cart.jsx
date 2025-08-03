import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaTrash, FaShoppingBag, FaPlus, FaMinus } from 'react-icons/fa';

const Cart = () => {
  const { cart, currentUser, removeFromCart, updateCartItem } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [currentUser, cart]); // Add cart to dependencies

  const handleRemove = async (productId, variantIndex) => {
    await removeFromCart(productId, variantIndex);
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(item.productId._id, item.variantIndex, newQuantity);
  };

  const handleColorChange = async (item, newVariantIndex) => {
    // First remove the old variant
    await removeFromCart(item.productId._id, item.variantIndex);
    // Then add the new variant
    await updateCartItem(item.productId._id, newVariantIndex, item.quantity);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.productId?.price || 0) * item.quantity,
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
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y">
              {cartItems.map((item, index) => {
                const product = item.productId;
                const currentVariant = product?.variants?.[item.variantIndex] || {};
                
                return (
                  <div key={index} className="p-4 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-4">
                      {currentVariant.images?.[0] ? (
                        <img
                          src={currentVariant.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product?.name}</h3>
                      <p className="text-gray-600">₹{product?.price}</p>
<div className="mt-2">
  <p className="text-sm font-medium mb-1">Color:</p>
  <select
    value={item.variantIndex}
    onChange={(e) => handleVariantChange(item, parseInt(e.target.value))}
    className="border rounded p-1 text-sm"
  >
    {product.variants.map((v, idx) => (
      <option 
        key={idx} 
        value={idx}
        disabled={v.quantity <= 0}
      >
        {v.color} ({v.quantity} available)
      </option>
    ))}
  </select>
</div>

<div className="flex items-center mt-3">
  <p className="text-sm font-medium mr-3">Quantity:</p>
  <div className="flex items-center border rounded">
    <button
      onClick={() => handleQuantityChange(item, item.quantity - 1)}
      className="px-2 py-1"
      disabled={item.quantity <= 1}
    >
      <FaMinus size={12} />
    </button>
    <span className="px-3">{item.quantity}</span>
    <button
      onClick={() => handleQuantityChange(item, item.quantity + 1)}
      className="px-2 py-1"
      disabled={item.quantity >= product.variants[item.variantIndex].quantity}
    >
      <FaPlus size={12} />
    </button>
  </div>
</div>
                      
                      <button
                        onClick={() => handleRemove(product._id, item.variantIndex)}
                        className="text-red-500 hover:text-red-700 flex items-center mt-3"
                      >
                        <FaTrash className="mr-1" />
                        Remove
                      </button>
                    </div>
                    
                    <div className="sm:ml-4 mt-4 sm:mt-0 flex sm:flex-col justify-between items-end">
                      <button
                        onClick={() => console.log('Buy now:', item)}
                        className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
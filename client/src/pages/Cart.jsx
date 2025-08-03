import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CartProductItem from '../components/CartProductItem';
import OrderSummary from '../components/OrderSummary';

const Cart = () => {
  const { cart, currentUser, removeFromCart, updateCartItem, addToCart } = useAuth();
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
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [currentUser, cart]);

  const handleRemoveProduct = async (productId) => {
    try {
      // Remove all variants of this product
      const variantsToRemove = cartItems
        .filter(item => item.productId._id === productId)
        .map(item => ({
          productId: item.productId._id,
          variantIndex: item.variantIndex
        }));
      
      // Remove each variant
      for (const variant of variantsToRemove) {
        await removeFromCart(variant.productId, variant.variantIndex);
      }
      
      toast.success('Product removed from cart');
    } catch (error) {
      toast.error('Failed to remove product');
      console.error('Remove product error:', error);
    }
  };

  const handleQuantityChange = async (productId, variantIndex, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(productId, variantIndex, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Quantity update error:', error);
    }
  };

  const handleAddVariant = async (productId, variantIndex) => {
    try {
      await addToCart(productId, variantIndex, 1);
      toast.success('Variant added to cart');
    } catch (error) {
      toast.error('Failed to add variant');
      console.error('Add variant error:', error);
    }
  };

  const handleRemoveVariant = async (productId, variantIndex) => {
    try {
      await removeFromCart(productId, variantIndex);
      toast.success('Variant removed from cart');
    } catch (error) {
      toast.error('Failed to remove variant');
      console.error('Remove variant error:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.productId?.price || 0) * item.quantity,
      0
    );
  };

  const calculateTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getProductGroups = () => {
    const groups = {};
    
    cartItems.forEach(item => {
      const productId = item.productId._id;
      if (!groups[productId]) {
        groups[productId] = {
          product: item.productId,
          variants: []
        };
      }
      groups[productId].variants.push(item);
    });
    
    return Object.values(groups);
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
          {getProductGroups().map((group, groupIndex) => (
            <CartProductItem
              key={groupIndex}
              product={group.product}
              variantsInCart={group.variants}
              onRemoveProduct={handleRemoveProduct}
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
        
        {/* Order Summary Section */}
        <div>
          {/* <OrderSummary 
            cartItems={cartItems}
            totalItems={calculateTotalQuantity()}
            subtotal={calculateTotal()}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default Cart;
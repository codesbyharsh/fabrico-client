import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Check localStorage for user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('fabrico_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setCart(userData.cart || []);
    localStorage.setItem('fabrico_user', JSON.stringify(userData));
  };

  // Add cart functions
const addToCart = async (productId, variantIndex = 0) => {
  try {
    // First remove any existing product (to prevent multiple variants)
    const existingItem = cart.find(item => item.productId._id === productId);
    if (existingItem) {
      await removeFromCart(productId, existingItem.variantIndex);
    }

    const response = await axios.post('http://localhost:5000/api/cart/add', {
      userId: user._id,
      productId,
      variantIndex,
      quantity: 1
    });
    setCart(response.data.cart);
  } catch (error) {
    console.error('Add to cart error:', error);
  }
};

const updateVariant = async (productId, oldVariantIndex, newVariantIndex) => {
  try {
    // First remove old variant
    await removeFromCart(productId, oldVariantIndex);
    // Then add new variant
    await addToCart(productId, newVariantIndex);
  } catch (error) {
    console.error('Update variant error:', error);
  }
};

const removeFromCart = async (productId, variantIndex) => {
  try {
    const response = await axios.post('http://localhost:5000/api/cart/remove', {
      userId: user._id,
      productId,
      variantIndex
    });
    setCart(response.data.cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
  }
};

const updateCartItem = async (productId, variantIndex, newQuantity) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/cart/update`, {
      userId: user._id,
      productId,
      variantIndex,
      quantity: newQuantity
    });
    setCart(response.data.cart);
  } catch (error) {
    console.error('Update cart error:', error);
  }
};

  const logout = async () => {
    try {
      if (user) {
        // Update login status in database
        await axios.put(`http://localhost:5000/api/users/${user._id}/login-status`, {
          isLoggedIn: false
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('fabrico_user');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser: user,
      isLoggedIn: !!user,
      cart,
      addToCart,
      removeFromCart,
      updateCartItem,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
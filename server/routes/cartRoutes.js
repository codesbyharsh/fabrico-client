const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, productId, variantIndex } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if product already in cart
    const existingItem = user.cart.find(item => 
      item.productId.toString() === productId && 
      item.variantIndex === variantIndex
    );

    if (existingItem) {
      return res.status(400).json({ error: 'Item already in cart' });
    }

    user.cart.push({ productId, variantIndex });
    await user.save();
    
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.post('/remove', async (req, res) => {
  try {
    const { userId, productId, variantIndex } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.cart = user.cart.filter(item => 
      !(item.productId.toString() === productId && 
        item.variantIndex === variantIndex)
    );

    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cart with populated products
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('cart.productId');
      
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cartRoutes.js
router.put('/update', async (req, res) => {
  try {
    const { userId, productId, variantIndex, quantity } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const itemIndex = user.cart.findIndex(item => 
      item.productId.toString() === productId && 
      item.variantIndex === variantIndex
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();
    
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add variant update endpoint
router.put('/update-variant', async (req, res) => {
  try {
    const { userId, productId, oldVariantIndex, newVariantIndex } = req.body;
    
    // First remove old variant
    const user = await User.findById(userId);
    user.cart = user.cart.filter(item => 
      !(item.productId.toString() === productId && 
        item.variantIndex === oldVariantIndex)
    );
    
    // Then add new variant
    user.cart.push({
      productId,
      variantIndex: newVariantIndex,
      quantity: 1
    });
    
    await user.save();
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
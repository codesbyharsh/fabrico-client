const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    // Transform the data to match what the client expects
    const transformedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      // Use the first variant's first image as the main image
      image: product.variants[0]?.images[0] || null,
      // Calculate total stock
      stock: product.variants.reduce((sum, variant) => sum + variant.quantity, 0)
    }));

    res.json(transformedProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
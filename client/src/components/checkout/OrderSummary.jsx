// client/src/components/checkout/OrderSummary.jsx
import React, { useState } from 'react';

const OrderSummary = ({ product, onSubmit, onBack }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const variant = product.variants?.[selectedVariant] || {};
  const totalPrice = product.price * quantity;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0 && newQuantity <= variant.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedVariant, quantity);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="border rounded p-4 mb-6">
        <div className="flex items-start mb-4">
          {variant.images?.[0] ? (
            <img
              src={variant.images[0]}
              alt={product.name}
              className="w-24 h-24 object-cover mr-4 rounded"
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mr-4" />
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">₹{product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500 capitalize">
              {product.category} • {product.subCategory}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Color:</label>
          <div className="flex flex-wrap gap-2">
            {product.variants?.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(idx)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedVariant === idx ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: v.color.toLowerCase() }}
                disabled={v.quantity <= 0}
                title={`${v.quantity} available`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Quantity</p>
            <div className="flex items-center border rounded mt-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-3 py-1"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-3 py-1"
                disabled={quantity >= variant.quantity}
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="font-medium">Total Price</p>
            <p className="text-lg font-semibold">₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={variant.quantity <= 0}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
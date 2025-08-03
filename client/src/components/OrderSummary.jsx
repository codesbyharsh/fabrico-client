import React from 'react';

const OrderSummary = ({ cartItems, totalItems, subtotal }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        {cartItems.map((item, index) => {
          const variant = item.productId.variants[item.variantIndex] || {};
          return (
            <div key={index} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.productId.name}</span>
                <span className="text-gray-600 ml-2">
                  ({variant.color} × {item.quantity})
                </span>
              </div>
              <span>
                ₹{(item.productId.price * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="space-y-3 border-t pt-3">
        <div className="flex justify-between">
          <span>Total Items</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹0</span>
        </div>
        <div className="flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
      </div>
      
      <button 
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={cartItems.length === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default OrderSummary;
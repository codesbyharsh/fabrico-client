// client/src/components/checkout/PaymentOptions.jsx
import React, { useState } from 'react';

const PaymentOptions = ({ product, address, variantIndex, quantity, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product || !address) return null;

  const variant = product.variants?.[variantIndex] || {};
  const totalPrice = product.price * quantity;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would call your payment API
      console.log('Processing payment...', {
        productId: product._id,
        variantIndex,
        quantity,
        totalPrice,
        address,
        paymentMethod
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to success page
      // navigate('/order-success');
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Payment Options</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border rounded p-4 mb-6">
            <h3 className="font-medium mb-2">Delivery Address</h3>
            <p>{address.name}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} - {address.pincode}</p>
            <p>Mobile: {address.mobile}</p>
            {address.alternatePhone && <p>Alternate: {address.alternatePhone}</p>}
            <p className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {address.addressType}
              </span>
            </p>
          </div>
          
          <div className="border rounded p-4 mb-6">
            <h3 className="font-medium mb-2">Order Details</h3>
            <div className="flex items-center">
              {variant.images?.[0] ? (
                <img
                  src={variant.images[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover mr-4 rounded"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
              )}
              <div>
                <p className="font-medium">{product.name}</p>
                <p>Color: {variant.color}</p>
                <p>Quantity: {quantity}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <p>Total Amount:</p>
              <p className="font-semibold">₹{totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Select Payment Method</h3>
            
           <div className="space-y-3">
            {product.codAvailable ? (
              <label className="flex items-center p-3 border rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Cash on Delivery (COD)</span>
                  <p className="text-sm text-gray-500">
                    Pay when you receive your order
                  </p>
                </div>
              </label>
            ) : (
              <div className="p-3 text-sm text-gray-500">
                COD is not available for this product
              </div>
            )}
            
            <label className="flex items-center p-3 border rounded cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="UPI"
                checked={paymentMethod === 'UPI'}
                onChange={() => setPaymentMethod('UPI')}
                className="mr-3"
              />
              <div>
                <span className="font-medium">UPI</span>
                <p className="text-sm text-gray-500">
                  Pay instantly using UPI
                </p>
              </div>
            </label>
          </div>
            
            <button
              onClick={handlePayment}
              disabled={!paymentMethod || isProcessing}
              className={`w-full mt-6 py-3 rounded font-medium ${
                !paymentMethod || isProcessing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 border rounded hover:bg-gray-100"
      >
        Back
      </button>
    </div>
  );
};

export default PaymentOptions;
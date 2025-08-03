// client/src/components/SimplifiedCartProductItem.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

const SimplifiedCartProductItem = ({ 
  product, 
  onRemove,
  onBuyNow
}) => {
  const previewImage = product.variants?.[0]?.images?.[0] || null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {/* Section 1: Product Details */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt={product.name}
                className="w-16 h-16 object-cover mr-4 rounded"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
            )}
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">₹{product.price}</p>
              <p className="text-sm text-gray-500 capitalize">
                {product.category} • {product.subCategory}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTrash className="mr-1" />
          </button>
        </div>
      </div>

      {/* Section 2: Buy Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => onBuyNow(product._id)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default SimplifiedCartProductItem;
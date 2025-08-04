import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const DeliveryAddress = ({ onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  mobile: '',
  pincode: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  taluka: '',
  district: '',
  state: 'Maharashtra',
  landmark: '',
  alternatePhone: '',
  addressType: 'Home',
  location: null,
  isDefault: false
});
  const [pincodeValid, setPincodeValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pincodeData, setPincodeData] = useState(null);
  const [validPincodes] = useState([
    '415603', '415604', '415605', '415606', 
    '415709', '415804', '415712', '415203'
  ]);

  // Fetch user addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser?._id) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/address/${currentUser._id}/addresses`,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data && Array.isArray(response.data)) {
            setAddresses(response.data);
            
            if (response.data.length === 0) {
              setShowForm(true);
              setFormData({
                name: currentUser?.name || '',
                mobile: currentUser?.phone || '',
                pincode: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: 'Maharashtra',
                landmark: '',
                alternatePhone: '',
                addressType: 'Home',
                location: null,
                isDefault: true
              });
            }
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          if (error.response?.status === 404) {
            setAddresses([]);
            setShowForm(true);
          } else {
            toast.error('Failed to load addresses');
          }
        }
      }
    };
    fetchAddresses();
  }, [currentUser]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              type: 'Point',
              coordinates: [
                position.coords.longitude,
                position.coords.latitude
              ]
            }
          }));
          toast.success('Location captured successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Please enter manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

const fetchPincodeDetails = async (pincode) => {
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    if (response.data && response.data[0].Status === 'Success') {
      const postOffices = response.data[0].PostOffice;
      if (postOffices.length > 0) {
        const firstOffice = postOffices[0];
        setPincodeData({
          district: firstOffice.District,
          state: firstOffice.State,
          taluka: firstOffice.Block || firstOffice.Taluka || firstOffice.District
        });
        
        setFormData(prev => ({
          ...prev,
          taluka: firstOffice.Block || firstOffice.Taluka || firstOffice.District,
          district: firstOffice.District,
          state: firstOffice.State
        }));
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    toast.error('Failed to fetch pincode details');
    return false;
  }
};

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'pincode') {
      const isValid = validPincodes.includes(value);
      setPincodeValid(isValid);
      
      if (value.length === 6) {
        if (isValid) {
          await fetchPincodeDetails(value);
        } else {
          toast.error('Service not available at this pincode');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pincodeValid) {
      toast.error('Service not available at this pincode');
      return;
    }

    if (addresses.length >= 3 && !formData._id) {
      toast.error('You can only save up to 3 addresses');
      return;
    }

    try {
      setLoading(true);
      
      const addressData = {
        ...formData,
        location: formData.location ? {
          type: 'Point',
          coordinates: formData.location.coordinates
        } : null
      };

      if (!formData._id) {
        delete addressData._id;
      }

      let response;
      if (formData._id) {
        response = await axios.put(
          `http://localhost:5000/api/address/${currentUser._id}/addresses/${formData._id}`,
          addressData
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/address/${currentUser._id}/addresses`,
          addressData
        );
      }

      onSubmit(response.data);
      toast.success(formData._id ? 'Address updated' : 'Address saved');
      setShowForm(false);
    } catch (error) {
      console.error('Error saving address:', error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.status === 404 ? 'Endpoint not found' : 'Failed to save address');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleEditAddress = (address) => {
  setFormData({
    _id: address._id,
    name: address.name || '',
    mobile: address.mobile || '',
    pincode: address.pincode || '',
    addressLine1: address.addressLine1 || '',
    addressLine2: address.addressLine2 || '',
    city: address.city || '',
    taluka: address.taluka || '',
    district: address.district || '',
    state: address.state || 'Maharashtra',
    landmark: address.landmark || '',
    alternatePhone: address.alternatePhone || '',
    addressType: address.addressType || 'Home',
    location: address.location || null,
    isDefault: address.isDefault || false
  });
  setPincodeValid(validPincodes.includes(address.pincode));
  setShowForm(true);
};


  const handleSetDefault = async (addressId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/address/${currentUser._id}/addresses/${addressId}/default`
      );
      const response = await axios.get(
        `http://localhost:5000/api/address/${currentUser._id}/addresses`
      );
      setAddresses(response.data);
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
      
      {!showForm ? (
        <>
          {addresses.length > 0 ? (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Saved Addresses</h3>
              {addresses.map(address => (
                <div 
                  key={address._id} 
                  className={`border rounded p-4 mb-3 ${
                    address.isDefault ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                 <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{address.name}</p>
                        {address.isDefault && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p>{address.mobile}</p>
                      <p>{address.addressLine1}</p>
                     
                      {/* This is where the address format is displayed */}
                      <p>{address.city}</p>
                      <p> {address.taluka}, {address.district}, {address.state} - {address.pincode}</p>
                      {address.landmark && <p>Landmark: {address.landmark}</p>}
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                        {address.addressType}
                      </span>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address._id)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600"
                          onClick={() => handleEditAddress(address)}
                        >
                          Edit
                        </button>
                        <button 
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={() => onSubmit(address)}
                        >
                          Deliver Here
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 text-center py-8">
              <p className="text-gray-600 mb-4">No saved addresses found</p>
            </div>
          )}
          
          {addresses.length < 3 && (
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded font-medium"
              onClick={() => {
                setFormData({
                  name: currentUser?.name || '',
                  mobile: currentUser?.phone || '',
                  pincode: '',
                  addressLine1: '',
                  addressLine2: '',
                  city: '',
                  state: 'Maharashtra',
                  landmark: '',
                  alternatePhone: '',
                  addressType: 'Home',
                  location: null,
                  isDefault: addresses.length === 0
                });
                setShowForm(true);
              }}
            >
              + Add New Address
            </button>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number*</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                pattern="[0-9]{10}"
                title="10-digit mobile number"
                required
              />
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">Pincode*</label>
    <div className="flex">
      <input
        type="text"
        name="pincode"
        value={formData.pincode || ''}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        pattern="[0-9]{6}"
        title="6-digit pincode"
        required
      />
    </div>
    {formData.pincode && !pincodeValid && (
      <p className="text-red-500 text-sm mt-1">
        Service not available at this pincode
      </p>
    )}
    {pincodeValid && (
      <p className="text-green-500 text-sm mt-1">
        Delivery available at this pincode
      </p>
    )}
  </div>
  
  <div>
    <label className="block text-sm font-medium mb-1">Taluka*</label>
    <input
      type="text"
      name="taluka"
      value={formData.taluka || ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
      required
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium mb-1">District*</label>
    <input
      type="text"
      name="district"
      value={formData.district || ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
      required
    />
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">City*</label>
    <input
      type="text"
      name="city"
      value={formData.city || ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
      required
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium mb-1">State*</label>
    <input
      type="text"
      name="state"
      value={formData.state || ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
      required
    />
  </div>
</div>
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1*</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Alternate Phone (Optional)
              </label>
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                pattern="[0-9]{10}"
                title="10-digit mobile number"
              />
            </div>
          </div>

          <div className="flex items-center">
           <button
                type="button"
                onClick={handleUseCurrentLocation}  // Only called on click
                className="flex items-center text-blue-600"
              >
                <FaMapMarkerAlt className="mr-1" />
                Use My Current Location
</button>
            {formData.location && (
              <span className="ml-2 text-sm text-green-600">
                Location captured
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Type*</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === 'Home'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Home (All day delivery)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === 'Work'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Work (10 AM - 5 PM)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={!pincodeValid || loading}
            >
              {loading ? 'Saving...' : 'Save & Deliver Here'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DeliveryAddress;
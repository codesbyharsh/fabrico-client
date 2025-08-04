import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import ForgotPassword from './components/ForgotPassword';
import Cart from './pages/Cart';
import { Toaster } from 'react-hot-toast';
import SimplifiedCartProductItem from './components/SimplifiedCartProductItem';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={
            <Home /> 
            } />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/SimplifiedCartProductItem" element={<SimplifiedCartProductItem/>} />
          <Route path="/checkout" element={<Checkout />} />
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;
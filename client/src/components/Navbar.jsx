import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, isLoggedIn, logout, cart, unseenCartCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm py-3 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-medium text-gray-800">Fabrico</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm">
            Home
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 text-sm">
                Cart
                {unseenCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unseenCartCount}
                  </span>
                )}
              </Link>

              <span className="text-sm text-gray-600">{currentUser?.name}</span>
              <button 
                onClick={handleLogout}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
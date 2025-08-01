import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <span className="ml-2 text-xl font-bold">Fabrico</span>
        </Link>
      </div>

      <div className="flex space-x-4 items-center">
        <Link to="/" className="hover:text-blue-500 transition">Home</Link>
        
        {isLoggedIn ? (
          <>
            <span className="text-gray-600">{currentUser?.name}</span>
            <button 
              onClick={handleLogout}
              className="text-blue-500 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-blue-500 transition">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
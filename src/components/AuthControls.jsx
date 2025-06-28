// campusnotes-react-frontend/src/components/AuthControls.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthControls() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <button onClick={logout} className="hover:text-blue-600">
        Logout
      </button>
    );
  } else {
    return (
      <>
        <Link to="/auth/login" className="hover:text-blue-600">Login</Link>
        <Link to="/auth/signup" className="hover:text-blue-600 ml-4">Sign Up</Link>
      </>
    );
  }
}
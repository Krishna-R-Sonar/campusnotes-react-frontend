// campusnotes-react-frontend/src/App.jsx
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  const handleShare = () => {
    const shareText = 'Join CampusNotes Exchange to share and acquire study materials with your campus community! #StudySmart';
    const shareUrl = 'https://campusnotes-react-frontend.vercel.app'; // Replace with your domain
    if (navigator.share) {
      navigator.share({
        title: 'CampusNotes Exchange',
        text: shareText,
        url: shareUrl,
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    }
  };

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-6">Welcome to CampusNotes Exchange</h1>
      <p className="text-xl text-gray-600 mb-8">
        Share and acquire study materials with your campus community
      </p>
      {!user ? (
        <Link to="/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </Link>
      ) : (
        <Link to="/marketplace" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
          Browse Notes
        </Link>
      )}
      <button
        onClick={handleShare}
        className="mt-4 text-blue-600 hover:underline"
      >
        Share CampusNotes with Friends
      </button>
    </div>
  );
}
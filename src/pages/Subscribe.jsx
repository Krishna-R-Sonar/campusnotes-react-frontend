// campusnotes-react-frontend/src/pages/Subscribe.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SubscribePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Upgrade to SuperCampusNotes</h1>
      <p className="text-xl text-gray-600 mb-8">
        Unlock powerful AI features and enhance your study experience with a premium subscription.
      </p>
      {user?.isPremium ? (
        <p className="text-green-600 text-lg">You are already a SuperCampusNotes subscriber!</p>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Premium Features</h2>
            <ul className="text-left space-y-2">
              <li>📝 Unlimited note summaries (up to 500 words)</li>
              <li>❓ Unlimited question answering</li>
              <li>📚 Unlimited flashcards with PDF export</li>
              <li>🔍 Personalized note recommendations</li>
              <li>⭐ Priority listing for your uploaded notes</li>
              <li>💰 Monthly credit bonuses</li>
            </ul>
          </div>
          <a
            href="https://campusnotes.com/pricing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            View Pricing & Subscribe
          </a>
        </div>
      )}
    </div>
  );
}
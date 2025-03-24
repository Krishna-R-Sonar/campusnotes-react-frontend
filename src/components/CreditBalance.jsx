// campus-notes-vite/src/components/CreditBalance.jsx
import { useAuth } from '../context/AuthContext';

export default function CreditBalance() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Credit Balance</h3>
        <p className="text-2xl font-bold text-blue-600">Please login</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Credit Balance</h3>
      <p className="text-2xl font-bold text-blue-600">{user.credits} credits</p>
    </div>
  );
}
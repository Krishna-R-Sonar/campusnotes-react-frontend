// campusnotes-react-frontend/src/components/CNXToken.jsx
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function CNXToken() {
  const { user, refreshUser } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchaseAnalyses = async () => {
    setIsPurchasing(true);
    try {
      const formData = new FormData();
      formData.append('title', 'Purchase Analyses'); // Satisfy analyzeSchema
      formData.append('purchaseOnly', 'true'); // Indicate purchase intent

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      const result = await response.json();
      await refreshUser();
      toast.success(`Purchased 3 analyses! New balance: ${result.credits} CNX Token`);
    } catch (err) {
      console.error('Purchase error:', err);
      const errorMessage = err.message.includes('Insufficient CNX Token')
        ? 'You need 15 CNX Token to purchase 3 analyses.'
        : err.message || 'An error occurred during purchase';
      toast.error(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-2 rounded-lg shadow-sm">
        <p className="text-sm font-semibold text-gray-600">CNX Token Balance</p>
        <p className="text-lg font-bold text-blue-600">Please login</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-sm">
      <p className="text-sm font-semibold text-gray-600">CNX Token Balance</p>
      <p className="text-lg font-bold text-blue-600">{user.credits} CNX Token</p>
      <p className="text-xs text-gray-600">Free Analyses: {user.freeAnalysesRemaining || 3}/3</p>
      <button
        onClick={handlePurchaseAnalyses}
        disabled={isPurchasing}
        className="mt-1 text-xs bg-blue-600 text-white py-1 px-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isPurchasing ? 'Processing...' : 'Purchase 3 Analyses (15 CNX Token)'}
      </button>
    </div>
  );
}
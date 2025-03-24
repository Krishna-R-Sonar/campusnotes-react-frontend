// campus-notes-vite/src/components/TransactionHistory.jsx
import { useEffect, useState } from 'react';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch('/api/transactions/history', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  if (loading) return <div className="animate-pulse">Loading transactions...</div>;

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction._id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between">
            <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
            <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
            </span>
          </div>
          <p className="text-gray-600">{transaction.description}</p>
        </div>
      ))}
    </div>
  );
}
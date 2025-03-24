// campus-notes-vite/src/pages/Marketplace.jsx
import { useEffect, useState } from 'react';
import NoteCard from '../components/NoteCard';

export default function MarketplacePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
        });
        if (!res.ok) throw new Error('Failed to fetch notes');
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  if (loading) return <div className="text-center py-20">Loading notes...</div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard key={note._id} note={note} />
        ))}
      </div>
    </div>
  );
}

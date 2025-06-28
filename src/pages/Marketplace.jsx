// campusnotes-react-frontend/src/pages/Marketplace.jsx
import { useEffect, useState } from 'react';
import NoteCard from '../components/NoteCard';
import { useApi } from '../hooks/useApi';

export default function MarketplacePage() {
  const [notes, setNotes] = useState([]);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { request } = useApi();

  useEffect(() => {
    async function fetchNotes() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please log in to view the marketplace');
        }

        let url = `${import.meta.env.VITE_API_URL}/api/notes`;
        if (searchQuery) {
          url += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const data = await request(url);
        setNotes(data);

        if (data.length > 0) {
          const recData = await request(`${import.meta.env.VITE_API_URL}/api/notes/${data[0]._id}/recommendations`);
          setRecommendedNotes(recData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [searchQuery, request]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Search is handled via useEffect
  };

  if (loading) return <div className="text-center py-20">Loading notes...</div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes (e.g., Blockchain notes for beginners)"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </form>
      {notes.length === 0 ? (
        <p className="text-center text-gray-600">No notes available</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
      {recommendedNotes.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recommended Notes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendedNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recommended Notes</h2>
          <p className="text-center text-gray-600">No recommendations available</p>
        </div>
      )}
    </div>
  );
}
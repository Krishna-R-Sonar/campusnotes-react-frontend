// campus-notes-vite/src/pages/notes/NoteDetails.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SecureNoteViewer from '../../components/SecureNoteViewer';

export default function NoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth(); // Destructure refreshUser
  const [note, setNote] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFileUrl = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/purchase`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch file URL');
      }
      const data = await res.json();
      setFileUrl(data.fileUrl);
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  const fetchNote = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch note');
      const data = await res.json();
      setNote(data);
      if (data.hasAccess) {
        await fetchFileUrl();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, fetchFileUrl]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    try {
      const res = await fetch(`/api/notes/${id}/purchase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Purchase failed');
      }
      setNote({ ...note, hasAccess: true });
      await fetchFileUrl();
      await refreshUser(); // Refresh user data to update credits in UI
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;
  if (!note) return <div className="text-center py-20">Note not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
      <p className="text-gray-600 mb-4">{note.description || 'No description available'}</p>
      <p className="mb-4">Uploaded by: {note.uploader?.name || 'Unknown'}</p>
      <p className="mb-4">Price: {note.price} credits</p>
      <p className="mb-4">Your Credits: {user?.credits ?? 0}</p>
      {fileUrl ? (
        <div>
          <p className="mb-2">Preview:</p>
          <SecureNoteViewer fileUrl={fileUrl} />
          <p className="mt-4">IPFS Link:</p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {fileUrl}
          </a>
        </div>
      ) : note.hasAccess ? (
        <p className="text-green-600">You have access to this note. The preview will load shortly.</p>
      ) : (
        <button
          onClick={handlePurchase}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Purchase Note
        </button>
      )}
    </div>
  );
}

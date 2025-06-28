// campusnotes-react-frontend/src/components/NoteCard.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function NoteCard({ note }) {
  const navigate = useNavigate();
  const [qualityScore, setQualityScore] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQualityScore = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${note._id}/quality`);
        if (!response.ok) throw new Error('Failed to fetch quality score');
        const data = await response.json();
        setQualityScore(data.qualityScore);
      } catch (err) {
        console.error('Error fetching quality score:', err);
      }
    };

    const fetchFileUrl = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${note._id}/file`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFileUrl(data.fileUrl);
        } else {
          console.log(`Access to file URL denied for note ${note._id}`);
        }
      } catch (err) {
        console.error('Error fetching file URL:', err);
      }
    };

    fetchQualityScore();
    if (note.hasAccess) {
      fetchFileUrl();
    }
  }, [note._id, note.hasAccess]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fileUrl);
    alert('IPFS link copied to clipboard!');
  };

  const fileType = fileUrl.endsWith('.pdf')
    ? 'PDF'
    : fileUrl.endsWith('.docx')
    ? 'Word'
    : fileUrl.endsWith('.pptx')
    ? 'PowerPoint'
    : 'Unknown';

  return (
    <div
      className="border p-4 rounded-md shadow-sm hover:shadow-md cursor-pointer"
      onClick={() => navigate(`/notes/${note._id}`)}
    >
      <h3 className="text-lg font-semibold">{note.title}</h3>
      <p className="text-gray-600">{note.description}</p>
      <p className="text-gray-600">Price: {note.price} CNX Token</p>
      <p className="text-gray-600">File Type: {fileType}</p>
      {qualityScore !== null && (
        <>
          <p className="text-gray-600">Quality Score: {qualityScore}/10</p>
          <p className="text-blue-600 text-sm">Gemini AI Verified (Rating: {qualityScore}/10)</p>
        </>
      )}
      {fileUrl && note.hasAccess && (
        <div className="mt-2">
          <p className="text-sm text-gray-700">IPFS Link:</p>
          <div className="flex items-center space-x-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 truncate max-w-[200px] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {fileUrl}
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink();
              }}
              className="text-sm bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    hasAccess: PropTypes.bool,
  }).isRequired,
};
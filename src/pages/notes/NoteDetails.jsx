// campusnotes-react-frontend/src/pages/notes/NoteDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useApi } from '../../hooks/useApi';
import QuestionForm from '../../components/QuestionForm';
import SecureNoteViewer from '../../components/SecureNoteViewer';

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const [note, setNote] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    async function fetchNote() {
      try {
        const data = await request(`${import.meta.env.VITE_API_URL}/api/notes/${id}`);
        setNote(data);
        if (data.hasAccess) {
          const fileResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/file`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            setFileUrl(fileData.fileUrl);
          }
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load note');
        navigate('/marketplace');
      } finally {
        setIsLoading(false);
      }
    }
    fetchNote();
  }, [id, request, navigate]);

  const handleQuestionAnswered = ({ question, answer }) => {
    setConversation((prev) => [...prev, { question, answer }]);
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await request(`${import.meta.env.VITE_API_URL}/api/notes/${id}/purchase`, {
        method: 'POST',
      });
      toast.success('Note purchased successfully');
      const fileResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/file`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        setFileUrl(fileData.fileUrl);
        setNote({ ...note, hasAccess: true });
      }
    } catch (err) {
      // Error handled by useApi
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fileUrl);
    toast.success('IPFS link copied to clipboard!');
  };

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

  if (isLoading) {
    return (
      <div className="text-center mt-8">
        <span className="loading-spinner inline-block"></span>
        <p className="mt-2 text-gray-600">Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return <div className="text-center mt-8 text-red-600">Note not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <p className="text-gray-700 mb-2">{note.description || 'No description available'}</p>
        <p className="text-gray-600">Uploaded by: {note.uploader?.name || 'Unknown'}</p>
        <p className="text-gray-600">Price: {note.price} CNX Token</p>
        {note.hasAccess && fileUrl ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Note Content</h2>
            {isPdf && !pdfLoadFailed ? (
              <SecureNoteViewer
                fileUrl={fileUrl}
                noteId={id}
                onLoadError={() => setPdfLoadFailed(true)}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 truncate max-w-[300px] hover:underline"
                >
                  {fileUrl}
                </a>
                <button
                  onClick={handleCopyLink}
                  className="text-sm bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200"
                >
                  Copy IPFS Link
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            className="bg-green-600 text-white py-2 px-4 rounded-md mt-2 hover:bg-green-700 disabled:bg-green-300"
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <span className="loading-spinner inline-block h-5 w-5"></span>
            ) : (
              'Purchase Note'
            )}
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ask a Question</h2>
        <QuestionForm noteId={id} onQuestionAnswered={handleQuestionAnswered} />
      </div>

      {conversation.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Conversation History</h2>
          <div className="space-y-4">
            {conversation.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">Q: {item.question}</p>
                <p className="text-gray-700">A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

NoteDetails.propTypes = {};
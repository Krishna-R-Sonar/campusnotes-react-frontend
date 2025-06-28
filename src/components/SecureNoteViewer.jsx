// campusnotes-react-frontend/src/components/SecureNoteViewer.jsx
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function SecureNoteViewer({ fileUrl, noteId, onLoadError }) {
  const { user } = useAuth();
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Verify authorization on mount
  useEffect(() => {
    async function checkAuthorization() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${noteId}/file`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          setError('You do not have access to this file. Please purchase the note.');
        }
      } catch (err) {
        console.error('Authorization check error:', err);
        setError('Failed to verify access. Please try again.');
      }
    }
    if (user && noteId) {
      checkAuthorization();
    } else {
      setError('Please log in to view the file.');
    }
  }, [user, noteId]);

  // Prevent Ctrl+S to block saving/downloading the PDF
  useEffect(() => {
    const preventDownload = (e) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', preventDownload);
    return () => document.removeEventListener('keydown', preventDownload);
  }, []);

  // Handle successful PDF loading
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setError(null);
  }

  // Handle PDF loading errors
  function onDocumentLoadError(err) {
    console.error('PDF loading error:', err);
    setError('Failed to load PDF.');
    onLoadError(); // Notify parent of failure
  }

  // Memoize document options to prevent unnecessary re-renders
  const documentOptions = useMemo(() => ({ disableAutoFetch: true }), []);

  if (!isAuthorized) {
    return <div className="text-red-600 text-center p-4">{error || 'Access denied.'}</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : (
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={documentOptions}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              width={800}
            />
          ))}
        </Document>
      )}
    </div>
  );
}

SecureNoteViewer.propTypes = {
  fileUrl: PropTypes.string.isRequired,
  noteId: PropTypes.string.isRequired,
  onLoadError: PropTypes.func.isRequired,
};
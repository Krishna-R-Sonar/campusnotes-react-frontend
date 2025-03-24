// campus-notes-vite/src/components/SecureNoteViewer.jsx
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useEffect, useState, useMemo } from 'react';

// Set the worker source to the local worker script
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function SecureNoteViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState(null);

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
    setError('Failed to load PDF. Please try again.');
  }

  // Memoize document options to prevent unnecessary re-renders
  const documentOptions = useMemo(() => ({ disableAutoFetch: true }), []);

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
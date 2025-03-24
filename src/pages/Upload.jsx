// campus-notes-vite/src/pages/Upload.jsx
import NoteUploadForm from '../components/NoteUploadForm';
import { useAuth } from '../context/AuthContext';

export default function UploadPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Please login to upload notes</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Upload New Note</h1>
      <NoteUploadForm />
    </div>
  );
}
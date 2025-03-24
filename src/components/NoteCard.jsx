// campus-notes-vite/src/components/NoteCard.jsx
import { Link } from 'react-router-dom';

export default function NoteCard({ note }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
      <p className="text-gray-600 mb-4">{note.description || 'No description available'}</p>
      <div className="flex justify-between items-center">
        <span className="text-blue-600 font-medium">{note.price} credits</span>
        <Link
          to={`/notes/${note._id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          View Note
        </Link>
      </div>
    </div>
  );
}
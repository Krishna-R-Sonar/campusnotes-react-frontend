// campusnotes-react-frontend/src/pages/Dashboard.jsx
import CNXToken from '../components/CNXToken';
import TransactionHistory from '../components/TransactionHistory';
import NoteUploadForm from '../components/NoteUploadForm';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-20">Please login to view dashboard</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CNXToken />
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload New Note</h2>
          <NoteUploadForm />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
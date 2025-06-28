// campusnotes-react-frontend/src/components/QuestionForm.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useApi } from '../hooks/useApi';

export default function QuestionForm({ noteId, onQuestionAnswered }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { request } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    setIsLoading(true);
    try {
      const data = await request(`${import.meta.env.VITE_API_URL}/api/notes/${noteId}/ask`, {
        method: 'POST',
        body: JSON.stringify({ question }),
      });
      onQuestionAnswered({ question, answer: data.answer });
      setQuestion('');
      toast.success('Question answered successfully');
    } catch (err) {
      // Error handled by useApi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about the note"
        className="w-full p-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        disabled={isLoading}
      >
        {isLoading ? <span className="question-form-spinner inline-block"></span> : 'Ask'}
      </button>
    </form>
  );
}

QuestionForm.propTypes = {
  noteId: PropTypes.string.isRequired,
  onQuestionAnswered: PropTypes.func.isRequired,
};
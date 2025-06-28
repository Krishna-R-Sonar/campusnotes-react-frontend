// campusnotes-react-frontend/src/components/ConversationHistory.jsx
import PropTypes from 'prop-types';

export default function ConversationHistory({ history, onClear }) {
  if (history.length === 0) return null;

  return (
    <div className="bg-gray-100 p-4 rounded-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Conversation History</h3>
        <button
          onClick={onClear}
          className="text-sm bg-red-100 text-red-700 py-1 px-2 rounded hover:bg-red-200"
        >
          Clear History
        </button>
      </div>
      {history.map((item, index) => (
        <div key={index} className="border-b py-2">
          <p><strong>Q:</strong> {item.question}</p>
          <p><strong>A:</strong> {item.answer}</p>
        </div>
      ))}
    </div>
  );
}

ConversationHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ).isRequired,
  onClear: PropTypes.func.isRequired,
};
// campusnotes-react-frontend/src/components/NoteUploadForm.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  price: z
    .number()
    .positive('Price must be a positive number')
    .max(1000, 'Price is too high'),
  file: z.any().refine((files) => files?.length === 1, 'File is required'),
});

export default function NoteUploadForm() {
  const { user, refreshUser } = useAuth();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false);
  const [showPurchaseConfirmation, setShowPurchaseConfirmation] = useState(false);
  const [freeAnalysesRemaining, setFreeAnalysesRemaining] = useState(user?.freeAnalysesRemaining || 3);
  const [purchasedAnalysesRemaining, setPurchasedAnalysesRemaining] = useState(user?.purchasedAnalysesRemaining || 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleAnalyze = async (data) => {
    if (!data.file[0]) {
      setError('Please select a file to analyze');
      toast.error('Please select a file to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('title', data.title);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error.includes('Insufficient CNX Token') || errorData.error.includes('used all')) {
          setShowPurchasePrompt(true);
          throw new Error('Insufficient analyses available');
        }
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setFreeAnalysesRemaining(result.freeAnalysesRemaining);
      setPurchasedAnalysesRemaining(result.purchasedAnalysesRemaining);
      await refreshUser();
      toast.success('File analyzed successfully!');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis');
      toast.error(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePurchaseAnalyses = async () => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('title', 'Purchase Analyses');
      formData.append('purchaseOnly', 'true');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      const result = await response.json();
      setFreeAnalysesRemaining(result.freeAnalysesRemaining);
      setPurchasedAnalysesRemaining(result.purchasedAnalysesRemaining);
      await refreshUser();
      toast.success(`Purchased 3 analyses! New balance: ${result.credits} CNX Token`);
      setShowPurchasePrompt(false);
      setShowPurchaseConfirmation(false);
    } catch (err) {
      console.error('Purchase error:', err);
      const errorMessage = err.message.includes('Insufficient CNX Token')
        ? 'You need 15 CNX Token to purchase 3 analyses.'
        : err.message || 'An error occurred during purchase';
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmPurchase = () => {
    handlePurchaseAnalyses();
  };

  const handleDeclinePurchase = () => {
    setShowPurchasePrompt(false);
    setShowPurchaseConfirmation(false);
  };

  const handleRequestPurchase = () => {
    if (user.credits < 15) {
      toast.error('Not sufficient CNX Token available. You need 15 CNX Token.');
      setShowPurchasePrompt(false);
      return;
    }
    setShowPurchaseConfirmation(true);
  };

  const onSubmit = async (data) => {
    if (!analysisResult || !analysisResult.analysisId) {
      setError('Please analyze the file first and ensure analysis is complete');
      toast.error('Please analyze the file first');
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(analysisResult.analysisId)) {
      setError('Invalid analysis ID format');
      toast.error('Invalid analysis ID format');
      return;
    }
    if (analysisResult.qualityScore < 6) {
      setError('Note quality score is below 6/10. Only notes with a score of 6 or higher can be uploaded.');
      toast.error('Note quality score is below 6/10');
      return;
    }
    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('file', data.file[0]);
      formData.append('analysisId', analysisResult.analysisId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details
          ? errorData.details.map((err) => `${err.field}: ${err.message}`).join('; ')
          : errorData.error || 'Upload failed';
        throw new Error(errorMessage);
      }
      const result = await response.json();
      const fileType = data.file[0].name.endsWith('.pdf')
        ? 'PDF'
        : data.file[0].name.endsWith('.docx')
        ? 'Word'
        : 'PowerPoint';
      setSuccess(`Note uploaded successfully as a ${fileType} file!`);
      setAnalysisResult(null);
      reset();
      await refreshUser();
      toast.success('Note uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload a Note</h2>
      <p className="text-sm text-gray-600 mb-4">
        Free analyses remaining: {freeAnalysesRemaining}/3 | Purchased analyses: {purchasedAnalysesRemaining}
      </p>
      {analysisResult && (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-blue-700">AI Analysis: Quality Score {analysisResult.qualityScore}/10</p>
          <p className="text-blue-600 text-sm">Summary: {analysisResult.summary}</p>
          <p className="text-blue-600 text-sm">Gemini AI Verified (Rating: {analysisResult.qualityScore}/10)</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            placeholder="Enter note title"
          />
          {errors.title && <span className="text-red-600 text-sm">{errors.title.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            rows="3"
            placeholder="Describe your note"
          />
          {errors.description && <span className="text-red-600 text-sm">{errors.description.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (in CNX Token)</label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            placeholder="Enter price"
            step="0.01"
          />
          {errors.price && <span className="text-red-600 text-sm">{errors.price.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">File (PDF, Word, or PowerPoint)</label>
          <input
            type="file"
            {...register('file')}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept=".pdf,.docx,.pptx"
          />
          <p className="mt-1 text-sm text-gray-500">Supported formats: PDF (.pdf), Word (.docx), PowerPoint (.pptx)</p>
          {errors.file && <span className="text-red-600 text-sm">{errors.file.message}</span>}
        </div>
        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
        {success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{success}</div>}
        <button
          type="button"
          onClick={handleSubmit(handleAnalyze)}
          disabled={isAnalyzing || isUploading}
          className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 disabled:bg-yellow-300 mb-2"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze File'}
        </button>
        <button
          type="submit"
          disabled={isUploading || isAnalyzing || !analysisResult}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Upload Note'}
        </button>
      </form>
      {showPurchasePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Purchase Additional Analyses</h3>
            <p className="text-gray-600 mb-4">
              You've used all {freeAnalysesRemaining}/3 free analyses. Buy 3 more for 15 CNX Token? (CNX Token Balance: {user.credits})
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeclinePurchase}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={handleRequestPurchase}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isAnalyzing ? 'Processing...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showPurchaseConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Purchase</h3>
            <p className="text-gray-600 mb-4">15 CNX Token will be debited from your account to purchase 3 analyses.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeclinePurchase}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isAnalyzing ? 'Processing...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// campus-notes-vite/src/components/NoteUploadForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(), // New description field
  price: z.number().positive('Price must be a positive number'),
  file: z.any()
    .refine((value) => value instanceof FileList && value.length > 0, { message: 'File is required' })
    .refine((value) => value[0].type === 'application/pdf', { message: 'Only PDF files are allowed' }),
});

export default function NoteUploadForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || ''); // Include description
      formData.append('price', data.price.toString());
      formData.append('file', data.file[0]);

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setSuccess('Note uploaded successfully!');
      reset(); // Clear the form
      console.log('Upload successful:', result);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input {...register('title')} className="mt-1 block w-full rounded-md border p-2" />
        {errors.title && <span className="text-red-600">{errors.title.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border p-2"
          rows="3"
          placeholder="Write a summary of your note (optional)"
        />
        {errors.description && <span className="text-red-600">{errors.description.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium">Price (in credits)</label>
        <input
          type="number"
          {...register('price', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border p-2"
        />
        {errors.price && <span className="text-red-600">{errors.price.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium">File (PDF only)</label>
        <input
          type="file"
          {...register('file')}
          className="mt-1 block w-full"
          accept="application/pdf"
        />
        {errors.file && <span className="text-red-600">{errors.file.message}</span>}
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {isLoading ? 'Uploading...' : 'Upload Note'}
      </button>
    </form>
  );
}

// campusnotes-react-frontend/src/hooks/useApi.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export function useApi() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const request = async (url, options = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth/login');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(errorData.error || 'Request failed');
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { request, isLoading, error };
}
// campusnotes-react-frontend/src/pages/auth/Signup.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { token } = await res.json();
        login(token);
        navigate('/dashboard');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            {...register('name')}
            className="mt-1 block w-full rounded-md border p-2"
          />
          {errors.name && <span className="text-red-600">{errors.name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            {...register('email')}
            className="mt-1 block w-full rounded-md border p-2"
            type="email"
          />
          {errors.email && <span className="text-red-600">{errors.email.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            {...register('password')}
            className="mt-1 block w-full rounded-md border p-2"
            type="password"
          />
          {errors.password && <span className="text-red-600">{errors.password.message}</span>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

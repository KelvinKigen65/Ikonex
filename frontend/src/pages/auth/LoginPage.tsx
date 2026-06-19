import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/api/auth.api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login: setAuth }      = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      setAuth(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const data = err.response?.data;
      const fieldMessage = data && typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : '';
      const message = data?.detail || data?.error || fieldMessage
        || (err.request ? `Cannot reach API at ${apiUrl}. Restart the frontend or check CORS/network.` : 'Login failed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/mortarboard.png"
            alt="Ikonex Academy"
            className="mb-4 h-24 w-24 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Ikonex Academy</h1>
          <p className="text-gray-500 text-sm mt-1">Student Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-sm text-center text-gray-500">
          Need an account?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            Create one here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

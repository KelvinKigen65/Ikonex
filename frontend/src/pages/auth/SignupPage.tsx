import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { SIGNUP_ROLES, formatRoleLabel } from '@/lib/roles';
import type { Role } from '@/types';

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<Role, 'SUPER_ADMIN' | 'STUDENT'>>('TEACHER');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await register({ firstName, lastName, email, password, role });
      login(res.data.token, res.data.user);
      toast.success(`Welcome to your ${formatRoleLabel(role)} dashboard!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <UserPlus size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Ikonex Account</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Sign up as a teacher or admin and we&apos;ll route you to the right dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
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
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as Exclude<Role, 'SUPER_ADMIN' | 'STUDENT'>)}
              className="input"
            >
              {SIGNUP_ROLES.map(option => (
                <option key={option} value={option}>{formatRoleLabel(option)}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

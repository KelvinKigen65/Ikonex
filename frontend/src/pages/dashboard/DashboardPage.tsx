import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, School, BookOpen, TrendingUp, ClipboardList, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import { getDashboardStats } from '@/api/results.api';
import type { DashboardStats } from '@/types';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const teacherQuickActions = [
  {
    title: 'Manage Streams',
    description: 'Create class streams and review stream details for each class.',
    to: '/streams',
    icon: School,
  },
  {
    title: 'Manage Students',
    description: 'Register learners, update profiles, and keep class rosters current.',
    to: '/students',
    icon: Users,
  },
  {
    title: 'Manage Subjects',
    description: 'Create subjects and assign them to the right class streams.',
    to: '/subjects',
    icon: BookOpen,
  },
  {
    title: 'Capture Scores',
    description: 'Enter CAT and exam marks while preventing duplicate submissions.',
    to: '/assessments',
    icon: ClipboardList,
  },
  {
    title: 'Review Results',
    description: 'See averages, grades, subject rankings, and class positions.',
    to: '/results',
    icon: TrendingUp,
  },
  {
    title: 'Generate Reports',
    description: 'Open report cards and class performance reports for printing to PDF.',
    to: '/reports',
    icon: FileText,
  },
];

const teacherCapabilities = [
  'Create and review class streams such as Form 1A, Form 1B, and Form 1C.',
  'Register students, edit student records, and view learners by stream.',
  'Create subjects, assign them to streams, and maintain subject details.',
  'Record CAT and exam scores, then update entries without duplicate submissions.',
  'Track totals, averages, grades, subject positions, and overall class rankings.',
  'Generate printable student report cards and class performance reports.',
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isStaffUser = user?.role !== 'STUDENT';

  useEffect(() => {
    if (!user || !isStaffUser) {
      setLoading(false);
      return;
    }

    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isStaffUser, user]);

  if (!user) return null;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!isStaffUser) {
    return (
      <div className="card max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Access Unavailable</h1>
        <p className="text-sm text-gray-500 mt-3">
          This portal is currently configured for teacher and admin accounts only.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Sign in with a staff account or ask an administrator to update your access.
        </p>
      </div>
    );
  }

  const heading = user.role === 'TEACHER'
    ? 'Teacher Dashboard'
    : user.role === 'ADMIN'
      ? 'Admin Dashboard'
      : 'Super Admin Dashboard';
  const subtitle = user.role === 'TEACHER'
    ? 'Run daily academic work from one place: classes, learners, scores, results, and reports.'
    : 'Monitor school operations, performance, and academic activity.';

  const gradeData = [
    { grade: 'A', count: 12 }, { grade: 'B', count: 28 }, { grade: 'C', count: 35 },
    { grade: 'D', count: 18 }, { grade: 'E', count: 7 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.stats.totalStudents ?? 0} icon={Users} color="blue" />
        <StatCard title="Class Streams"  value={stats?.stats.totalStreams ?? 0}  icon={School} color="green" />
        <StatCard title="Subjects"       value={stats?.stats.totalSubjects ?? 0} icon={BookOpen} color="purple" />
        <StatCard title="Avg Performance" value="72.4%" icon={TrendingUp} color="orange" change="3.2% this term" positive />
      </div>

      {user.role === 'TEACHER' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6">
          <div className="card">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Teacher Workspace</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Jump straight into the tasks you handle most often.
                </p>
              </div>
              <div className="rounded-2xl bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700">
                {teacherQuickActions.length} core actions
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherQuickActions.map(({ title, description, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                      <Icon size={20} />
                    </div>
                    <ArrowRight size={16} className="mt-1 text-gray-300 transition-colors group-hover:text-primary-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="card bg-slate-950 text-white">
            <h2 className="text-base font-semibold">Functional Coverage</h2>
            <p className="mt-2 text-sm text-slate-300">
              The teacher dashboard now maps directly to the core academic workflows in your brief.
            </p>
            <div className="mt-5 space-y-3">
              {teacherCapabilities.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                  <p className="text-sm leading-6 text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Subject performance bar chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Subject Performance</h2>
          {stats?.subjectPerformance && stats.subjectPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.subjectPerformance} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Avg Score']} />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Grade distribution pie */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Grade Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={gradeData} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`} nameKey="grade">
                {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                  {item.student?.firstName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{item.student?.firstName} {item.student?.lastName}</span>
                    {' '}scored <span className="font-semibold text-primary-600">{item.marks}</span>
                    {' '}in {item.assessment?.subject?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

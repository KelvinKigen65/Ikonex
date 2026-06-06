import { useState, useEffect } from 'react';
import { Users, School, BookOpen, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import { getDashboardStats } from '@/api/results.api';
import type { DashboardStats } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );

  const gradeData = [
    { grade: 'A', count: 12 }, { grade: 'B', count: 28 }, { grade: 'C', count: 35 },
    { grade: 'D', count: 18 }, { grade: 'E', count: 7 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of Ikonex Academy performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.stats.totalStudents ?? 0} icon={Users} color="blue" />
        <StatCard title="Class Streams"  value={stats?.stats.totalStreams ?? 0}  icon={School} color="green" />
        <StatCard title="Subjects"       value={stats?.stats.totalSubjects ?? 0} icon={BookOpen} color="purple" />
        <StatCard title="Avg Performance" value="72.4%" icon={TrendingUp} color="orange" change="3.2% this term" positive />
      </div>

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

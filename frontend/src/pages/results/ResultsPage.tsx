import { useState, useEffect } from 'react';
import type { ClassStream, StudentResult } from '@/types';
import { getStreams } from '@/api/streams.api';
import { getResults } from '@/api/results.api';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const gradeColor = (g: string): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
  if (g.startsWith('A')) return 'green';
  if (g.startsWith('B')) return 'blue';
  if (g.startsWith('C')) return 'yellow';
  if (g === 'D' || g === 'D+') return 'red';
  return 'gray';
};

const ResultsPage = () => {
  const [streams, setStreams] = useState<ClassStream[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ streamId: '', term: 'Term 1', academicYear: '2024' });
  const [searched, setSearched] = useState(false);

  useEffect(() => { getStreams().then(r => setStreams(r.data.streams)).catch(() => {}); }, []);

  const handleSearch = async () => {
    if (!filters.streamId) return toast.error('Select a stream');
    setLoading(true);
    try {
      const res = await getResults(filters);
      setResults(res.data.results);
      setSearched(true);
    } catch { toast.error('Failed to process results'); }
    finally { setLoading(false); }
  };

  const chartData = results.map(r => ({
    name: r.studentName.split(' ')[0],
    average: Math.round(r.averageScore * 10) / 10,
  }));

  return (
    <div>
      <PageHeader title="Results Processing" subtitle="Auto-calculate grades, points, and rankings" />

      {/* Filters */}
      <div className="card mb-6 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Stream</label>
          <select className="input" value={filters.streamId} onChange={e => setFilters(p => ({ ...p, streamId: e.target.value }))}>
            <option value="">Select stream...</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
          <select className="input" value={filters.term} onChange={e => setFilters(p => ({ ...p, term: e.target.value }))}>
            {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
          <input className="input w-24" value={filters.academicYear} onChange={e => setFilters(p => ({ ...p, academicYear: e.target.value }))} />
        </div>
        <button onClick={handleSearch} disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? 'Processing...' : 'Process Results'}
        </button>
      </div>

      {searched && (
        <>
          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Student Performance</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${Number(v)}%`, 'Average']} />
                  <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Results Table */}
          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Results — {filters.term} {filters.academicYear}</h2>
              <span className="text-sm text-gray-500">{results.length} students</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">Pos</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Avg Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mean Pts</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mean Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subjects</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No results found. Record scores first.</td></tr>
                  ) : results.map((r, i) => (
                    <tr key={r.studentId} className={clsx('border-b border-gray-50', i === 0 && 'bg-yellow-50')}>
                      <td className="px-4 py-3">
                        <span className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                          r.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                          r.position === 2 ? 'bg-gray-300 text-gray-700' :
                          r.position === 3 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-600'
                        )}>
                          {r.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{r.studentName}</div>
                        <div className="text-xs text-gray-400">{r.admissionNo}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.averageScore.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-gray-600">{r.meanPoints.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <Badge label={r.meanGrade} color={gradeColor(r.meanGrade)} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.subjects.length} subjects
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsPage;

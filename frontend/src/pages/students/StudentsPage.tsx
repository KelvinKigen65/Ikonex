import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Edit2, Trash2, Users } from 'lucide-react';
import type { Student, ClassStream } from '@/types';
import { getStudents, deleteStudent } from '@/api/students.api';
import { getStreams } from '@/api/streams.api';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const canEdit   = !!user && user.role !== 'STUDENT';

  const [students, setStudents] = useState<Student[]>([]);
  const [streams, setStreams]   = useState<ClassStream[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [streamId, setStreamId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudents({ page, search, streamId: streamId || undefined });
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [page, search, streamId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getStreams().then(r => setStreams(r.data.streams)).catch(() => {}); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${total} students enrolled`}
        actions={canEdit ? (
          <button onClick={() => navigate('/students/new')} className="btn-primary">
            <Plus size={16} /> Add Student
          </button>
        ) : undefined}
      />

      {/* Filters */}
      <div className="card mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or admission number..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input sm:w-48" value={streamId} onChange={e => { setStreamId(e.target.value); setPage(1); }}>
          <option value="">All Streams</option>
          {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Adm No', 'Student', 'Gender', 'Stream', 'Parent Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Users size={40} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-400">No students found</p>
                  </td>
                </tr>
              ) : students.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.admissionNo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={s.gender} color={s.gender === 'FEMALE' ? 'blue' : 'green'} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.classStream?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.parentContact}</td>
                  <td className="px-4 py-3">
                    <Badge label={s.isActive ? 'Active' : 'Inactive'} color={s.isActive ? 'green' : 'red'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/students/${s.id}`)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded" title="View">
                        <Eye size={14} />
                      </button>
                      {canEdit && <>
                        <button onClick={() => navigate(`/students/${s.id}/edit`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 px-3 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="btn-secondary py-1 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;

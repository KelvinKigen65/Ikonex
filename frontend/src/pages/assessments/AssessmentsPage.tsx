import { useState, useEffect, useCallback } from 'react';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';
import type { Assessment, ClassStream, Subject } from '@/types';
import { getAssessments, createAssessment, deleteAssessment } from '@/api/assessments.api';
import { getStreams } from '@/api/streams.api';
import { getSubjects } from '@/api/subjects.api';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ASSESSMENT_TYPES = ['CAT1', 'CAT2', 'ASSIGNMENT', 'MIDTERM', 'END_TERM'];
const TERMS = ['Term 1', 'Term 2', 'Term 3'];

const typeColor = (t: string): 'blue' | 'green' | 'yellow' | 'gray' => {
  if (t === 'END_TERM') return 'blue';
  if (t === 'MIDTERM') return 'green';
  if (t === 'CAT1' || t === 'CAT2') return 'yellow';
  return 'gray';
};

const AssessmentsPage = () => {
  const navigate  = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [streams, setStreams]   = useState<ClassStream[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStream, setFilterStream] = useState('');
  const [form, setForm] = useState({
    name: '', type: 'END_TERM', maxMarks: 100, weight: 1,
    term: 'Term 1', academicYear: '2024', subjectId: '', streamId: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAssessments({ streamId: filterStream || undefined });
      setAssessments(res.data.assessments);
    } finally { setLoading(false); }
  }, [filterStream]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getStreams().then(r => setStreams(r.data.streams)).catch(() => {});
    getSubjects().then(r => setSubjects(r.data.subjects)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      await createAssessment(form as any);
      toast.success('Assessment created');
      setModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete assessment?')) return;
    try { await deleteAssessment(id); toast.success('Deleted'); load(); }
    catch { toast.error('Cannot delete — has scores recorded'); }
  };

  return (
    <div>
      <PageHeader
        title="Assessments"
        subtitle="Manage exams and continuous assessments"
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> New Assessment
          </button>
        }
      />

      <div className="card mb-4 flex gap-3">
        <select className="input" value={filterStream} onChange={e => setFilterStream(e.target.value)}>
          <option value="">All Streams</option>
          {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Assessment', 'Type', 'Subject', 'Max Marks', 'Term', 'Year', 'Scores', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : assessments.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-2 opacity-40" />
                <p>No assessments found</p>
              </td></tr>
            ) : assessments.map(a => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3"><Badge label={a.type} color={typeColor(a.type)} /></td>
                <td className="px-4 py-3 text-gray-600">{a.subject?.name}</td>
                <td className="px-4 py-3 text-gray-600">{a.maxMarks}</td>
                <td className="px-4 py-3 text-gray-600">{a.term}</td>
                <td className="px-4 py-3 text-gray-600">{a.academicYear}</td>
                <td className="px-4 py-3">
                  <span className="badge bg-primary-100 text-primary-700">{a._count?.scores ?? 0}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/assessments/${a.id}/scores`)} className="text-xs btn-primary py-1 px-2">Enter Scores</button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Assessment" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Name</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Term 1 End of Term Exam" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select className="input" value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
            <select className="input" value={form.streamId} onChange={e => setForm(p => ({ ...p, streamId: e.target.value }))}>
              <option value="">Select stream...</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
            <input type="number" className="input" value={form.maxMarks} onChange={e => setForm(p => ({ ...p, maxMarks: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select className="input" value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input className="input" value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="2024" />
          </div>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleCreate} disabled={!form.name || !form.subjectId} className="btn-primary flex-1 justify-center">Create Assessment</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssessmentsPage;

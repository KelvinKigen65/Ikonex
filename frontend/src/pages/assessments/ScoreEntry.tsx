import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { getAssessments, getScores, bulkSubmitScores } from '@/api/assessments.api';
import { getStudents } from '@/api/students.api';
import type { Assessment, Student } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import toast from 'react-hot-toast';

const ScoreEntry = () => {
  const { id }   = useParams();
  const navigate  = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [students, setStudents]     = useState<Student[]>([]);
  const [scores, setScores]         = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          getAssessments({ }),
          getScores(id!),
        ]);
        const found = aRes.data.assessments.find(a => a.id === id);
        if (!found) return;
        setAssessment(found);

        // Load students for this stream
        if (found.streamId) {
          const studRes = await getStudents({ streamId: found.streamId, limit: 200 });
          setStudents(studRes.data.students);
        }

        // Prefill existing scores
        const existingScores: Record<string, string> = {};
        for (const sc of sRes.data.scores) {
          existingScores[sc.studentId] = String(sc.marks);
        }
        setScores(existingScores);
      } catch { toast.error('Failed to load assessment'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!assessment) return;
    setSaving(true);
    try {
      const entries = students
        .filter(s => scores[s.id] !== undefined && scores[s.id] !== '')
        .map(s => ({ studentId: s.id, marks: Number(scores[s.id]) }));

      await bulkSubmitScores(assessment.id, entries);
      toast.success(`${entries.length} scores saved`);
      navigate('/assessments');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Error saving scores');
    } finally { setSaving(false); }
  };

  const pct = (mark: string) => {
    if (!assessment || !mark) return '';
    return `${((Number(mark) / assessment.maxMarks) * 100).toFixed(0)}%`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!assessment) return <p className="text-center text-gray-400 py-8">Assessment not found</p>;

  const enteredCount = Object.values(scores).filter(v => v !== '').length;

  return (
    <div>
      <PageHeader
        title={`Enter Scores — ${assessment.name}`}
        subtitle={`${assessment.subject?.name} | Max: ${assessment.maxMarks} marks`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate('/assessments')} className="btn-secondary"><ArrowLeft size={16} /> Back</button>
            <button onClick={handleSave} disabled={saving || enteredCount === 0} className="btn-primary">
              <Save size={16} /> {saving ? 'Saving...' : `Save ${enteredCount} Scores`}
            </button>
          </div>
        }
      />

      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-700">
          <CheckCircle size={16} />
          <span>{enteredCount} of {students.length} scores entered</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Adm No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Score (/{assessment.maxMarks})</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No students in stream. Assign students to this stream first.</td></tr>
            ) : students.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    max={assessment.maxMarks}
                    step={0.5}
                    className="input w-28 py-1"
                    value={scores[s.id] ?? ''}
                    onChange={e => setScores(p => ({ ...p, [s.id]: e.target.value }))}
                    placeholder="—"
                  />
                </td>
                <td className="px-4 py-2 text-gray-500 font-medium">
                  {pct(scores[s.id])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreEntry;

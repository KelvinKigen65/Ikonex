import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { getGradingScales, updateGradingScales } from '@/api/gradingScales.api';
import type { GradingScale } from '@/types';

const GradingScalesPage = () => {
  const [gradingScales, setGradingScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getGradingScales();
        setGradingScales(res.data.gradingScales);
      } catch {
        toast.error('Failed to load grading scales');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleChange = (index: number, field: keyof GradingScale, value: string) => {
    setGradingScales(current => current.map((scale, currentIndex) => {
      if (currentIndex !== index) {
        return scale;
      }

      if (field === 'grade' || field === 'remarks' || field === 'id') {
        return { ...scale, [field]: value };
      }

      return { ...scale, [field]: Number(value) };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateGradingScales(gradingScales);
      setGradingScales(res.data.gradingScales);
      toast.success('Grading scales updated');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save grading scales');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading Scales"
        subtitle="Configure the grade ranges used during results processing"
        actions={<button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Scales'}</button>}
      />

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Grade', 'Min Score', 'Max Score', 'Points', 'Remarks'].map(header => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading grading scales...</td></tr>
            ) : gradingScales.map((scale, index) => (
              <tr key={scale.id} className="border-b border-gray-50">
                <td className="px-4 py-3">
                  <input className="input" value={scale.grade} onChange={e => handleChange(index, 'grade', e.target.value)} />
                </td>
                <td className="px-4 py-3">
                  <input type="number" className="input" value={scale.minScore} onChange={e => handleChange(index, 'minScore', e.target.value)} />
                </td>
                <td className="px-4 py-3">
                  <input type="number" className="input" value={scale.maxScore} onChange={e => handleChange(index, 'maxScore', e.target.value)} />
                </td>
                <td className="px-4 py-3">
                  <input type="number" className="input" value={scale.points} onChange={e => handleChange(index, 'points', e.target.value)} />
                </td>
                <td className="px-4 py-3">
                  <input className="input" value={scale.remarks} onChange={e => handleChange(index, 'remarks', e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradingScalesPage;

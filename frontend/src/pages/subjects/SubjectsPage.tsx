import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import type { Subject, SubjectStatus } from '@/types';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '@/api/subjects.api';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const SubjectsPage = () => {
  const { user }  = useAuth();
  const canEdit   = user?.role !== 'TEACHER';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Subject | null>(null);
  const [form, setForm] = useState<{ code: string; name: string; description: string; status: SubjectStatus }>({
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await getSubjects(); setSubjects(res.data.subjects); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ code: '', name: '', description: '', status: 'ACTIVE' }); setModalOpen(true); };
  const openEdit   = (s: Subject) => { setEditing(s); setForm({ code: s.code, name: s.name, description: s.description || '', status: s.status }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) { await updateSubject(editing.id, form); toast.success('Subject updated'); }
      else { await createSubject(form); toast.success('Subject created'); }
      setModalOpen(false); load();
    } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete subject?')) return;
    try { await deleteSubject(id); toast.success('Deleted'); load(); }
    catch { toast.error('Cannot delete subject in use'); }
  };

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={`${subjects.length} subjects`}
        actions={canEdit ? <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Subject</button> : undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : subjects.map(s => (
          <div key={s.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">{s.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge label={s.status} color={s.status === 'ACTIVE' ? 'green' : 'gray'} />
                {canEdit && (
                  <>
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded ml-1"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                  </>
                )}
              </div>
            </div>
            {s.description && <p className="text-xs text-gray-500 mt-3">{s.description}</p>}
            {s.teacher && (
              <p className="text-xs text-gray-400 mt-2">Teacher: {s.teacher.firstName} {s.teacher.lastName}</p>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input className="input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="MAT" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Mathematics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={!form.code || !form.name} className="btn-primary flex-1 justify-center">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectsPage;

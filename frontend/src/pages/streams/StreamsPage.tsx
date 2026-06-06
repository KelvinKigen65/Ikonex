import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, School, Search } from 'lucide-react';
import type { ClassStream } from '@/types';
import { getStreams, createStream, updateStream, deleteStream } from '@/api/streams.api';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const StreamsPage = () => {
  const { user } = useAuth();
  const [streams, setStreams]     = useState<ClassStream[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<ClassStream | null>(null);
  const [form, setForm]           = useState({ name: '', academicYear: '2024', teacherId: '' });
  const [saving, setSaving]       = useState(false);

  const canEdit = user?.role !== 'TEACHER';

  const load = useCallback(async () => {
    try {
      const res = await getStreams({ search });
      setStreams(res.data.streams);
    } catch { toast.error('Failed to load streams'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', academicYear: '2024', teacherId: user?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (s: ClassStream) => {
    setEditing(s);
    setForm({ name: s.name, academicYear: s.academicYear, teacherId: s.teacherId });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateStream(editing.id, form);
        toast.success('Stream updated');
      } else {
        await createStream(form);
        toast.success('Stream created');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Error saving stream');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stream?')) return;
    try {
      await deleteStream(id);
      toast.success('Stream deleted');
      load();
    } catch { toast.error('Cannot delete stream with students'); }
  };

  return (
    <div>
      <PageHeader
        title="Class Streams"
        subtitle={`${streams.length} streams`}
        actions={canEdit ? (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> New Stream
          </button>
        ) : undefined}
      />

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search streams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : streams.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <School size={48} className="mx-auto mb-3 opacity-40" />
          <p>No streams found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {streams.map(s => (
            <div key={s.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <School size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-xs text-gray-500">AY {s.academicYear}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Students</p>
                  <p className="font-semibold text-gray-800">{s._count?.students ?? 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Subjects</p>
                  <p className="font-semibold text-gray-800">{s._count?.classSubjects ?? 0}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs">Class Teacher</p>
                  <p className="font-medium text-gray-700">
                    {s.classTeacher ? `${s.classTeacher.firstName} ${s.classTeacher.lastName}` : '—'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Stream' : 'New Stream'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stream Name</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Form 1A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input className="input" value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="2024" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StreamsPage;

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { createStudent, getStudent, updateStudent } from '@/api/students.api';
import { getStreams } from '@/api/streams.api';
import type { ClassStream } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import toast from 'react-hot-toast';

const schema = z.object({
  admissionNo:   z.string().min(1, 'Required'),
  firstName:     z.string().min(1, 'Required'),
  lastName:      z.string().min(1, 'Required'),
  gender:        z.enum(['MALE', 'FEMALE']),
  dateOfBirth:   z.string().min(1, 'Required'),
  parentName:    z.string().min(1, 'Required'),
  parentContact: z.string().min(10, 'Enter valid phone number'),
  email:         z.string().email().optional().or(z.literal('')),
  address:       z.string().optional(),
  streamId:      z.string().min(1, 'Select a stream'),
});

type FormData = z.infer<typeof schema>;

const StudentForm = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id && id !== 'new');
  const [streams, setStreams] = useState<ClassStream[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    getStreams().then(r => setStreams(r.data.streams)).catch(() => {});
    if (isEdit && id) {
      getStudent(id).then(r => {
        const s = r.data.student;
        reset({
          ...s,
          dateOfBirth: s.dateOfBirth.split('T')[0],
          email: s.email || '',
          address: s.address || '',
        });
      }).catch(() => toast.error('Failed to load student'));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`).toISOString(),
      };

      if (isEdit && id) {
        await updateStudent(id, payload);
        toast.success('Student updated');
      } else {
        await createStudent(payload);
        toast.success('Student registered');
      }
      navigate('/students');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Error saving student');
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Student' : 'Register Student'}
        actions={
          <button onClick={() => navigate('/students')} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Admission Number" error={errors.admissionNo?.message}>
            <input {...register('admissionNo')} className="input" placeholder="ADM001" />
          </Field>
          <Field label="Class Stream" error={errors.streamId?.message}>
            <select {...register('streamId')} className="input">
              <option value="">Select stream...</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="First Name" error={errors.firstName?.message}>
            <input {...register('firstName')} className="input" placeholder="Alice" />
          </Field>
          <Field label="Last Name" error={errors.lastName?.message}>
            <input {...register('lastName')} className="input" placeholder="Kamau" />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <select {...register('gender')} className="input">
              <option value="">Select gender...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>
          <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
            <input {...register('dateOfBirth')} type="date" className="input" />
          </Field>
          <Field label="Parent/Guardian Name" error={errors.parentName?.message}>
            <input {...register('parentName')} className="input" placeholder="John Kamau" />
          </Field>
          <Field label="Parent Contact" error={errors.parentContact?.message}>
            <input {...register('parentContact')} className="input" placeholder="0712345678" />
          </Field>
          <Field label="Email (Optional)" error={errors.email?.message}>
            <input {...register('email')} type="email" className="input" placeholder="student@email.com" />
          </Field>
          <Field label="Address (Optional)" error={errors.address?.message}>
            <input {...register('address')} className="input" placeholder="Nairobi, Kenya" />
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/students')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            <Save size={16} />
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Student' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;

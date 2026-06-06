import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Mail, MapPin, Phone, User, TrendingUp } from 'lucide-react';
import { getStudent } from '@/api/students.api';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import type { StudentDetailRecord } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const canEdit = !!user && user.role !== 'STUDENT';

  useEffect(() => {
    if (!id) return;
    getStudent(id)
      .then(res => setStudent(res.data.student))
      .catch(() => toast.error('Failed to load student'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div>
        <button onClick={() => navigate('/students')} className="btn-secondary mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="card text-center py-12 text-gray-400">Student not found</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={student.admissionNo}
        actions={canEdit ? (
          <button onClick={() => navigate(`/students/${student.id}/edit`)} className="btn-primary">
            <Edit2 size={16} /> Edit Student
          </button>
        ) : undefined}
      />

      <button onClick={() => navigate('/students')} className="btn-secondary mb-4">
        <ArrowLeft size={16} /> Back to Students
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold mb-4">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <h2 className="font-semibold text-gray-900">{student.firstName} {student.lastName}</h2>
            <p className="text-sm text-gray-500">{student.classStream?.name}</p>
            <div className="flex gap-2 mt-4">
              <Badge label={student.gender} color={student.gender === 'FEMALE' ? 'blue' : 'green'} />
              <Badge label={student.isActive ? 'Active' : 'Inactive'} color={student.isActive ? 'green' : 'red'} />
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Date of Birth</p>
              <p className="font-medium text-gray-800">{student.dateOfBirth?.split('T')[0]}</p>
            </div>
            <div>
              <p className="text-gray-400">Parent/Guardian</p>
              <p className="font-medium text-gray-800">{student.parentName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-700">{student.parentContact}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-700">{student.email || 'No email recorded'}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-gray-700">{student.address || 'No address recorded'}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-700">Created {student.createdAt?.split('T')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Performance By Subject</h2>
          </div>
          {student.scores.length === 0 ? (
            <p className="text-sm text-gray-400">No scores recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {student.scores.map(score => {
                const percentage = score.assessment.maxMarks > 0
                  ? (score.marks / score.assessment.maxMarks) * 100
                  : 0;
                return (
                  <div key={score.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{score.assessment.subject.name}</p>
                        <p className="text-xs text-gray-400">
                          {score.assessment.name} • {score.assessment.term} {score.assessment.academicYear}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-700">
                          {score.marks} / {score.assessment.maxMarks}
                        </p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    {score.remarks ? <p className="text-xs text-gray-500 mt-2">{score.remarks}</p> : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Generated Report Cards</h2>
          {student.reportCards.length === 0 ? (
            <p className="text-sm text-gray-400">No report cards generated yet.</p>
          ) : (
            <div className="space-y-3">
              {student.reportCards.map(report => (
                <div key={report.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{report.term} {report.academicYear}</p>
                      <p className="text-xs text-gray-400">Generated {report.generatedAt.split('T')[0]}</p>
                    </div>
                    <Badge label={`${report.grade} • Pos ${report.position}/${report.totalStudents}`} color="blue" />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Average {report.averageScore.toFixed(1)}% • Total Marks {report.totalMarks.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

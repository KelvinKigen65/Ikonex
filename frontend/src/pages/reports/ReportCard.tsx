import { useEffect, useState } from 'react';
import { FileDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { getStreams } from '@/api/streams.api';
import { getStudents } from '@/api/students.api';
import { getStudentReportCard } from '@/api/results.api';
import type { ClassStream, Student, StudentReportCard as StudentReportCardData } from '@/types';

const ReportCard = () => {
  const [streams, setStreams] = useState<ClassStream[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({ streamId: '', studentId: '', term: 'Term 1', academicYear: '2024' });
  const [reportCard, setReportCard] = useState<StudentReportCardData | null>(null);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const loadStreams = async () => {
      setLoadingStreams(true);
      try {
        const res = await getStreams();
        setStreams(res.data.streams);
      } catch {
        toast.error('Failed to load streams');
      } finally {
        setLoadingStreams(false);
      }
    };

    void loadStreams();
  }, []);

  const handleStreamChange = async (streamId: string) => {
    setFilters(current => ({ ...current, streamId, studentId: '' }));
    setReportCard(null);
    setStudents([]);

    if (!streamId) {
      return;
    }

    setLoadingStudents(true);
    try {
      const res = await getStudents({ streamId, limit: 200 });
      setStudents(res.data.students);
    } catch {
      toast.error('Failed to load students for stream');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleGenerate = async () => {
    if (!filters.studentId) {
      toast.error('Select a student');
      return;
    }

    setLoadingReport(true);
    try {
      const res = await getStudentReportCard({
        studentId: filters.studentId,
        term: filters.term,
        academicYear: filters.academicYear,
      });
      setReportCard(res.data.reportCard);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate report card');
      setReportCard(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Report Cards"
        subtitle="Generate print-ready report cards and export them with your browser's Save as PDF option"
        actions={
          reportCard ? (
            <button onClick={handlePrint} className="btn-primary">
              <FileDown size={16} />
              Print / Save PDF
            </button>
          ) : undefined
        }
      />

      <div className="card print:hidden">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stream</label>
            <select
              className="input"
              value={filters.streamId}
              onChange={e => void handleStreamChange(e.target.value)}
              disabled={loadingStreams}
            >
              <option value="">Select stream...</option>
              {streams.map(stream => (
                <option key={stream.id} value={stream.id}>{stream.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Student</label>
            <select
              className="input"
              value={filters.studentId}
              onChange={e => setFilters(current => ({ ...current, studentId: e.target.value }))}
              disabled={!filters.streamId || loadingStudents}
            >
              <option value="">{loadingStudents ? 'Loading...' : 'Select student...'}</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.admissionNo})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
            <select
              className="input"
              value={filters.term}
              onChange={e => setFilters(current => ({ ...current, term: e.target.value }))}
            >
              {['Term 1', 'Term 2', 'Term 3'].map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
            <input
              className="input"
              value={filters.academicYear}
              onChange={e => setFilters(current => ({ ...current, academicYear: e.target.value }))}
            />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loadingReport} className="btn-primary mt-4">
          <Search size={16} />
          {loadingReport ? 'Generating...' : 'Generate Report Card'}
        </button>
      </div>

      {reportCard ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-500">Ikonex Academy</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Student Report Card</h2>
              <p className="text-sm text-gray-500 mt-2">
                {reportCard.report.term} {reportCard.report.academicYear} • Generated {new Date(reportCard.report.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p className="font-semibold text-gray-900">{reportCard.student.firstName} {reportCard.student.lastName}</p>
              <p>{reportCard.student.admissionNo}</p>
              <p>{reportCard.student.streamName}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{reportCard.report.averageScore.toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Mean Grade</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{reportCard.report.meanGrade}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Position</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {reportCard.report.position} / {reportCard.report.totalStudents}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Total Points</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{reportCard.report.totalPoints.toFixed(1)}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Points</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {reportCard.report.subjects.map(subject => (
                    <tr key={subject.subjectId} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-900">{subject.subjectName}</td>
                      <td className="px-4 py-3">{subject.score.toFixed(1)}%</td>
                      <td className="px-4 py-3">{subject.grade}</td>
                      <td className="px-4 py-3">{subject.points.toFixed(1)}</td>
                      <td className="px-4 py-3">{subject.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <div className="rounded-2xl border border-gray-200 p-5 min-h-32">
              <p className="text-xs uppercase text-gray-400">Teacher Remarks</p>
              <p className="text-sm text-gray-500 mt-3">
                {reportCard.report.meanGrade.startsWith('A') || reportCard.report.meanGrade.startsWith('B')
                  ? 'Consistent progress. Keep challenging yourself across all subjects.'
                  : 'Steady effort observed. Focus on revision and attendance to improve overall performance.'}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 min-h-32">
              <p className="text-xs uppercase text-gray-400">Principal Remarks</p>
              <p className="text-sm text-gray-500 mt-3">
                Continue building strong academic habits and work closely with your teachers to hit next-term goals.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-sm text-gray-500">
          Select a stream and student, then generate a report card. The page is print-ready for PDF export.
        </div>
      )}
    </div>
  );
};

export default ReportCard;

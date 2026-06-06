import { useEffect, useMemo, useState } from 'react';
import { FileDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/ui/PageHeader';
import { getStreams } from '@/api/streams.api';
import { getClassReport } from '@/api/results.api';
import type { ClassPerformanceReport as ClassPerformanceReportData, ClassStream } from '@/types';

const ClassReport = () => {
  const [streams, setStreams] = useState<ClassStream[]>([]);
  const [filters, setFilters] = useState({ streamId: '', term: 'Term 1', academicYear: '2024' });
  const [classReport, setClassReport] = useState<ClassPerformanceReportData | null>(null);
  const [loadingStreams, setLoadingStreams] = useState(false);
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

  const performanceSummary = useMemo(() => {
    if (!classReport) {
      return null;
    }

    const averageOfAverages = classReport.results.length
      ? classReport.results.reduce((sum, student) => sum + student.averageScore, 0) / classReport.results.length
      : 0;

    return {
      averageOfAverages,
      above70: classReport.results.filter(student => student.averageScore >= 70).length,
    };
  }, [classReport]);

  const handleGenerate = async () => {
    if (!filters.streamId) {
      toast.error('Select a stream');
      return;
    }

    setLoadingReport(true);
    try {
      const res = await getClassReport(filters);
      setClassReport(res.data.classReport);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate class report');
      setClassReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Performance Report"
        subtitle="Generate stream-level performance summaries and export them as PDF via your browser print dialog"
        actions={
          classReport ? (
            <button onClick={() => window.print()} className="btn-primary">
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
              onChange={e => setFilters(current => ({ ...current, streamId: e.target.value }))}
              disabled={loadingStreams}
            >
              <option value="">Select stream...</option>
              {streams.map(stream => (
                <option key={stream.id} value={stream.id}>{stream.name}</option>
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
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={loadingReport} className="btn-primary w-full">
              <Search size={16} />
              {loadingReport ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {classReport ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-500">Ikonex Academy</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Class Performance Report</h2>
              <p className="text-sm text-gray-500 mt-2">
                {classReport.stream.name} • {classReport.term} {classReport.academicYear}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p className="font-semibold text-gray-900">{classReport.totalStudents} students</p>
              <p>Generated {new Date(classReport.generatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Stream Average</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {performanceSummary ? performanceSummary.averageOfAverages.toFixed(1) : '0.0'}%
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Top Performer</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {classReport.topPerformer?.studentName || 'No data'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">Highest Grade</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {classReport.topPerformer?.meanGrade || '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-400">70% and Above</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {performanceSummary?.above70 ?? 0}
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2 mt-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance Summary</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Average</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Highest</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Lowest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classReport.subjectPerformance.map(subject => (
                      <tr key={subject.subjectId} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900">{subject.subjectName}</td>
                        <td className="px-4 py-3">{subject.averageScore.toFixed(1)}%</td>
                        <td className="px-4 py-3">{subject.highestScore.toFixed(1)}%</td>
                        <td className="px-4 py-3">{subject.lowestScore.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Rankings</h3>
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Pos</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Average</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classReport.results.map(result => (
                      <tr key={result.studentId} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-semibold text-gray-900">{result.position}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{result.studentName}</p>
                          <p className="text-xs text-gray-400">{result.admissionNo}</p>
                        </td>
                        <td className="px-4 py-3">{result.averageScore.toFixed(1)}%</td>
                        <td className="px-4 py-3">{result.meanGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-sm text-gray-500">
          Generate a class report to review stream-level rankings, subject performance, and print a PDF-ready summary.
        </div>
      )}
    </div>
  );
};

export default ClassReport;

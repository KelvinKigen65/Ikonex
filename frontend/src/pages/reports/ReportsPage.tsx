import { Link } from 'react-router-dom';
import { BarChart3, FileText, GraduationCap } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const reportCards = [
  {
    title: 'Class Performance PDF',
    description: 'Generate a printable class performance summary with rankings and subject averages.',
    to: '/reports/class',
    icon: BarChart3,
  },
  {
    title: 'Student Report Cards',
    description: 'Generate an individual student report card and export it as PDF from the browser.',
    to: '/reports/student',
    icon: GraduationCap,
  },
];

const ReportsPage = () => (
  <div>
    <PageHeader title="Reports" subtitle="Generate and review academic performance reports" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reportCards.map(({ title, description, to, icon: Icon }) => (
        <Link key={title} to={to} className="card hover:shadow-md transition-shadow block">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
              <span className="inline-flex items-center text-sm font-medium text-primary-600 mt-4">
                Open report
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>

    <div className="card mt-6">
      <div className="flex items-start gap-3">
        <FileText size={20} className="text-gray-400 mt-0.5" />
        <div>
          <h2 className="font-semibold text-gray-900">Report workflow</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add students, subjects, and assessments first. Enter scores for an assessment, then process results for a stream and term.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ReportsPage;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import StreamsPage from '@/pages/streams/StreamsPage';
import StudentsPage from '@/pages/students/StudentsPage';
import StudentDetail from '@/pages/students/StudentDetail';
import StudentForm from '@/pages/students/StudentForm';
import SubjectsPage from '@/pages/subjects/SubjectsPage';
import AssessmentsPage from '@/pages/assessments/AssessmentsPage';
import ScoreEntry from '@/pages/assessments/ScoreEntry';
import ResultsPage from '@/pages/results/ResultsPage';
import ReportsPage from '@/pages/reports/ReportsPage';

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/streams" element={<StreamsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/new" element={<StudentForm />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/students/:id/edit" element={<StudentForm />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/assessments/:id/scores" element={<ScoreEntry />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;

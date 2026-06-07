import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ClassPage from './pages/ClassPage';
import StudentPage from './pages/StudentPage';
import BookPage from './pages/BookPage';
import BorrowingPage from './pages/BorrowingPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><ClassPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentPage /></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><BookPage /></ProtectedRoute>} />
      <Route path="/borrowings" element={<ProtectedRoute><BorrowingPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
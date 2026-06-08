import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ObjectivesPage } from '@/features/objectives/ObjectivesPage';
import { CreateObjectivePage } from '@/features/objectives/CreateObjectivePage';
import { ObjectiveDetailPage } from '@/features/objectives/ObjectiveDetailPage';
import { KeyResultDetailPage } from '@/features/key-results/KeyResultDetailPage';
import { CreateKeyResultPage } from '@/features/key-results/CreateKeyResultPage';
import { CheckInPage } from '@/features/check-ins/CheckInPage';
import { QuickCheckInPage } from '@/features/check-ins/QuickCheckInPage';
import { CheckInSessionsPage } from '@/features/check-in-sessions/CheckInSessionsPage';
import { CheckInSessionDetailPage } from '@/features/check-in-sessions/CheckInSessionDetailPage';
import { PeriodsPage } from '@/features/periods/PeriodsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { OrgChartPage } from '@/features/org/OrgChartPage';
import { TaskBoardPage } from '@/features/tasks/TaskBoardPage';
import { MinutesListPage } from '@/features/minutes/MinutesListPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-okrs" element={<Navigate to="/objectives" replace />} />
            <Route path="/objectives" element={<ObjectivesPage />} />
            <Route path="/objectives/new" element={<CreateObjectivePage />} />
            <Route path="/objectives/:id" element={<ObjectiveDetailPage />} />
            <Route path="/key-results/new" element={<CreateKeyResultPage />} />
            <Route path="/key-results/:id" element={<KeyResultDetailPage />} />
            <Route path="/check-in" element={<CheckInPage />} />
            <Route path="/check-in/:krId" element={<QuickCheckInPage />} />
            <Route path="/check-in-sessions" element={<CheckInSessionsPage />} />
            <Route path="/check-in-sessions/:id" element={<CheckInSessionDetailPage />} />
            <Route path="/periods" element={<PeriodsPage />} />
            <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/org-chart" element={<OrgChartPage />} />
            <Route path="/tasks" element={<TaskBoardPage />} />
            <Route path="/minutes" element={<MinutesListPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

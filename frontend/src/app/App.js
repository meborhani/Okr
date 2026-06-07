"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = App;
const react_router_dom_1 = require("react-router-dom");
const react_query_1 = require("@tanstack/react-query");
const Toast_1 = require("@/components/ui/Toast");
const AppLayout_1 = require("@/components/layout/AppLayout");
const ProtectedRoute_1 = require("@/routes/ProtectedRoute");
const LoginPage_1 = require("@/features/auth/LoginPage");
const DashboardPage_1 = require("@/features/dashboard/DashboardPage");
const MyOkrsPage_1 = require("@/features/objectives/MyOkrsPage");
const ObjectivesPage_1 = require("@/features/objectives/ObjectivesPage");
const CreateObjectivePage_1 = require("@/features/objectives/CreateObjectivePage");
const ObjectiveDetailPage_1 = require("@/features/objectives/ObjectiveDetailPage");
const KeyResultDetailPage_1 = require("@/features/key-results/KeyResultDetailPage");
const CreateKeyResultPage_1 = require("@/features/key-results/CreateKeyResultPage");
const CheckInPage_1 = require("@/features/check-ins/CheckInPage");
const QuickCheckInPage_1 = require("@/features/check-ins/QuickCheckInPage");
const PeriodsPage_1 = require("@/features/periods/PeriodsPage");
const ReportsPage_1 = require("@/features/reports/ReportsPage");
const UsersPage_1 = require("@/features/users/UsersPage");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});
function App() {
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <Toast_1.ToastContainer />
      <react_router_dom_1.BrowserRouter>
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/login" element={<LoginPage_1.LoginPage />}/>
          <react_router_dom_1.Route element={<ProtectedRoute_1.ProtectedRoute><AppLayout_1.AppLayout /></ProtectedRoute_1.ProtectedRoute>}>
            <react_router_dom_1.Route path="/dashboard" element={<DashboardPage_1.DashboardPage />}/>
            <react_router_dom_1.Route path="/my-okrs" element={<MyOkrsPage_1.MyOkrsPage />}/>
            <react_router_dom_1.Route path="/objectives" element={<ObjectivesPage_1.ObjectivesPage />}/>
            <react_router_dom_1.Route path="/objectives/new" element={<CreateObjectivePage_1.CreateObjectivePage />}/>
            <react_router_dom_1.Route path="/objectives/:id" element={<ObjectiveDetailPage_1.ObjectiveDetailPage />}/>
            <react_router_dom_1.Route path="/key-results/new" element={<CreateKeyResultPage_1.CreateKeyResultPage />}/>
            <react_router_dom_1.Route path="/key-results/:id" element={<KeyResultDetailPage_1.KeyResultDetailPage />}/>
            <react_router_dom_1.Route path="/check-in" element={<CheckInPage_1.CheckInPage />}/>
            <react_router_dom_1.Route path="/check-in/:krId" element={<QuickCheckInPage_1.QuickCheckInPage />}/>
            <react_router_dom_1.Route path="/periods" element={<PeriodsPage_1.PeriodsPage />}/>
            <react_router_dom_1.Route path="/reports" element={<ReportsPage_1.ReportsPage />}/>
            <react_router_dom_1.Route path="/users" element={<UsersPage_1.UsersPage />}/>
          </react_router_dom_1.Route>
          <react_router_dom_1.Route path="*" element={<react_router_dom_1.Navigate to="/dashboard" replace/>}/>
        </react_router_dom_1.Routes>
      </react_router_dom_1.BrowserRouter>
    </react_query_1.QueryClientProvider>);
}
//# sourceMappingURL=App.js.map
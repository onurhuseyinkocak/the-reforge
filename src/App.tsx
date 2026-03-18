import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Apply from "./pages/Apply";
import ApplicationSubmitted from "./pages/ApplicationSubmitted";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import CheckIn from "./pages/student/CheckIn";
import Tasks from "./pages/student/Tasks";
import ProgressPage from "./pages/student/ProgressPage";
import Messages from "./pages/student/Messages";
import Profile from "./pages/student/Profile";
import LifeAreas from "./pages/student/LifeAreas";
import Resources from "./pages/student/Resources";
import Community from "./pages/student/Community";
import Guilds from "./pages/student/Guilds";
import Rankings from "./pages/student/Rankings";
import ForgedWall from "./pages/student/ForgedWall";
import GuildCreate from "./pages/student/GuildCreate";
import GuildDashboard from "./pages/student/GuildDashboard";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetail from "./pages/admin/AdminStudentDetail";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminApplications from "./pages/admin/AdminApplications";

const queryClient = new QueryClient();

const AuthRedirect = () => {
  const { user, loading, role } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/application-submitted" element={<ApplicationSubmitted />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Student routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/life-areas" element={<LifeAreas />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/community" element={<Community />} />
              <Route path="/guilds" element={<Guilds />} />
              <Route path="/guilds/create" element={<GuildCreate />} />
              <Route path="/guild" element={<GuildDashboard />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/forged" element={<ForgedWall />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute requiredRole="admin"><DashboardLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/students/:id" element={<AdminStudentDetail />} />
              <Route path="/admin/tasks" element={<AdminTasks />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

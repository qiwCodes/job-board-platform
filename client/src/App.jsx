import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ApplicantsList from './pages/ApplicantsList';
import CompanyDashboard from './pages/CompanyDashboard';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import JobList from './pages/JobList';
import Login from './pages/Login';
import ManageJobs from './pages/ManageJobs';
import MyApplications from './pages/MyApplications';
import NotFound from './pages/NotFound';
import PostJob from './pages/PostJob';
import ProfilePage from './pages/ProfilePage';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute allowedRoles={['applicant']} />}>
              <Route path="/dashboard" element={<ApplicantDashboard />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['company']} />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/post-job" element={<PostJob />} />
              <Route path="/company/jobs" element={<ManageJobs />} />
              <Route path="/company/jobs/:id/applicants" element={<ApplicantsList />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

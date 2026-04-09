import { Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/layout/Shell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentList from './pages/students/StudentList.jsx';
import StudentDetail from './pages/students/StudentDetail.jsx';
import StudentForm from './pages/students/StudentForm.jsx';
import ClassList from './pages/classes/ClassList.jsx';
import ClassDetail from './pages/classes/ClassDetail.jsx';
import ClassForm from './pages/classes/ClassForm.jsx';
import AssignmentManager from './pages/assignments/AssignmentManager.jsx';
import AttendanceSheet from './pages/attendance/AttendanceSheet.jsx';
import AttendanceRegister from './pages/attendance/AttendanceRegister.jsx';
import AttendanceReport from './pages/attendance/AttendanceReport.jsx';
import FeeList from './pages/fees/FeeList.jsx';
import FeeForm from './pages/fees/FeeForm.jsx';
import SchoolProfile from './pages/profile/SchoolProfile.jsx';

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/new" element={<StudentForm />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/students/:id/edit" element={<StudentForm />} />
        <Route path="/classes" element={<ClassList />} />
        <Route path="/classes/new" element={<ClassForm />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/classes/:id/edit" element={<ClassForm />} />
        <Route path="/assignments" element={<AssignmentManager />} />
        <Route path="/attendance" element={<AttendanceSheet />} />
        <Route path="/attendance/register" element={<AttendanceRegister />} />
        <Route path="/attendance/report" element={<AttendanceReport />} />
        <Route path="/fees" element={<FeeList />} />
        <Route path="/fees/new" element={<FeeForm />} />
        <Route path="/fees/:id/edit" element={<FeeForm />} />
        <Route path="/profile" element={<SchoolProfile />} />
      </Routes>
    </Shell>
  );
}

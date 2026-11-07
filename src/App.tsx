/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { StorageService } from './services/storage';

// Layout & Navigation
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';

// Views
import { Dashboard } from './components/Dashboard';

// Admin Views
import { UserManagement } from './components/admin/UserManagement';
import { AcademicYearManagement } from './components/admin/AcademicYearManagement';
import { StudentManagement } from './components/admin/StudentManagement';
import { ClassRosterManagement } from './components/admin/ClassRosterManagement';
import { SubjectManagement } from './components/admin/SubjectManagement';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { TeacherAssignmentView } from './components/admin/TeacherAssignment';
import { SchedulePlanner } from './components/admin/SchedulePlanner';

// Homeroom Views
import { AttendanceCheck } from './components/homeroom/AttendanceCheck';
import { BMICalculator } from './components/homeroom/BMICalculator';

// Teacher Views
import { ScoreEntryPP5 } from './components/teacher/ScoreEntryPP5';
import { TeachingLogModal } from './components/teacher/TeachingLogModal';

// Student / Parent Portal & GAS Exporter
import { StudentPortal } from './components/student/StudentPortal';
import { GASCodeExporter } from './components/gas/GASCodeExporter';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeachingLogModalOpen, setIsTeachingLogModalOpen] = useState(false);
  const [isGASExporterOpen, setIsGASExporterOpen] = useState(false);

  const [activeView, setActiveView] = useState<string>('dashboard');

  useEffect(() => {
    // Ensure initial mock data exists
    if (StorageService.getStudents().length === 0) {
      StorageService.resetAllData();
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Stay on dashboard or switch to relevant view
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveView('dashboard');
    setIsSidebarOpen(false);
  };

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            onOpenTeachingLog={() => setIsTeachingLogModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        );

      // Admin Views
      case 'admin-users':
        return <UserManagement onBack={() => setActiveView('dashboard')} />;
      case 'admin-academic-year':
        return <AcademicYearManagement onBack={() => setActiveView('dashboard')} />;
      case 'admin-students':
        return <StudentManagement onBack={() => setActiveView('dashboard')} currentUser={currentUser} />;
      case 'admin-class-roster':
        return <ClassRosterManagement onBack={() => setActiveView('dashboard')} />;
      case 'admin-subjects':
        return <SubjectManagement onBack={() => setActiveView('dashboard')} />;
      case 'admin-teachers':
        return <TeacherManagement onBack={() => setActiveView('dashboard')} />;
      case 'admin-assignments':
        return <TeacherAssignmentView onBack={() => setActiveView('dashboard')} />;
      case 'admin-schedule-planner':
        return <SchedulePlanner onBack={() => setActiveView('dashboard')} />;

      // Homeroom Views
      case 'homeroom-attendance':
        return <AttendanceCheck onBack={() => setActiveView('dashboard')} currentUser={currentUser} />;
      case 'homeroom-bmi':
        return <BMICalculator onBack={() => setActiveView('dashboard')} currentUser={currentUser} />;

      // Teacher Views
      case 'teacher-scores':
        return <ScoreEntryPP5 onBack={() => setActiveView('dashboard')} currentUser={currentUser} />;
      case 'teacher-log':
        return (
          <Dashboard
            onOpenTeachingLog={() => setIsTeachingLogModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        );

      // Student / Parent Portal
      case 'student-portal':
        return <StudentPortal onBack={() => setActiveView('dashboard')} />;

      default:
        return (
          <Dashboard
            onOpenTeachingLog={() => setIsTeachingLogModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-800 font-['Sarabun'] antialiased flex flex-col">
      {/* Top Header Bar */}
      <Header
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        activeView={activeView}
        onNavigateHome={() => setActiveView('dashboard')}
        onOpenStudentPortal={() => setActiveView('student-portal')}
        onOpenGASExporter={() => setIsGASExporterOpen(true)}
      />

      {/* Hidden Drawer Sidebar Menu (Active when authorized) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Teaching Log Entry Modal */}
      <TeachingLogModal
        isOpen={isTeachingLogModalOpen}
        onClose={() => setIsTeachingLogModalOpen(false)}
        currentUser={currentUser}
        onLogSaved={() => {
          // Refresh view if on dashboard
        }}
      />

      {/* Google Apps Script Code Exporter Modal */}
      <GASCodeExporter
        isOpen={isGASExporterOpen}
        onClose={() => setIsGASExporterOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 py-6 text-center text-xs border-t-2 border-black no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK"
              alt="โลโก้โรงเรียน"
              className="h-6 w-auto object-contain bg-white p-0.5 rounded border border-emerald-800"
            />
            <span className="font-bold text-amber-200">
              สารสนเทศ SSIS (Suthicha School Information System)
            </span>
          </div>
          <p>© {new Date().getFullYear()} โรงเรียนอนุบาลสุธิชา. สงวนลิขสิทธิ์ทุกประการ.</p>
        </div>
      </footer>
    </div>
  );
}

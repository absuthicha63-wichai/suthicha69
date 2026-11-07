/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  UserCheck,
  BookOpen,
  UserCog,
  CalendarCheck,
  ClipboardList,
  Scale,
  Award,
  BookCheck,
  QrCode,
  X,
  Home,
  ShieldAlert,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeView,
  onSelectView,
}) => {
  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.roles.includes('admin');
  const isHomeroom = currentUser.roles.includes('homeroom') || isAdmin;
  const isTeacher = currentUser.roles.includes('teacher') || isAdmin;

  const handleNav = (viewKey: string) => {
    onSelectView(viewKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-[#fcfbf7] border-r-2 border-black h-full shadow-2xl flex flex-col z-10 font-['Sarabun'] overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-emerald-900 text-white p-4 border-b border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK"
              alt="โลโก้"
              className="h-8 w-8 object-contain bg-white p-0.5 rounded border border-black"
            />
            <div>
              <h2 className="text-base font-bold text-amber-200 leading-none">เมนูระบบ SSIS</h2>
              <p className="text-[11px] text-emerald-200 mt-0.5">{currentUser.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Public / General Menu */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
              เมนูหลัก
            </p>
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium border text-left transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-emerald-700 text-white border-black shadow-sm font-bold'
                  : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>1. หน้าแดชบอร์ดหลัก (Dashboard)</span>
            </button>
          </div>

          {/* Admin System (ผู้ดูแลระบบ) */}
          {isAdmin && (
            <div>
              <div className="px-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>ระบบผู้ดูแลระบบ (Admin)</span>
              </div>
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('admin-users')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-users'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>1. ระบบจัดการผู้ใช้งาน</span>
                </button>

                <button
                  onClick={() => handleNav('admin-academic-year')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-academic-year'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>2. ระบบจัดการปีการศึกษา / ภาคเรียน</span>
                </button>

                <button
                  onClick={() => handleNav('admin-students')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-students'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>3. ระบบข้อมูลนักเรียน (5 ส่วน)</span>
                </button>

                <button
                  onClick={() => handleNav('admin-class-roster')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-class-roster'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>4. ระบบจัดการนักเรียนเข้าชั้นเรียน</span>
                </button>

                <button
                  onClick={() => handleNav('admin-subjects')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-subjects'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>5. ระบบจัดการรายวิชา</span>
                </button>

                <button
                  onClick={() => handleNav('admin-teachers')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-teachers'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <UserCog className="w-4 h-4 text-emerald-700" />
                  <span>6. ระบบข้อมูลครูและบุคลากร</span>
                </button>

                <button
                  onClick={() => handleNav('admin-assignments')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-assignments'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-emerald-700" />
                  <span>7. มอบหมายครูผู้สอน / ครูประจำชั้น</span>
                </button>

                <button
                  onClick={() => handleNav('admin-schedule-planner')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'admin-schedule-planner'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-amber-600" />
                  <span>8. เมนูจัดตารางสอน (Smart Drag&Drop)</span>
                </button>
              </div>
            </div>
          )}

          {/* Homeroom Teacher Menu (ครูประจำชั้น) */}
          {isHomeroom && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                ระบบครูประจำชั้น
              </p>
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('homeroom-attendance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'homeroom-attendance'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-700" />
                  <span>เช็คชื่อประจำวัน</span>
                </button>

                <button
                  onClick={() => handleNav('homeroom-bmi')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'homeroom-bmi'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <Scale className="w-4 h-4 text-sky-600" />
                  <span>ชั่งน้ำหนัก-วัดส่วนสูงคำนวณ BMI</span>
                </button>
              </div>
            </div>
          )}

          {/* Subject Teacher Menu (ครูผู้สอน) */}
          {isTeacher && (
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                ระบบครูผู้สอน
              </p>
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => handleNav('teacher-scores')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'teacher-scores'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <BookCheck className="w-4 h-4 text-emerald-700" />
                  <span>บันทึกคะแนนรายวิชา (ปพ.5)</span>
                </button>

                <button
                  onClick={() => handleNav('teacher-log')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    activeView === 'teacher-log'
                      ? 'bg-emerald-800 text-white border-black font-bold'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-black'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>ระบบบันทึกการเข้าสอน (QR Code)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Back to Home button */}
        <div className="p-3 border-t border-black bg-emerald-50">
          <button
            onClick={() => handleNav('dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg border border-black shadow transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก (Dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

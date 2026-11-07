/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, AttendanceRecord, ScheduleSlot, SchoolClass } from '../../types';
import { StorageService } from '../../services/storage';
import { QrCode, Search, Calendar, BookOpen, Award, CheckCircle2, ArrowLeft, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface StudentPortalProps {
  onBack: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onBack }) => {
  const [searchCode, setSearchCode] = useState('STD6901');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const students = StorageService.getStudents();
    return students.find((s) => s.part1.studentCode === 'STD6901') || students[0] || null;
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance' | 'grades'>('schedule');
  const [showShareQR, setShowShareQR] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const students = StorageService.getStudents();
    const found = students.find(
      (s) =>
        s.part1.studentCode.trim().toLowerCase() === searchCode.trim().toLowerCase() ||
        s.part1.citizenId.trim() === searchCode.trim() ||
        s.part1.firstName.includes(searchCode.trim())
    );

    if (found) {
      setCurrentStudent(found);
    } else {
      alert('ไม่พบข้อมูลนักเรียน รหัสนี้');
    }
  };

  const schedules = StorageService.getSchedules();
  const attendance = StorageService.getAttendance();

  // Student specific data
  const studentSchedules = currentStudent
    ? schedules.filter((s) => s.className === currentStudent.part1.className)
    : [];

  const studentAttendance = currentStudent
    ? attendance.filter((a) => a.studentId === currentStudent.id)
    : [];

  const appUrl = window.location.href;

  return (
    <div className="space-y-6 font-['Sarabun'] pb-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-600 to-emerald-900 text-white p-5 rounded-xl border-2 border-black shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-amber-300" />
              ระบบสารสนเทศสำหรับนักเรียนและผู้ปกครอง (Parent & Student Portal)
            </h2>
            <p className="text-xs text-amber-200">ตรวจสอบผลการเรียน ตารางเรียน และประวัติการเข้าเรียน 24 ชั่วโมง</p>
          </div>
        </div>

        <button
          onClick={() => setShowShareQR(!showShareQR)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-lg border border-black shadow transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>แชร์ลิงก์ / QR Code เข้าถึง</span>
        </button>
      </div>

      {/* Share QR Modal */}
      {showShareQR && (
        <div className="p-4 bg-white rounded-xl border-2 border-black text-center space-y-3 shadow-md">
          <h4 className="text-xs font-bold text-slate-800">
            QR Code และ URL สำหรับผู้ปกครองใช้งานบนมือถือ:
          </h4>
          <div className="p-3 bg-cream inline-block rounded-xl border border-black">
            <QRCodeSVG value={appUrl} size={150} />
          </div>
          <p className="text-[11px] font-mono text-slate-600 break-all">{appUrl}</p>
        </div>
      )}

      {/* Student Search Bar */}
      <div className="bg-white p-4 rounded-xl border-2 border-black shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
            ค้นหานักเรียน (ระบุเลขประจำตัว / เลขประชาชน / ชื่อ):
          </span>
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-black font-mono font-bold"
              placeholder="ระบุ STD6901..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold rounded-lg border border-black shadow"
          >
            ค้นหาข้อมูล
          </button>
        </form>
      </div>

      {/* Student Profile Card */}
      {currentStudent && (
        <div className="bg-white p-5 rounded-xl border-2 border-black shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-200">
            <img
              src={
                currentStudent.part1.photoUrl ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
              }
              alt="รูปนักเรียน"
              className="w-20 h-20 rounded-full border-2 border-black object-cover shadow-sm"
            />
            <div className="text-center sm:text-left">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-400 text-emerald-950 border border-black rounded">
                ชั้น {currentStudent.part1.className} (เลขที่ {currentStudent.part1.studentNumber})
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                {currentStudent.part1.prefix} {currentStudent.part1.firstName}{' '}
                {currentStudent.part1.lastName}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                เลขประจำตัว: <strong className="font-mono text-emerald-900">{currentStudent.part1.studentCode}</strong> | GPA สะสม: <strong className="text-emerald-800 font-extrabold">{currentStudent.part3.gpa.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-emerald-100 rounded-xl border border-black text-xs font-bold">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 border ${
                activeTab === 'schedule'
                  ? 'bg-emerald-900 text-amber-200 border-black shadow'
                  : 'bg-white text-slate-800 border-transparent'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>1. ตารางเรียน (Timetable)</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 border ${
                activeTab === 'attendance'
                  ? 'bg-emerald-900 text-amber-200 border-black shadow'
                  : 'bg-white text-slate-800 border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>2. ประวัติการเข้าเรียน ({studentAttendance.length} รายการ)</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 border ${
                activeTab === 'grades'
                  ? 'bg-emerald-900 text-amber-200 border-black shadow'
                  : 'bg-white text-slate-800 border-transparent'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>3. ผลการเรียน (ปพ.5/ปพ.6)</span>
            </button>
          </div>

          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-amber-200 border-b border-black">
                    <th className="p-2 border border-black font-bold">วัน / เวลา</th>
                    <th className="p-2 border border-black">คาบ 1 (08:45-09:45)</th>
                    <th className="p-2 border border-black">คาบ 2 (09:45-10:45)</th>
                    <th className="p-2 border border-black">คาบ 3 (10:45-11:45)</th>
                    <th className="p-2 border border-black bg-amber-900 text-amber-100">พักกลางวัน</th>
                    <th className="p-2 border border-black">คาบ 4 (12:30-13:30)</th>
                    <th className="p-2 border border-black">คาบ 5 (13:30-14:30)</th>
                  </tr>
                </thead>
                <tbody>
                  {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'].map((day) => (
                    <tr key={day}>
                      <td className="p-2 border border-black font-bold bg-emerald-50">{day}</td>
                      {[1, 2, 3].map((pNum) => {
                        const s = studentSchedules.find(
                          (sc) => sc.day === day && sc.periodNumber === pNum
                        );
                        return (
                          <td key={pNum} className="p-2 border border-black">
                            {s ? (
                              <div>
                                <strong className="block text-emerald-900">{s.subjectName}</strong>
                                <span className="text-[10px] text-slate-600">{s.teacherName}</span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                        );
                      })}
                      <td className="p-1 border border-black bg-slate-100 text-[10px] italic">พักกลางวัน</td>
                      {[4, 5].map((pNum) => {
                        const s = studentSchedules.find(
                          (sc) => sc.day === day && sc.periodNumber === pNum
                        );
                        return (
                          <td key={pNum} className="p-2 border border-black">
                            {s ? (
                              <div>
                                <strong className="block text-emerald-900">{s.subjectName}</strong>
                                <span className="text-[10px] text-slate-600">{s.teacherName}</span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-amber-200 border-b border-black">
                    <th className="p-2.5 border border-black">วันที่</th>
                    <th className="p-2.5 border border-black text-center">สถานะการมาเรียน (Badge)</th>
                    <th className="p-2.5 border border-black">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-xs text-slate-500 italic">
                        ยังไม่มีประวัติการเช็คชื่อ
                      </td>
                    </tr>
                  ) : (
                    studentAttendance.map((a) => (
                      <tr key={a.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                        <td className="p-2.5 border border-black font-medium text-slate-800">{a.date}</td>
                        <td className="p-2.5 border border-black text-center">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-md border ${
                              a.status === 'มา'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                : a.status === 'ขาด'
                                ? 'bg-red-100 text-red-800 border-red-400'
                                : a.status === 'ลา'
                                ? 'bg-amber-100 text-amber-900 border-amber-400'
                                : 'bg-blue-100 text-blue-800 border-blue-400'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-2.5 border border-black text-slate-600">{a.note || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: GRADES */}
          {activeTab === 'grades' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-900">สรุปผลการเรียนเฉลี่ยสะสม (GPA)</h4>
                  <p className="text-[11px] text-amber-700">เชื่อมโยงจากระบบคะแนน ปพ.5 ครูผู้สอน</p>
                </div>
                <div className="text-2xl font-extrabold text-emerald-900 font-mono">
                  {currentStudent.part3.gpa.toFixed(2)}
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-black space-y-2 text-xs">
                <p><strong>จุดเด่นด้านการเรียน:</strong> {currentStudent.part3.strengths}</p>
                <p><strong>วิชาที่ควรได้รับการพัฒนา:</strong> {currentStudent.part3.developmentAreas}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

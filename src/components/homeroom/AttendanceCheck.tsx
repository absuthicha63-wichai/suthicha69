/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  SchoolClass,
  ALL_CLASSES,
  User,
} from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showToast } from '../../utils/sweetalert';
import { CalendarCheck, Save, Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AttendanceCheckProps {
  onBack: () => void;
  currentUser: User | null;
}

export const AttendanceCheck: React.FC<AttendanceCheckProps> = ({ onBack, currentUser }) => {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(
    (currentUser?.assignedClass as SchoolClass) || 'ป.1/1'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const students = StorageService.getStudents().filter(
    (s) => s.part1.className === selectedClass
  );

  const existingAttendance = StorageService.getAttendance();

  // Local state for recording student statuses today
  const [records, setRecords] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >(() => {
    const initialMap: Record<string, { status: AttendanceStatus; note: string }> = {};
    students.forEach((s) => {
      const found = existingAttendance.find(
        (a) => a.date === selectedDate && a.studentId === s.id
      );
      initialMap[s.id] = {
        status: found ? found.status : 'มา',
        note: found?.note || '',
      };
    });
    return initialMap;
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleSaveAttendance = () => {
    const currentYear = StorageService.getCurrentAcademicYear().year;

    // Filter out previous attendance for this date & class
    const otherRecords = existingAttendance.filter(
      (a) => !(a.date === selectedDate && a.className === selectedClass)
    );

    const newAttendance: AttendanceRecord[] = students.map((s) => ({
      id: 'att_' + Date.now() + '_' + s.id,
      academicYear: currentYear,
      semester: '1',
      date: selectedDate,
      className: selectedClass,
      studentId: s.id,
      studentCode: s.part1.studentCode,
      studentName: `${s.part1.prefix} ${s.part1.firstName} ${s.part1.lastName}`,
      status: records[s.id]?.status || 'มา',
      note: records[s.id]?.note || '',
      recordedByTeacher: currentUser?.fullName || 'ครูประจำชั้น',
    }));

    const updated = [...otherRecords, ...newAttendance];
    StorageService.saveAttendance(updated);
    showToast(`บันทึกเวลาเรียนชั้น ${selectedClass} ประจำวันที่ ${selectedDate} เรียบร้อยแล้ว`, 'success');
  };

  const handleExportExcel = () => {
    const data = students.map((s) => ({
      เลขที่: s.part1.studentNumber,
      เลขประจำตัว: s.part1.studentCode,
      ชื่อนามสกุล: `${s.part1.prefix} ${s.part1.firstName} ${s.part1.lastName}`,
      สถานะการมาเรียน: records[s.id]?.status || 'มา',
      หมายเหตุ: records[s.id]?.note || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `เช็คชื่อ_${selectedClass}`);
    XLSX.writeFile(wb, `รายงานเวลาเรียน_${selectedClass}_${selectedDate}.xlsx`);
    showToast('ส่งออก Excel เรียบร้อยแล้ว', 'success');
  };

  // Computations
  const totalStudents = students.length;
  const presentCount = Object.values(records).filter((r) => r.status === 'มา').length;
  const absentCount = Object.values(records).filter((r) => r.status === 'ขาด').length;
  const leaveCount = Object.values(records).filter((r) => r.status === 'ลา').length;
  const sickCount = Object.values(records).filter((r) => r.status === 'ป่วย').length;

  return (
    <div className="space-y-6 font-['Sarabun'] pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border-2 border-black shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg border border-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-emerald-700" />
              ระบบเช็คชื่อประจำวัน (Homeroom Daily Attendance)
            </h2>
            <p className="text-xs text-slate-600">
              บันทึกเวลาเรียน มา/ขาด/ลา/ป่วย สำหรับครูประจำชั้น
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พรีวิว / พิมพ์รายงาน</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>บันทึกข้อมูลเวลาเรียน</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-emerald-50 p-4 rounded-xl border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900">เลือกชั้นเรียน:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
              className="text-xs font-bold py-1.5 px-3 border border-black rounded-lg bg-white text-emerald-950"
            >
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  ชั้น {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900">ประจำวันที่:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold py-1.5 px-3 border border-black rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="px-3 py-1 bg-white border border-black rounded-lg text-emerald-900">
            ทั้งหมด: {totalStudents} คน
          </span>
          <span className="px-3 py-1 bg-sky-100 border border-sky-400 rounded-lg text-sky-900">
            มา: {presentCount} คน ({totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0}%)
          </span>
          <span className="px-3 py-1 bg-amber-100 border border-amber-400 rounded-lg text-amber-900">
            ลา: {leaveCount} | ป่วย: {sickCount}
          </span>
          <span className="px-3 py-1 bg-rose-100 border border-rose-400 rounded-lg text-rose-900">
            ขาด: {absentCount} คน
          </span>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black text-center">เลขที่</th>
                <th className="p-3 border border-black">เลขประจำตัว</th>
                <th className="p-3 border border-black">ชื่อ-นามสกุล นักเรียน</th>
                <th className="p-3 border border-black text-center">สถานะการมาเรียน</th>
                <th className="p-3 border border-black">หมายเหตุ (ถ้ามี)</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-slate-500 italic">
                    ไม่พบรายชื่อนักเรียนในชั้น {selectedClass}
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const currentRec = records[st.id] || { status: 'มา', note: '' };
                  return (
                    <tr key={st.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                      <td className="p-3 border border-black text-center font-bold">{st.part1.studentNumber}</td>
                      <td className="p-3 border border-black font-mono font-bold text-emerald-900">
                        {st.part1.studentCode}
                      </td>
                      <td className="p-3 border border-black font-medium">
                        {st.part1.prefix} {st.part1.firstName} {st.part1.lastName}
                      </td>
                      <td className="p-3 border border-black text-center">
                        <div className="inline-flex gap-2">
                          {(['มา', 'ขาด', 'ลา', 'ป่วย'] as AttendanceStatus[]).map((stt) => (
                            <label
                              key={stt}
                              className={`px-3 py-1 rounded font-bold border border-black cursor-pointer transition-all ${
                                currentRec.status === stt
                                  ? stt === 'มา'
                                    ? 'bg-emerald-700 text-white shadow'
                                    : stt === 'ขาด'
                                    ? 'bg-red-600 text-white shadow'
                                    : stt === 'ลา'
                                    ? 'bg-amber-500 text-slate-900 shadow'
                                    : 'bg-sky-600 text-white shadow'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`att_${st.id}`}
                                value={stt}
                                checked={currentRec.status === stt}
                                onChange={() => handleStatusChange(st.id, stt)}
                                className="hidden"
                              />
                              {stt}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 border border-black">
                        <input
                          type="text"
                          value={currentRec.note}
                          onChange={(e) => handleNoteChange(st.id, e.target.value)}
                          placeholder="ระบุเหตุผล (ถ้าลา/ป่วย/ขาด)..."
                          className="w-full text-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

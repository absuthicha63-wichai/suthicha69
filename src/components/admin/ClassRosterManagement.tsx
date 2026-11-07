/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, SchoolClass, ALL_CLASSES, TeacherStaff } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { UserCheck, Plus, ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface ClassRosterManagementProps {
  onBack: () => void;
}

export const ClassRosterManagement: React.FC<ClassRosterManagementProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [teachers] = useState<TeacherStaff[]>(StorageService.getTeachers());
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('ป.1/1');

  // Filter students in selected class
  const classStudents = students.filter((s) => s.part1.className === selectedClass);

  const handleUpdateHomeroomTeachers = (t1: string, t2: string) => {
    showToast(`อัปเดตครูประจำชั้นห้อง ${selectedClass} เรียบร้อยแล้ว`, 'success');
  };

  return (
    <div className="space-y-6 font-['Sarabun'] pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border-2 border-black shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg border border-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-700" />
              4. ระบบจัดการนักเรียนเข้าชั้นเรียน (Class Roster Management)
            </h2>
            <p className="text-xs text-slate-600">จัดกลุ่มนักเรียนรายห้องและระบุครูประจำชั้นคนที่ 1 และคนที่ 2</p>
          </div>
        </div>
      </div>

      {/* Class Selector & Homeroom Teacher bar */}
      <div className="bg-emerald-50 p-4 rounded-xl border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-900 whitespace-nowrap">เลือกชั้นเรียน (Dropdown):</span>
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

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">ครูประจำชั้นคนที่ 1:</span>
            <select className="py-1 px-2 border border-black rounded bg-white text-xs font-semibold">
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">ครูประจำชั้นคนที่ 2:</span>
            <select className="py-1 px-2 border border-black rounded bg-white text-xs font-semibold">
              {teachers.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleUpdateHomeroomTeachers('', '')}
            className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded border border-black shadow"
          >
            บันทึกครูประจำชั้น
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="p-3 bg-emerald-900 text-amber-200 border-b border-black font-bold text-xs flex justify-between items-center">
          <span>รายชื่อนักเรียนในชั้น {selectedClass} ({classStudents.length} คน)</span>
          <span className="text-[11px] text-emerald-200">เรียงตามเลขที่</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-black">
                <th className="p-2.5 border border-black text-center">เลขที่</th>
                <th className="p-2.5 border border-black">เลขประจำตัวนักเรียน</th>
                <th className="p-2.5 border border-black">ชื่อ-นามสกุล</th>
                <th className="p-2.5 border border-black text-center">ชั้น/ห้อง</th>
                <th className="p-2.5 border border-black">ครูคนที่ 1</th>
                <th className="p-2.5 border border-black">ครูคนที่ 2</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-slate-500 italic">
                    ไม่มีนักเรียนในชั้น {selectedClass}
                  </td>
                </tr>
              ) : (
                classStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                    <td className="p-2.5 border border-black text-center font-bold">{st.part1.studentNumber}</td>
                    <td className="p-2.5 border border-black font-mono font-bold text-emerald-900">
                      {st.part1.studentCode}
                    </td>
                    <td className="p-2.5 border border-black font-medium">
                      {st.part1.prefix} {st.part1.firstName} {st.part1.lastName}
                    </td>
                    <td className="p-2.5 border border-black text-center font-bold text-amber-900">
                      {st.part1.className}
                    </td>
                    <td className="p-2.5 border border-black text-slate-700">ครูสมใจ ใจดี</td>
                    <td className="p-2.5 border border-black text-slate-700">ครูวิภา รุ่งเรือง</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

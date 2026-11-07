/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeacherAssignment, Subject, TeacherStaff, SchoolClass, ALL_CLASSES } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { ShoppingCart, Plus, Trash2, CheckCircle2, ArrowLeft, ClipboardList } from 'lucide-react';

interface TeacherAssignmentProps {
  onBack: () => void;
}

export const TeacherAssignmentView: React.FC<TeacherAssignmentProps> = ({ onBack }) => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(StorageService.getAssignments());
  const [subjects] = useState<Subject[]>(StorageService.getSubjects());
  const [teachers] = useState<TeacherStaff[]>(StorageService.getTeachers());
  const [activeSemester, setActiveSemester] = useState<'1' | '2'>('1');

  // Shopping Basket State
  const [basket, setBasket] = useState<Subject[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('ป.1/1');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const currentYear = StorageService.getCurrentAcademicYear().year;

  // Add subject to Shopping Basket
  const handleAddToBasket = () => {
    const sub = subjects.find((s) => s.id === selectedSubjectId);
    if (!sub) return;

    if (basket.some((b) => b.id === sub.id)) {
      showAlert('แจ้งเตือน', 'รายวิชานี้อยู่ในตะกร้าแล้ว', 'warning');
      return;
    }

    setBasket([...basket, sub]);
    showToast(`หยิบ "${sub.code} ${sub.name}" ใส่ตะกร้าเรียบร้อย`, 'success');
  };

  // Remove subject from Shopping Basket
  const handleRemoveFromBasket = (subId: string) => {
    setBasket(basket.filter((b) => b.id !== subId));
  };

  // Assign items in Basket to Teacher & Class
  const handleExecuteAssignment = () => {
    if (basket.length === 0) {
      showAlert('ข้อผิดพลาด', 'กรุณาเลือกรายวิชาใส่ตะกร้าอย่างน้อย 1 รายวิชา', 'warning');
      return;
    }

    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    if (!teacher) return;

    const newAssignments: TeacherAssignment[] = basket.map((sub) => ({
      id: 'assign_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      academicYear: currentYear,
      semester: activeSemester,
      teacherId: teacher.id,
      teacherName: teacher.name,
      className: selectedClass,
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      canEditPP5: true,
    }));

    const updated = [...assignments, ...newAssignments];
    StorageService.saveAssignments(updated);
    setAssignments(updated);

    // Clear Basket
    setBasket([]);
    showToast(`มอบหมายครู ${teacher.name} สอน ${newAssignments.length} วิชา สำเร็จ!`, 'success');
  };

  const handleDeleteAssignment = async (id: string) => {
    const confirm = await showConfirm('ยืนยันลบรายการ', 'ต้องการยกเลิกการมอบหมายรายวิชานี้หรือไม่?');
    if (confirm) {
      const updated = assignments.filter((a) => a.id !== id);
      StorageService.saveAssignments(updated);
      setAssignments(updated);
      showToast('ยกเลิกการมอบหมายเรียบร้อย', 'success');
    }
  };

  const semesterAssignments = assignments.filter((a) => a.semester === activeSemester);

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
              <ClipboardList className="w-6 h-6 text-emerald-700" />
              7. ระบบจัดการมอบหมายครูผู้สอนในรายวิชา (Shopping Basket Assignment)
            </h2>
            <p className="text-xs text-slate-600">หยิบรายวิชาใส่ตะกร้า ก่อนกดมอบหมายครูประจำชั้นและครูผู้สอน</p>
          </div>
        </div>
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 p-1 bg-emerald-100 rounded-xl border-2 border-black max-w-md">
        <button
          onClick={() => setActiveSemester('1')}
          className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors border ${
            activeSemester === '1'
              ? 'bg-emerald-900 text-amber-200 border-black shadow'
              : 'bg-white text-slate-800 border-transparent hover:bg-emerald-50'
          }`}
        >
          ภาคเรียนที่ 1 (Semester 1)
        </button>
        <button
          onClick={() => setActiveSemester('2')}
          className={`flex-1 py-2 font-bold text-xs rounded-lg transition-colors border ${
            activeSemester === '2'
              ? 'bg-emerald-900 text-amber-200 border-black shadow'
              : 'bg-white text-slate-800 border-transparent hover:bg-emerald-50'
          }`}
        >
          ภาคเรียนที่ 2 (Semester 2)
        </button>
      </div>

      {/* Shopping Basket & Selector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Picker & Add to Basket */}
        <div className="bg-white p-5 rounded-xl border-2 border-black shadow-md space-y-4">
          <h3 className="text-sm font-bold text-emerald-950 pb-2 border-b border-slate-300">
            1. เลือกวิชาใส่ตะกร้า
          </h3>

          <div>
            <label className="block text-xs font-bold mb-1">เลือกครูผู้สอน</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full text-xs bg-white font-semibold"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">เลือกชั้นเรียนที่จะสอน</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
              className="w-full text-xs bg-white font-bold text-emerald-900"
            >
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  ชั้น {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">เลือก รหัสวิชา-รายวิชา (ใส่ตะกร้า)</label>
            <div className="flex gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="flex-1 text-xs bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({s.credits} หน่วยกิต)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddToBasket}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded border border-black shadow flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>หยิบใส่ตะกร้า</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Shopping Basket List */}
        <div className="lg:col-span-2 bg-amber-50 p-5 rounded-xl border-2 border-black shadow-md flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-950">
                2. ตะกร้าวิชาที่เลือก ({basket.length} วิชา)
              </h3>
            </div>

            <button
              onClick={handleExecuteAssignment}
              disabled={basket.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>กดยืนยันมอบหมายรายวิชาทั้งหมด</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 space-y-2">
            {basket.length === 0 ? (
              <div className="p-8 text-center text-xs text-amber-800 italic">
                ยังไม่มีรายวิชาในตะกร้า เลือกวิชาทางซ้ายมือแล้วกด "หยิบใส่ตะกร้า"
              </div>
            ) : (
              basket.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-black text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-emerald-900 mr-2">{item.code}</span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">({item.credits} หน่วยกิต)</span>
                  </div>

                  <button
                    onClick={() => handleRemoveFromBasket(item.id)}
                    className="p-1 bg-red-100 hover:bg-red-200 text-red-800 rounded border border-red-300"
                    title="ลบออกจากตะกร้า"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Table Grouped by Class */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="p-3 bg-emerald-900 text-amber-200 border-b border-black font-bold text-xs">
          ตารางสรุปการมอบหมายครูผู้สอนในรายวิชา (ภาคเรียนที่ {activeSemester})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-black">
                <th className="p-3 border border-black">ชั้นเรียน</th>
                <th className="p-3 border border-black">รหัสวิชา</th>
                <th className="p-3 border border-black">ชื่อรายวิชา</th>
                <th className="p-3 border border-black">ครูผู้สอนที่รับมอบหมาย</th>
                <th className="p-3 border border-black text-center">สิทธิ์บันทึก ปพ.5/ปพ.6</th>
                <th className="p-3 border border-black text-center">ยกเลิก</th>
              </tr>
            </thead>
            <tbody>
              {semesterAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-xs text-slate-500 italic">
                    ยังไม่มีรายการมอบหมายวิชาในภาคเรียนที่ {activeSemester}
                  </td>
                </tr>
              ) : (
                semesterAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                    <td className="p-3 border border-black font-bold text-amber-900">{a.className}</td>
                    <td className="p-3 border border-black font-mono font-bold text-emerald-900">{a.subjectCode}</td>
                    <td className="p-3 border border-black font-medium">{a.subjectName}</td>
                    <td className="p-3 border border-black text-slate-800 font-semibold">{a.teacherName}</td>
                    <td className="p-3 border border-black text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-400">
                        อนุญาต ปพ.5 / ปพ.6
                      </span>
                    </td>
                    <td className="p-3 border border-black text-center">
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded border border-black"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
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

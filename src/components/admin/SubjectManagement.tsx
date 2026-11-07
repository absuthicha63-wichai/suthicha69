/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Subject, SchoolClass, ALL_CLASSES } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { BookOpen, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface SubjectManagementProps {
  onBack: () => void;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({ onBack }) => {
  const [subjects, setSubjects] = useState<Subject[]>(StorageService.getSubjects());
  const [activeSemester, setActiveSemester] = useState<'1' | '2'>('1');

  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<number>(2.0);
  const [assignedClass, setAssignedClass] = useState<SchoolClass>('ป.1/1');
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(4);
  const [formativeMax, setFormativeMax] = useState<number>(50);
  const [midtermMax, setMidtermMax] = useState<number>(20);
  const [finalMax, setFinalMax] = useState<number>(30);

  const totalMaxScore = formativeMax + midtermMax + finalMax;

  const currentYear = StorageService.getCurrentAcademicYear().year;

  const semesterSubjects = subjects.filter(
    (s) => s.semester === activeSemester
  );

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setCode(`ท${11100 + subjects.length + 1}`);
    setName('');
    setCredits(2.0);
    setAssignedClass('ป.1/1');
    setPeriodsPerWeek(4);
    setFormativeMax(50);
    setMidtermMax(20);
    setFinalMax(30);
    setShowModal(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setCode(sub.code);
    setName(sub.name);
    setCredits(sub.credits);
    setAssignedClass(sub.assignedClass || 'ป.1/1');
    setPeriodsPerWeek(sub.periodsPerWeek);
    setFormativeMax(sub.scoreRatio.formativeMax);
    setMidtermMax(sub.scoreRatio.midtermMax);
    setFinalMax(sub.scoreRatio.finalMax);
    setShowModal(true);
  };

  const handleDelete = async (sub: Subject) => {
    const confirm = await showConfirm(
      'ยืนยันการลบรายวิชา',
      `คุณต้องการลบรายวิชา "${sub.code} ${sub.name}" หรือไม่?`
    );
    if (confirm) {
      const updated = subjects.filter((s) => s.id !== sub.id);
      StorageService.saveSubjects(updated);
      setSubjects(updated);
      showToast('ลบรายวิชาสำเร็จ', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showAlert('ข้อผิดพลาด', 'กรุณาระบุรหัสวิชาและชื่อรายวิชา', 'warning');
      return;
    }

    const subData: Subject = {
      id: editingSubject ? editingSubject.id : 'sub_' + Date.now(),
      academicYear: currentYear,
      semester: activeSemester,
      code: code.trim(),
      name: name.trim(),
      credits,
      assignedClass,
      periodsPerWeek,
      scoreRatio: {
        formativeMax,
        midtermMax,
        finalMax,
      },
    };

    let updated: Subject[];
    if (editingSubject) {
      updated = subjects.map((s) => (s.id === editingSubject.id ? subData : s));
      showToast('แก้ไขรายวิชาสำเร็จ', 'success');
    } else {
      updated = [...subjects, subData];
      showToast('เพิ่มรายวิชาสำเร็จ', 'success');
    }

    StorageService.saveSubjects(updated);
    setSubjects(updated);
    setShowModal(false);
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
              <BookOpen className="w-6 h-6 text-emerald-700" />
              5. ระบบจัดการรายวิชา (Subject Management)
            </h2>
            <p className="text-xs text-slate-600">กำหนดรายละเอียดรายวิชา อัตราส่วนคะแนน และคะแนนเต็ม</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>เพิ่มรายวิชาใหม่</span>
        </button>
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

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black">ลำดับ</th>
                <th className="p-3 border border-black">รหัสวิชา</th>
                <th className="p-3 border border-black">ชื่อรายวิชา</th>
                <th className="p-3 border border-black text-center">หน่วยกิต</th>
                <th className="p-3 border border-black text-center">คาบ/สัปดาห์</th>
                <th className="p-3 border border-black text-center">คะแนนเก็บเต็ม</th>
                <th className="p-3 border border-black text-center">กลางภาคเต็ม</th>
                <th className="p-3 border border-black text-center">ปลายภาคเต็ม</th>
                <th className="p-3 border border-black text-center bg-amber-900 text-white font-bold">
                  รวมเต็มอัตโนมัติ
                </th>
                <th className="p-3 border border-black text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {semesterSubjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-xs text-slate-500 italic">
                    ไม่มีรายการวิชาในภาคเรียนที่ {activeSemester}
                  </td>
                </tr>
              ) : (
                semesterSubjects.map((s, idx) => {
                  const sum = s.scoreRatio.formativeMax + s.scoreRatio.midtermMax + s.scoreRatio.finalMax;
                  return (
                    <tr key={s.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                      <td className="p-3 border border-black text-center font-bold">{idx + 1}</td>
                      <td className="p-3 border border-black font-mono font-bold text-emerald-900">{s.code}</td>
                      <td className="p-3 border border-black font-medium">{s.name}</td>
                      <td className="p-3 border border-black text-center">{s.credits}</td>
                      <td className="p-3 border border-black text-center">{s.periodsPerWeek}</td>
                      <td className="p-3 border border-black text-center bg-emerald-50">{s.scoreRatio.formativeMax}</td>
                      <td className="p-3 border border-black text-center bg-amber-50">{s.scoreRatio.midtermMax}</td>
                      <td className="p-3 border border-black text-center bg-sky-50">{s.scoreRatio.finalMax}</td>
                      <td className="p-3 border border-black text-center font-extrabold text-emerald-950 bg-amber-100">
                        {sum} คะแนน
                      </td>
                      <td className="p-3 border border-black text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded border border-black shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded border border-black shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-black">
              {editingSubject ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่'} (ภาคเรียนที่ {activeSemester})
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">รหัสวิชา*</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs font-mono font-bold"
                    placeholder="เช่น ท11101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ชื่อรายวิชา*</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs"
                    placeholder="เช่น ภาษาไทย 1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">หน่วยกิต</label>
                  <input
                    type="number"
                    step="0.5"
                    value={credits}
                    onChange={(e) => setCredits(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">คาบต่อสัปดาห์</label>
                  <input
                    type="number"
                    value={periodsPerWeek}
                    onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value) || 1)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ชั้นเรียนที่สอน</label>
                  <select
                    value={assignedClass}
                    onChange={(e) => setAssignedClass(e.target.value as SchoolClass)}
                    className="w-full text-xs bg-white"
                  >
                    {ALL_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        ชั้น {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-black space-y-3">
                <p className="text-xs font-bold text-amber-900 border-b border-amber-200 pb-1">
                  กำหนดอัตราส่วนคะแนนเต็ม:
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">คะแนนเก็บเต็ม</label>
                    <input
                      type="number"
                      value={formativeMax}
                      onChange={(e) => setFormativeMax(parseInt(e.target.value) || 0)}
                      className="w-full text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">คะแนนกลางภาคเต็ม</label>
                    <input
                      type="number"
                      value={midtermMax}
                      onChange={(e) => setMidtermMax(parseInt(e.target.value) || 0)}
                      className="w-full text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">คะแนนปลายภาคเต็ม</label>
                    <input
                      type="number"
                      value={finalMax}
                      onChange={(e) => setFinalMax(parseInt(e.target.value) || 0)}
                      className="w-full text-xs text-center font-bold"
                    />
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-amber-200">
                  <span className="text-xs font-bold text-slate-800">
                    รวมคะแนนเต็มอัตโนมัติ: <strong className="text-emerald-800 text-sm">{totalMaxScore}</strong> คะแนน
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-bold rounded border border-black"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded border border-black shadow"
                >
                  บันทึกข้อมูลวิชา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

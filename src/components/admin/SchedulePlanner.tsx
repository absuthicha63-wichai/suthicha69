/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScheduleSlot, Subject, TeacherStaff, SchoolClass, ALL_CLASSES } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import {
  CalendarCheck,
  ArrowLeft,
  Wand2,
  AlertTriangle,
  RotateCcw,
  RotateCw,
  Printer,
  Download,
  Trash2,
  Save,
  CheckCircle2,
  BookOpen,
  UserCog,
  FileCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SchedulePlannerProps {
  onBack: () => void;
}

export const SchedulePlanner: React.FC<SchedulePlannerProps> = ({ onBack }) => {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(StorageService.getSchedules());
  const [subjects] = useState<Subject[]>(StorageService.getSubjects());
  const [teachers] = useState<TeacherStaff[]>(StorageService.getTeachers());

  const [activeTab, setActiveTab] = useState<'planner' | 'subjects' | 'teachers' | 'conflicts'>('planner');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('ป.1/1');

  // History for Undo / Redo
  const [history, setHistory] = useState<ScheduleSlot[][]>([StorageService.getSchedules()]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const currentYear = StorageService.getCurrentAcademicYear().year;

  const PERIOD_TIMES = [
    { num: 1, range: '08:45 - 09:45' },
    { num: 2, range: '09:45 - 10:45' },
    { num: 3, range: '10:45 - 11:45' },
    { num: 4, range: '12:30 - 13:30' },
    { num: 5, range: '13:30 - 14:30' },
    { num: 6, range: '14:30 - 15:30' },
  ];

  const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'] as const;

  const updateScheduleState = (newSchedules: ScheduleSlot[]) => {
    StorageService.saveSchedules(newSchedules);
    setSchedules(newSchedules);
    const newHist = history.slice(0, historyIdx + 1);
    setHistory([...newHist, newSchedules]);
    setHistoryIdx(newHist.length);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      StorageService.saveSchedules(prev);
      setSchedules(prev);
      showToast('Undo ย้อนกลับสำเร็จ', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      StorageService.saveSchedules(next);
      setSchedules(next);
      showToast('Redo ทำซ้ำสำเร็จ', 'info');
    }
  };

  // Rule 4 Check: Teacher Conflict Detection
  const checkTeacherConflict = (
    teacherId: string,
    day: string,
    periodNumber: number,
    targetClass: SchoolClass,
    excludeSlotId?: string
  ) => {
    if (!teacherId) return null;

    const conflictingSlot = schedules.find(
      (s) =>
        s.teacherId === teacherId &&
        s.day === day &&
        s.periodNumber === periodNumber &&
        s.className !== targetClass &&
        s.id !== excludeSlotId
    );

    return conflictingSlot || null;
  };

  // Find all conflict errors system wide
  const findAllConflicts = () => {
    const conflicts: Array<{
      slot1: ScheduleSlot;
      slot2: ScheduleSlot;
      teacherName: string;
      day: string;
      period: number;
    }> = [];

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const s1 = schedules[i];
        const s2 = schedules[j];
        if (
          s1.teacherId &&
          s1.teacherId === s2.teacherId &&
          s1.day === s2.day &&
          s1.periodNumber === s2.periodNumber &&
          s1.className !== s2.className
        ) {
          conflicts.push({
            slot1: s1,
            slot2: s2,
            teacherName: s1.teacherName,
            day: s1.day,
            period: s1.periodNumber,
          });
        }
      }
    }
    return conflicts;
  };

  // Assign Subject to Slot
  const handleAssignSubjectToSlot = (
    sub: Subject,
    day: 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์',
    periodNumber: number
  ) => {
    const teacherId = sub.teacherId || 't1';
    const teacherName = sub.teacherName || 'ครูสมใจ ใจดี';

    // Check Conflict
    const conflict = checkTeacherConflict(teacherId, day, periodNumber, selectedClass);
    if (conflict) {
      showAlert(
        'ครูชนเวลา (Teacher Conflict)!',
        `ไม่สามารถจัดคาบนี้ได้ เพราะ ${teacherName} มีสอนอยู่แล้วในห้อง ${conflict.className} วัน${day} คาบที่ ${periodNumber}`,
        'error'
      );
      return;
    }

    // Check Max Periods per week limit
    const currentPlacedCount = schedules.filter(
      (s) => s.className === selectedClass && s.subjectId === sub.id
    ).length;

    if (currentPlacedCount >= sub.periodsPerWeek) {
      showAlert('ครบจำนวนคาบแล้ว', `วิชา ${sub.name} กำหนดไว้ ${sub.periodsPerWeek} คาบ/สัปดาห์ ถูกจัดลงตารางครบแล้ว`, 'warning');
      return;
    }

    // Replace existing or add slot
    const existingIndex = schedules.findIndex(
      (s) => s.className === selectedClass && s.day === day && s.periodNumber === periodNumber
    );

    const timeRange = PERIOD_TIMES.find((p) => p.num === periodNumber)?.range || '08:45 - 09:45';

    const newSlot: ScheduleSlot = {
      id: 'sch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
      academicYear: currentYear,
      semester: '1',
      className: selectedClass,
      day,
      periodNumber,
      timeRange,
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      teacherId,
      teacherName,
    };

    let updated: ScheduleSlot[];
    if (existingIndex >= 0) {
      updated = [...schedules];
      updated[existingIndex] = newSlot;
    } else {
      updated = [...schedules, newSlot];
    }

    updateScheduleState(updated);
    showToast(`จัดวิชา ${sub.name} วัน${day} คาบ ${periodNumber} สำเร็จ`, 'success');
  };

  // Remove Subject from Slot
  const handleRemoveSlot = (day: string, periodNumber: number) => {
    const updated = schedules.filter(
      (s) => !(s.className === selectedClass && s.day === day && s.periodNumber === periodNumber)
    );
    updateScheduleState(updated);
    showToast('คืนสถานะรายวิชาสำเร็จ', 'info');
  };

  // Clear Schedule
  const handleClearSchedule = async () => {
    const confirm = await showConfirm(
      'ยืนยันล้างตารางสอน',
      `คุณต้องการลบข้อมูลรายวิชาทั้งหมดออกจากตารางสอนของห้อง ${selectedClass} หรือไม่?`
    );
    if (confirm) {
      const updated = schedules.filter((s) => s.className !== selectedClass);
      updateScheduleState(updated);
      showToast(`ล้างตารางสอนห้อง ${selectedClass} เรียบร้อยแล้ว`, 'success');
    }
  };

  // Auto Schedule Generator (Rule 5)
  const handleAutoSchedule = () => {
    const classSubs = subjects.filter(
      (s) => !s.assignedClass || s.assignedClass === selectedClass
    );

    if (classSubs.length === 0) {
      showAlert('แจ้งเตือน', 'ไม่มีรายวิชาสำหรับชั้นเรียนนี้ในการจัดตารางอัตโนมัติ', 'warning');
      return;
    }

    let currentSchedules = schedules.filter((s) => s.className !== selectedClass);
    const unplacedSubs: string[] = [];

    // Loop days & periods
    for (const sub of classSubs) {
      let remaining = sub.periodsPerWeek;
      for (const day of DAYS) {
        if (remaining <= 0) break;
        for (const pt of PERIOD_TIMES) {
          if (remaining <= 0) break;

          // Check if slot empty
          const occupied = currentSchedules.some(
            (s) => s.className === selectedClass && s.day === day && s.periodNumber === pt.num
          );
          if (occupied) continue;

          // Check teacher conflict
          const teacherId = sub.teacherId || 't1';
          const teacherName = sub.teacherName || 'ครูสมใจ ใจดี';
          const conflict = currentSchedules.some(
            (s) => s.teacherId === teacherId && s.day === day && s.periodNumber === pt.num
          );
          if (conflict) continue;

          // Place slot!
          currentSchedules.push({
            id: 'auto_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
            academicYear: currentYear,
            semester: '1',
            className: selectedClass,
            day,
            periodNumber: pt.num,
            timeRange: pt.range,
            subjectId: sub.id,
            subjectCode: sub.code,
            subjectName: sub.name,
            teacherId,
            teacherName,
          });

          remaining--;
        }
      }
      if (remaining > 0) {
        unplacedSubs.push(`${sub.name} (เหลือ ${remaining} คาบ)`);
      }
    }

    updateScheduleState(currentSchedules);

    if (unplacedSubs.length > 0) {
      showAlert(
        'จัดตารางบางส่วนสำเร็จ',
        `จัดตารางเรียบร้อยแล้ว แต่ยังมีวิชาที่ชนเวลาครูหรือคาบเต็ม: ${unplacedSubs.join(', ')}`,
        'info'
      );
    } else {
      showToast('จัดตารางสอนอัตโนมัติ 100% เรียบร้อยแล้ว!', 'success');
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    doc.text(`ตารางสอน ชั้น ${selectedClass} - โรงเรียนอนุบาลสุธิชา`, 40, 40);
    doc.save(`ตารางสอน_${selectedClass}.pdf`);
    showToast('ส่งออกไฟล์ PDF เรียบร้อย', 'success');
  };

  const conflictsList = findAllConflicts();

  return (
    <div className="space-y-6 font-['Sarabun'] pb-12">
      {/* Top Header */}
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
              8. ระบบจัดตารางสอน (Smart Drag & Drop Schedule Planner)
            </h2>
            <p className="text-xs text-slate-600">
              ตรวจสอบครูชนเวลาอัตโนมัติ และจัดตารางสมบูรณ์แบบ
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded border border-black shadow-xs text-xs font-bold flex items-center gap-1"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 rounded border border-black shadow-xs text-xs font-bold flex items-center gap-1"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
            <span>Redo</span>
          </button>

          <button
            onClick={handleAutoSchedule}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <Wand2 className="w-4 h-4" />
            <span>จัดตารางอัตโนมัติ</span>
          </button>

          <button
            onClick={handleClearSchedule}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>ล้างตารางสอน</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>ส่งออก PDF</span>
          </button>
        </div>
      </div>

      {/* Main 4 Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-emerald-100 rounded-xl border-2 border-black text-xs">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 py-2 font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'planner'
              ? 'bg-emerald-900 text-amber-200 border-black shadow'
              : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-amber-300" />
          <span>1. หน้าตารางสอน (Timetable)</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex-1 py-2 font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'subjects'
              ? 'bg-emerald-900 text-amber-200 border-black shadow'
              : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>2. หน้าจัดการรายวิชา</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex-1 py-2 font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'teachers'
              ? 'bg-emerald-900 text-amber-200 border-black shadow'
              : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
          }`}
        >
          <UserCog className="w-4 h-4 text-amber-300" />
          <span>3. หน้าจัดการข้อมูลครู</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`flex-1 py-2 font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 relative ${
            activeTab === 'conflicts'
              ? 'bg-emerald-900 text-amber-200 border-black shadow'
              : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>4. ตรวจสอบความชนกัน ({conflictsList.length})</span>
          {conflictsList.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-600 border border-white absolute top-1 right-2" />
          )}
        </button>
      </div>

      {/* SECTION 1: TIMETABLE PLANNER & SUBJECT BOX DRAG AREA */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Class Filter & Subject Box list */}
          <div className="bg-emerald-50 p-4 rounded-xl border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">เลือกดูตารางสอนรายห้อง:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
                className="text-xs font-extrabold py-1.5 px-4 border border-black rounded-lg bg-white text-emerald-950"
              >
                {ALL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    ชั้น {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-emerald-900 font-semibold">
              วิชาสำหรับชั้น {selectedClass} (คลิกเพื่อจัดลงคาบเรียน หรือลากลงตาราง):
            </div>
          </div>

          {/* Subject Boxes Palette */}
          <div className="bg-white p-4 rounded-xl border-2 border-black shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Subject Boxes (กล่องรายวิชา):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {subjects.map((sub) => {
                const placedCount = schedules.filter(
                  (s) => s.className === selectedClass && s.subjectId === sub.id
                ).length;
                const remaining = sub.periodsPerWeek - placedCount;
                const isFull = remaining <= 0;

                return (
                  <div
                    key={sub.id}
                    draggable={!isFull}
                    onDragStart={(e) => {
                      if (!isFull) {
                        e.dataTransfer.setData('text/plain', sub.id);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 border-black text-xs relative flex flex-col justify-between transition-all ${
                      isFull
                        ? 'bg-slate-100 opacity-50 cursor-not-allowed'
                        : 'bg-amber-100 hover:bg-amber-200 cursor-grab active:cursor-grabbing shadow-xs hover:scale-[1.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono font-bold text-emerald-900">
                        <span>{sub.code}</span>
                        <span className="text-[10px] text-slate-600 font-sans">{sub.credits} นก.</span>
                      </div>
                      <h5 className="font-bold text-slate-900 mt-0.5">{sub.name}</h5>
                      <p className="text-[10px] text-slate-600 mt-1">
                        ครู: {sub.teacherName || 'ครูสมใจ ใจดี'}
                      </p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-amber-300 flex items-center justify-between">
                      {isFull ? (
                        <span className="text-[10px] font-bold text-slate-600">✓ ครบแล้ว</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-900">
                          🖐️ ลากวาง | เหลือ {remaining} คาบ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timetable Interactive Grid */}
          <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                    <th className="p-3 border border-black w-24">วัน / คาบ</th>
                    {PERIOD_TIMES.map((pt) => (
                      <React.Fragment key={pt.num}>
                        {pt.num === 4 && (
                          <th className="p-2 border border-black bg-amber-900 text-amber-100 w-24">
                            11:45 - 12:30
                            <span className="block text-[10px] font-normal">พักกลางวัน</span>
                          </th>
                        )}
                        <th className="p-2 border border-black">
                          คาบที่ {pt.num}
                          <span className="block text-[10px] text-emerald-200 font-normal">
                            {pt.range}
                          </span>
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day} className="border-b border-black">
                      {/* Day Label */}
                      <td className="p-3 border border-black font-bold bg-emerald-50 text-emerald-950">
                        {day}
                      </td>

                      {PERIOD_TIMES.map((pt) => {
                        const slot = schedules.find(
                          (s) =>
                            s.className === selectedClass &&
                            s.day === day &&
                            s.periodNumber === pt.num
                        );

                        // Check conflict if any
                        const isConflicted = slot
                          ? checkTeacherConflict(
                              slot.teacherId,
                              day,
                              pt.num,
                              selectedClass,
                              slot.id
                            )
                          : null;

                        return (
                          <React.Fragment key={pt.num}>
                            {/* Lunch Period Column Divider */}
                            {pt.num === 4 && (
                              <td className="p-2 border border-black bg-slate-100 text-slate-500 font-bold text-[10px] italic">
                                🍱 พักรับประทานอาหาร
                              </td>
                            )}

                            <td
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const subId = e.dataTransfer.getData('text/plain');
                                const subObj = subjects.find((s) => s.id === subId);
                                if (subObj) {
                                  handleAssignSubjectToSlot(subObj, day, pt.num);
                                }
                              }}
                              className={`p-2 border border-black relative transition-colors h-24 align-top ${
                                isConflicted
                                  ? 'bg-red-100 border-2 border-red-600'
                                  : slot
                                  ? 'bg-amber-50 hover:bg-amber-100'
                                  : 'hover:bg-emerald-50/50'
                              }`}
                            >
                              {slot ? (
                                <div className="h-full flex flex-col justify-between p-1 bg-white rounded border border-black shadow-xs">
                                  <div>
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-mono font-bold text-emerald-900">
                                        {slot.subjectCode}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveSlot(day, pt.num)}
                                        className="text-red-600 font-bold hover:text-red-800 text-xs px-1"
                                        title="ลบวิชาออก"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <strong className="block text-xs font-bold text-slate-900 mt-0.5">
                                      {slot.subjectName}
                                    </strong>
                                    <p className="text-[10px] text-slate-600 mt-0.5">
                                      {slot.teacherName}
                                    </p>
                                  </div>

                                  {isConflicted && (
                                    <div className="text-[9px] text-red-700 font-bold bg-red-200 p-0.5 rounded text-center">
                                      ⚠️ ชนเวลาห้อง {isConflicted.className}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-[10px] italic">
                                  + คลิกเลือกวิชา
                                </div>
                              )}

                              {/* Slot Selector Dropdown popup when clicking slot */}
                              {!slot && (
                                <select
                                  onChange={(e) => {
                                    const subObj = subjects.find((s) => s.id === e.target.value);
                                    if (subObj) handleAssignSubjectToSlot(subObj, day, pt.num);
                                    e.target.value = '';
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                >
                                  <option value="">-- วางรายวิชา --</option>
                                  {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                      {sub.code} - {sub.name} ({sub.teacherName || 'ครูสมใจ'})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SUBJECT MANAGEMENT VIEW */}
      {activeTab === 'subjects' && (
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-lg space-y-4">
          <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-black">
            รายการรายวิชาที่ใช้จัดตารางสอน ({subjects.length} วิชา)
          </h3>

          <table className="w-full text-xs border-collapse text-left">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b border-black">
                <th className="p-2.5 border border-black">รหัสวิชา</th>
                <th className="p-2.5 border border-black">ชื่อวิชา</th>
                <th className="p-2.5 border border-black">ชั้นที่สอน</th>
                <th className="p-2.5 border border-black text-center">คาบ/สัปดาห์</th>
                <th className="p-2.5 border border-black">ครูผู้สอน</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                  <td className="p-2.5 border border-black font-mono font-bold text-emerald-900">{s.code}</td>
                  <td className="p-2.5 border border-black font-medium">{s.name}</td>
                  <td className="p-2.5 border border-black font-bold text-amber-900">{s.assignedClass || 'ทั้งหมด'}</td>
                  <td className="p-2.5 border border-black text-center font-bold">{s.periodsPerWeek} คาบ</td>
                  <td className="p-2.5 border border-black text-slate-800">{s.teacherName || 'ครูสมใจ ใจดี'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 3: TEACHER MANAGEMENT VIEW */}
      {activeTab === 'teachers' && (
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-lg space-y-4">
          <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-black">
            ข้อมูลครูผู้สอนที่รับผิดชอบตารางสอน ({teachers.length} ท่าน)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((t) => {
              const assignedSubs = subjects.filter((s) => s.teacherId === t.id);
              return (
                <div key={t.id} className="p-4 bg-emerald-50 rounded-xl border-2 border-black space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-600">{t.position} - {t.department}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-400 text-emerald-950 border border-black">
                      {t.code}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900 block mb-1">รายวิชาที่รับผิดชอบ:</span>
                    {assignedSubs.length === 0 ? (
                      <span className="text-slate-500 italic text-[11px]">- ยังไม่ได้รับมอบหมาย -</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {assignedSubs.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 bg-white border border-black rounded text-[10px] font-semibold"
                          >
                            {s.code} {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: CONFLICT INSPECTOR & AUDIT */}
      {activeTab === 'conflicts' && (
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-base font-bold text-slate-900">
                รายงานการตรวจสอบความชนกันของครูผู้สอน (Conflict Inspector)
              </h3>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-400">
              พบ {conflictsList.length} รายการชนกัน
            </span>
          </div>

          {conflictsList.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 border-2 border-emerald-500 rounded-xl space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">
                🎉 ยอดเยี่ยม! ไม่พบปัญหาครูสอนชนเวลาในระบบ
              </h4>
              <p className="text-xs text-slate-600">
                ตารางสอนทุกชั้นเรียนถูกต้องตามเงื่อนไขครู 1 คน อยู่ได้เพียง 1 ห้องในเวลาเดียวกัน
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflictsList.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-red-50 border-2 border-red-500 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-red-900 text-sm">
                      ❌ {c.teacherName} มีคาบสอนชนกันวัน{c.day} คาบที่ {c.period}
                    </h5>
                    <p className="text-slate-700 mt-1">
                      ชนกันระหว่าง: <strong className="text-red-800">ห้อง {c.slot1.className} ({c.slot1.subjectName})</strong>{' '}
                      และ <strong className="text-red-800">ห้อง {c.slot2.className} ({c.slot2.subjectName})</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClass(c.slot2.className);
                      setActiveTab('planner');
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded border border-black shadow"
                  >
                    ไปแก้ไขห้อง {c.slot2.className}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

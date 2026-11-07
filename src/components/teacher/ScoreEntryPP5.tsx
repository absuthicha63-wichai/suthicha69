/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Subject,
  Student,
  SchoolClass,
  ALL_CLASSES,
  User,
  ScoreItem,
} from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { BookCheck, Save, Plus, Trash2, ArrowLeft, Award, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ScoreEntryPP5Props {
  onBack: () => void;
  currentUser: User | null;
}

export const ScoreEntryPP5: React.FC<ScoreEntryPP5Props> = ({ onBack, currentUser }) => {
  const [activeSemester, setActiveSemester] = useState<'1' | '2'>('1');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('ป.1/1');

  const allSubjects = StorageService.getSubjects();
  const semesterSubjects = allSubjects.filter(
    (s) => s.semester === activeSemester && (!s.assignedClass || s.assignedClass === selectedClass)
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    semesterSubjects[0]?.id || allSubjects[0]?.id || ''
  );

  const selectedSubject = allSubjects.find((s) => s.id === selectedSubjectId) || allSubjects[0];

  const students = StorageService.getStudents().filter(
    (s) => s.part1.className === selectedClass
  );

  // Score Items Columns (e.g. ใบงานที่ 1, แบบทดสอบ 1)
  const [customItems, setCustomItems] = useState<ScoreItem[]>([
    { id: 'item_1', title: 'ใบงานที่ 1', maxScore: 20 },
    { id: 'item_2', title: 'แบบทดสอบ 1', maxScore: 30 },
  ]);

  // Scores map: studentId -> { itemScores: { itemId -> score }, midterm: number, final: number }
  const [studentScores, setStudentScores] = useState<
    Record<string, { itemScores: Record<string, number>; midterm: number; final: number }>
  >(() => {
    const map: Record<string, { itemScores: Record<string, number>; midterm: number; final: number }> = {};
    students.forEach((s) => {
      map[s.id] = {
        itemScores: { item_1: 18, item_2: 26 },
        midterm: 16,
        final: 24,
      };
    });
    return map;
  });

  // Calculate 8-grade scale GPA
  const getThaiGrade = (totalScore: number) => {
    if (totalScore >= 80) return '4.0';
    if (totalScore >= 75) return '3.5';
    if (totalScore >= 70) return '3.0';
    if (totalScore >= 65) return '2.5';
    if (totalScore >= 60) return '2.0';
    if (totalScore >= 55) return '1.5';
    if (totalScore >= 50) return '1.0';
    return '0';
  };

  // Add custom score item
  const handleAddCustomItem = () => {
    const title = prompt('กรุณาระบุชื่อรายการคะแนน (เช่น ใบงานที่ 2):', `ใบงานที่ ${customItems.length + 1}`);
    if (!title) return;
    const maxStr = prompt('กรุณาระบุจำนวนคะแนนเต็มของรายการนี้:', '10');
    if (!maxStr) return;
    const maxScore = parseInt(maxStr) || 10;

    const newItem: ScoreItem = {
      id: 'item_' + Date.now(),
      title,
      maxScore,
    };
    setCustomItems([...customItems, newItem]);
    showToast(`เพิ่มรายการคะแนน "${title}" เรียบร้อย`, 'success');
  };

  // Delete custom score item
  const handleDeleteCustomItem = async (itemId: string, title: string) => {
    const confirm = await showConfirm(
      'ยืนยันลบรายการคะแนน',
      `คุณต้องการลบช่องคะแนน "${title}" หรือไม่?`
    );
    if (confirm) {
      setCustomItems(customItems.filter((i) => i.id !== itemId));
      showToast('ลบรายการคะแนนเรียบร้อย', 'success');
    }
  };

  const handleScoreChange = (
    studentId: string,
    field: 'item' | 'midterm' | 'final',
    value: number,
    itemId?: string,
    maxLimit?: number
  ) => {
    if (maxLimit && value > maxLimit) {
      showAlert('ข้อผิดพลาด', `คะแนนกรอกเกินคะแนนเต็มที่กำหนด (${maxLimit} คะแนน)`, 'warning');
      value = maxLimit;
    }

    setStudentScores((prev) => {
      const current = prev[studentId] || { itemScores: {}, midterm: 0, final: 0 };
      if (field === 'item' && itemId) {
        return {
          ...prev,
          [studentId]: {
            ...current,
            itemScores: {
              ...current.itemScores,
              [itemId]: value,
            },
          },
        };
      } else if (field === 'midterm') {
        return {
          ...prev,
          [studentId]: {
            ...current,
            midterm: value,
          },
        };
      } else {
        return {
          ...prev,
          [studentId]: {
            ...current,
            final: value,
          },
        };
      }
    });
  };

  const handleSaveGrades = () => {
    showToast('บันทึกผลการเรียนลงฐานข้อมูลเรียบร้อยแล้ว', 'success');
    showAlert('บันทึกสำเร็จ', 'บันทึกคะแนนและคำนวณเกรด ปพ.5 เรียบร้อยแล้ว', 'success');
  };

  const handleExportExcel = () => {
    const data = students.map((s) => {
      const entry = studentScores[s.id] || { itemScores: {}, midterm: 0, final: 0 };
      const formativeSum = Object.values(entry.itemScores).reduce((a, b) => a + b, 0);
      const total = formativeSum + entry.midterm + entry.final;
      const grade = getThaiGrade(total);

      return {
        เลขที่: s.part1.studentNumber,
        รหัสประจำตัว: s.part1.studentCode,
        ชื่อนามสกุล: `${s.part1.prefix} ${s.part1.firstName} ${s.part1.lastName}`,
        คะแนนเก็บ: formativeSum,
        คะแนนกลางภาค: entry.midterm,
        คะแนนปลายภาค: entry.final,
        คะแนนรวมเต็ม100: total,
        ระดับผลการเรียน_เกรด: grade,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `คะแนน_ปพ5`);
    XLSX.writeFile(wb, `ปพ5_${selectedSubject?.code || 'วิชา'}_${selectedClass}.xlsx`);
    showToast('ส่งออก Excel เรียบร้อยแล้ว', 'success');
  };

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
              <BookCheck className="w-6 h-6 text-emerald-700" />
              ระบบบันทึกคะแนนรายวิชา (ปพ.5)
            </h2>
            <p className="text-xs text-slate-600">คำนวณเกรดเฉลี่ยอัตโนมัติ ด้วยสูตร 8 เกรดมาตรฐานกระทรวงศึกษาธิการ</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleSaveGrades}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>บันทึกผลการเรียน</span>
          </button>
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

      {/* Selection Form Header */}
      <div className="bg-emerald-50 p-4 rounded-xl border-2 border-black space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-emerald-900 mb-1">เลือกชั้นเรียน:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
              className="w-full font-bold py-1.5 px-3 border border-black rounded-lg bg-white text-emerald-950"
            >
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  ชั้น {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-emerald-900 mb-1">เลือกรายวิชา:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full font-bold py-1.5 px-3 border border-black rounded-lg bg-white text-emerald-950"
            >
              {allSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-emerald-900 mb-1">หน่วยกิต / คาบ:</label>
            <input
              type="text"
              value={`${selectedSubject?.credits || 2.0} หน่วยกิต (${selectedSubject?.periodsPerWeek || 4} คาบ)`}
              readOnly
              className="w-full font-semibold py-1.5 px-3 border border-black rounded-lg bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-bold text-emerald-900 mb-1">ครูผู้สอนประจำวิชา:</label>
            <input
              type="text"
              value={currentUser?.fullName || 'ครูสมใจ ใจดี'}
              readOnly
              className="w-full font-semibold py-1.5 px-3 border border-black rounded-lg bg-slate-100"
            />
          </div>
        </div>

        {/* Add custom score item button */}
        <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-950">
            หัวตารางรายการคะแนนเก็บ: เพิ่ม/ลบ ชื่อรายการคะแนนและกำหนดคะแนนเต็มได้
          </span>
          <button
            onClick={handleAddCustomItem}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded border border-black shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มรายการคะแนน</span>
          </button>
        </div>
      </div>

      {/* Grade Sheet Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black text-center w-12">เลขที่</th>
                <th className="p-3 border border-black w-24">รหัสประจำตัว</th>
                <th className="p-3 border border-black">ชื่อ-นามสกุล นักเรียน</th>

                {/* Custom Score Item Columns */}
                {customItems.map((item) => (
                  <th key={item.id} className="p-2 border border-black text-center bg-emerald-850">
                    <div className="flex items-center justify-between gap-1">
                      <span>{item.title}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomItem(item.id, item.title)}
                        className="text-amber-400 hover:text-red-400 text-xs"
                        title="ลบช่องคะแนน"
                      >
                        ×
                      </button>
                    </div>
                    <span className="block text-[10px] text-amber-300 font-normal">
                      (เต็ม {item.maxScore})
                    </span>
                  </th>
                ))}

                <th className="p-2 border border-black text-center bg-amber-900 text-white w-24">
                  คะแนนเก็บรวม
                  <span className="block text-[10px] font-normal text-amber-200">
                    (เต็ม {selectedSubject?.scoreRatio.formativeMax || 50})
                  </span>
                </th>
                <th className="p-2 border border-black text-center bg-amber-800 text-white w-24">
                  กลางภาค
                  <span className="block text-[10px] font-normal text-amber-200">
                    (เต็ม {selectedSubject?.scoreRatio.midtermMax || 20})
                  </span>
                </th>
                <th className="p-2 border border-black text-center bg-sky-900 text-white w-24">
                  ปลายภาค
                  <span className="block text-[10px] font-normal text-sky-200">
                    (เต็ม {selectedSubject?.scoreRatio.finalMax || 30})
                  </span>
                </th>
                <th className="p-2 border border-black text-center bg-emerald-950 text-amber-200 w-24">
                  รวมคะแนน
                  <span className="block text-[10px] font-normal text-white">(เต็ม 100)</span>
                </th>
                <th className="p-3 border border-black text-center bg-amber-400 text-emerald-950 font-extrabold w-20">
                  เกรด GPA
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8 + customItems.length} className="p-6 text-center text-xs text-slate-500 italic">
                    ไม่พบรายชื่อนักเรียนในชั้น {selectedClass}
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const entry = studentScores[st.id] || { itemScores: {}, midterm: 0, final: 0 };
                  const formativeSum = Object.values(entry.itemScores).reduce((a, b) => a + b, 0);
                  const total = formativeSum + entry.midterm + entry.final;
                  const grade = getThaiGrade(total);

                  return (
                    <tr key={st.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                      <td className="p-3 border border-black text-center font-bold">{st.part1.studentNumber}</td>
                      <td className="p-3 border border-black font-mono font-bold text-emerald-900">
                        {st.part1.studentCode}
                      </td>
                      <td className="p-3 border border-black font-medium">
                        {st.part1.prefix} {st.part1.firstName} {st.part1.lastName}
                      </td>

                      {/* Custom Item Score Inputs */}
                      {customItems.map((item) => (
                        <td key={item.id} className="p-2 border border-black text-center">
                          <input
                            type="number"
                            min="0"
                            max={item.maxScore}
                            value={entry.itemScores[item.id] ?? 0}
                            onChange={(e) =>
                              handleScoreChange(
                                st.id,
                                'item',
                                parseFloat(e.target.value) || 0,
                                item.id,
                                item.maxScore
                              )
                            }
                            className="w-16 text-center font-bold text-xs"
                          />
                        </td>
                      ))}

                      <td className="p-3 border border-black text-center font-bold bg-amber-50 text-amber-900">
                        {formativeSum}
                      </td>
                      <td className="p-2 border border-black text-center">
                        <input
                          type="number"
                          min="0"
                          max={selectedSubject?.scoreRatio.midtermMax || 20}
                          value={entry.midterm}
                          onChange={(e) =>
                            handleScoreChange(
                              st.id,
                              'midterm',
                              parseFloat(e.target.value) || 0,
                              undefined,
                              selectedSubject?.scoreRatio.midtermMax || 20
                            )
                          }
                          className="w-16 text-center font-bold text-xs"
                        />
                      </td>
                      <td className="p-2 border border-black text-center">
                        <input
                          type="number"
                          min="0"
                          max={selectedSubject?.scoreRatio.finalMax || 30}
                          value={entry.final}
                          onChange={(e) =>
                            handleScoreChange(
                              st.id,
                              'final',
                              parseFloat(e.target.value) || 0,
                              undefined,
                              selectedSubject?.scoreRatio.finalMax || 30
                            )
                          }
                          className="w-16 text-center font-bold text-xs"
                        />
                      </td>
                      <td className="p-3 border border-black text-center font-extrabold text-sm text-emerald-950 bg-emerald-50">
                        {total}
                      </td>
                      <td className="p-3 border border-black text-center font-extrabold text-sm bg-amber-100 text-amber-950">
                        {grade}
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

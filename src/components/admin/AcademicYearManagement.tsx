/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AcademicYear } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { Calendar, Plus, CheckCircle, ArrowLeft, Trash2 } from 'lucide-react';

interface AcademicYearManagementProps {
  onBack: () => void;
}

export const AcademicYearManagement: React.FC<AcademicYearManagementProps> = ({ onBack }) => {
  const [years, setYears] = useState<AcademicYear[]>(StorageService.getAcademicYears());
  const [showModal, setShowModal] = useState(false);
  const [newYearStr, setNewYearStr] = useState('2570');
  const [newSemester, setNewSemester] = useState<'1' | '2'>('1');

  const handleSetCurrent = (id: string) => {
    const updated = years.map((y) => ({
      ...y,
      isCurrent: y.id === id,
    }));
    StorageService.saveAcademicYears(updated);
    setYears(updated);
    showToast('เปลี่ยนปีการศึกษาปัจจุบันเรียบร้อยแล้ว', 'success');
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearStr.trim()) return;

    const exists = years.find((y) => y.year === newYearStr.trim() && y.semester === newSemester);
    if (exists) {
      showAlert('ข้อผิดพลาด', `มีรายการปีการศึกษา ${newYearStr} ภาคเรียนที่ ${newSemester} แล้ว`, 'warning');
      return;
    }

    const newAY: AcademicYear = {
      id: 'ay_' + Date.now(),
      year: newYearStr.trim(),
      semester: newSemester,
      isCurrent: false,
    };
    const updated = [...years, newAY];
    StorageService.saveAcademicYears(updated);
    setYears(updated);
    setShowModal(false);
    showToast('เพิ่มปีการศึกษาใหม่เรียบร้อยแล้ว', 'success');
  };

  const handleDelete = async (y: AcademicYear) => {
    if (y.isCurrent) {
      showAlert('แจ้งเตือน', 'ไม่สามารถลบปีการศึกษาปัจจุบันที่ใช้งานอยู่ได้', 'warning');
      return;
    }
    const confirm = await showConfirm(
      'ยืนยันการลบ',
      `คุณต้องการลบปีการศึกษา ${y.year} ภาคเรียนที่ ${y.semester} หรือไม่?`
    );
    if (confirm) {
      const updated = years.filter((item) => item.id !== y.id);
      StorageService.saveAcademicYears(updated);
      setYears(updated);
      showToast('ลบรายการเรียบร้อย', 'success');
    }
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
              <Calendar className="w-6 h-6 text-emerald-700" />
              2. ระบบจัดการปีการศึกษา / ภาคเรียน (Academic Year Management)
            </h2>
            <p className="text-xs text-slate-600">จัดการแยกข้อมูล ภาคเรียนที่ 1 และ ภาคเรียนที่ 2</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>เพิ่มปีการศึกษา/ภาคเรียนใหม่</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black">ลำดับ</th>
                <th className="p-3 border border-black">ปีการศึกษา (พ.ศ.)</th>
                <th className="p-3 border border-black">ภาคเรียน</th>
                <th className="p-3 border border-black text-center">สถานะใช้งาน</th>
                <th className="p-3 border border-black text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y, idx) => (
                <tr key={y.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                  <td className="p-3 border border-black text-center font-bold">{idx + 1}</td>
                  <td className="p-3 border border-black font-bold text-emerald-950 text-sm">ปีการศึกษา {y.year}</td>
                  <td className="p-3 border border-black font-medium">ภาคเรียนที่ {y.semester}</td>
                  <td className="p-3 border border-black text-center">
                    {y.isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full border border-emerald-500">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>ปัจจุบัน</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetCurrent(y.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 font-semibold rounded border border-slate-400"
                      >
                        ตั้งเป็นปัจจุบัน
                      </button>
                    )}
                  </td>
                  <td className="p-3 border border-black text-center">
                    <button
                      onClick={() => handleDelete(y)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded border border-black shadow-xs"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-black">
              เพิ่มปีการศึกษา / ภาคเรียนใหม่
            </h3>

            <form onSubmit={handleAddYear} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">ปีการศึกษา (พ.ศ. แบบไทย)*</label>
                <input
                  type="text"
                  value={newYearStr}
                  onChange={(e) => setNewYearStr(e.target.value)}
                  className="w-full text-xs font-bold"
                  placeholder="เช่น 2570"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ภาคเรียน*</label>
                <select
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value as '1' | '2')}
                  className="w-full text-xs bg-white"
                >
                  <option value="1">ภาคเรียนที่ 1</option>
                  <option value="2">ภาคเรียนที่ 2</option>
                </select>
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
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

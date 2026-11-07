/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BMIRecord, Student, SchoolClass, ALL_CLASSES, User } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showToast } from '../../utils/sweetalert';
import { Scale, Save, Printer, ArrowLeft, HeartPulse, Activity } from 'lucide-react';

interface BMICalculatorProps {
  onBack: () => void;
  currentUser: User | null;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ onBack, currentUser }) => {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>(
    (currentUser?.assignedClass as SchoolClass) || 'ป.1/1'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const students = StorageService.getStudents().filter(
    (s) => s.part1.className === selectedClass
  );

  const existingBMIRecords = StorageService.getBMIRecords();

  // Local state for table editing
  const [bmiData, setBmiData] = useState<
    Record<string, { weight: number; height: number; note: string }>
  >(() => {
    const initialMap: Record<string, { weight: number; height: number; note: string }> = {};
    students.forEach((s) => {
      const found = existingBMIRecords.find(
        (b) => b.studentId === s.id && b.date === selectedDate
      );
      initialMap[s.id] = {
        weight: found ? found.weightKg : 22.0,
        height: found ? found.heightCm : 120,
        note: found?.note || '',
      };
    });
    return initialMap;
  });

  // Calculate BMI and Status Text
  const calculateBMI = (weightKg: number, heightCm: number) => {
    if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, status: 'ปกติ' };
    const heightM = heightCm / 100;
    const bmiVal = parseFloat((weightKg / (heightM * heightM)).toFixed(2));

    let status: 'น้ำหนักน้อย' | 'ปกติ' | 'น้ำหนักเกิน' | 'อ้วนระดับ 1' | 'อ้วนระดับ 2' = 'ปกติ';

    if (bmiVal < 18.5) status = 'น้ำหนักน้อย';
    else if (bmiVal <= 22.9) status = 'ปกติ';
    else if (bmiVal <= 24.9) status = 'น้ำหนักเกิน';
    else if (bmiVal <= 29.9) status = 'อ้วนระดับ 1';
    else status = 'อ้วนระดับ 2';

    return { bmi: bmiVal, status };
  };

  const handleInputChange = (
    studentId: string,
    field: 'weight' | 'height' | 'note',
    value: any
  ) => {
    setBmiData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveBMI = () => {
    const currentYear = StorageService.getCurrentAcademicYear().year;

    const otherRecords = existingBMIRecords.filter(
      (b) => !(b.className === selectedClass && b.date === selectedDate)
    );

    const newRecords: BMIRecord[] = students.map((s) => {
      const entry = bmiData[s.id] || { weight: 22, height: 120, note: '' };
      const { bmi, status } = calculateBMI(entry.weight, entry.height);

      return {
        id: 'bmi_' + Date.now() + '_' + s.id,
        academicYear: currentYear,
        date: selectedDate,
        className: selectedClass,
        studentId: s.id,
        studentName: `${s.part1.prefix} ${s.part1.firstName} ${s.part1.lastName}`,
        weightKg: entry.weight,
        heightCm: entry.height,
        bmi,
        statusText: status as 'น้ำหนักน้อย' | 'ปกติ' | 'น้ำหนักเกิน' | 'อ้วนระดับ 1' | 'อ้วนระดับ 2',
        note: entry.note,
        homeroom1Name: 'ครูสมใจ ใจดี',
        homeroom2Name: 'ครูวิภา รุ่งเรือง',
      };
    });

    const updated = [...otherRecords, ...newRecords];
    StorageService.saveBMIRecords(updated);
    showToast(`บันทึกข้อมูล BMI ชั้น ${selectedClass} เรียบร้อยแล้ว`, 'success');
  };

  return (
    <div className="space-y-6 font-['Sarabun'] pb-12">
      {/* Header Bar Clinical Theme (ฟ้า-เขียว) */}
      <div className="bg-gradient-to-r from-sky-900 to-emerald-900 text-white p-5 rounded-xl border-2 border-black shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK"
            alt="โลโก้โรงเรียน"
            className="h-12 w-auto object-contain bg-white p-1 rounded-lg border border-black shadow-sm"
          />

          <div>
            <h2 className="text-base sm:text-lg font-bold text-amber-200 leading-tight">
              ระบบชั่งน้ำหนัก–วัดส่วนสูง–คำนวณค่า BMI โรงเรียนอนุบาลสุธิชา
            </h2>
            <p className="text-xs text-sky-200 mt-0.5">
              ชั้น {selectedClass} | ครูประจำชั้นคนที่ 1: <strong>ครูสมใจ ใจดี</strong> | ครูประจำชั้นคนที่ 2: <strong>ครูวิภา รุ่งเรือง</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงานสรุป PDF</span>
          </button>

          <button
            onClick={handleSaveBMI}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>บันทึกข้อมูล BMI</span>
          </button>
        </div>
      </div>

      {/* Class & Date Selector */}
      <div className="bg-sky-50 p-4 rounded-xl border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-950">เลือกชั้นเรียน:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as SchoolClass)}
              className="text-xs font-bold py-1.5 px-3 border border-black rounded-lg bg-white text-sky-950"
            >
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  ชั้น {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-950">ประจำวันที่:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold py-1.5 px-3 border border-black rounded-lg bg-white"
            />
          </div>
        </div>

        {/* BMI Categories Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="px-2 py-0.5 bg-sky-100 text-sky-900 border border-sky-400 rounded">
            BMI &lt; 18.5 (น้ำหนักน้อย)
          </span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-400 rounded">
            18.5–22.9 (ปกติ)
          </span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 rounded">
            23–24.9 (น้ำหนักเกิน)
          </span>
          <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-400 rounded">
            ≥ 25 (อ้วนระดับ 1-2)
          </span>
        </div>
      </div>

      {/* BMI Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-sky-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black text-center w-14">เลขที่</th>
                <th className="p-3 border border-black">ชื่อ-นามสกุล นักเรียน</th>
                <th className="p-3 border border-black text-center w-28">น้ำหนัก (กก.)</th>
                <th className="p-3 border border-black text-center w-28">ส่วนสูง (ซม.)</th>
                <th className="p-3 border border-black text-center w-28 bg-sky-950">ค่า BMI</th>
                <th className="p-3 border border-black text-center w-36">สถานะสุขภาพ</th>
                <th className="p-3 border border-black">หมายเหตุ / คำแนะนำ</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-xs text-slate-500 italic">
                    ไม่พบข้อมูลนักเรียนในชั้น {selectedClass}
                  </td>
                </tr>
              ) : (
                students.map((st) => {
                  const entry = bmiData[st.id] || { weight: 22, height: 120, note: '' };
                  const { bmi, status } = calculateBMI(entry.weight, entry.height);

                  return (
                    <tr key={st.id} className="hover:bg-sky-50/50 border-b border-slate-200">
                      <td className="p-3 border border-black text-center font-bold">{st.part1.studentNumber}</td>
                      <td className="p-3 border border-black font-medium">
                        {st.part1.prefix} {st.part1.firstName} {st.part1.lastName}
                      </td>
                      <td className="p-2 border border-black text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={entry.weight}
                          onChange={(e) =>
                            handleInputChange(st.id, 'weight', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center font-bold text-xs"
                        />
                      </td>
                      <td className="p-2 border border-black text-center">
                        <input
                          type="number"
                          step="0.5"
                          value={entry.height}
                          onChange={(e) =>
                            handleInputChange(st.id, 'height', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center font-bold text-xs"
                        />
                      </td>
                      <td className="p-3 border border-black text-center font-mono font-extrabold text-sm text-sky-900 bg-sky-50">
                        {bmi}
                      </td>
                      <td className="p-3 border border-black text-center">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                            status === 'ปกติ'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                              : status === 'น้ำหนักน้อย'
                              ? 'bg-sky-100 text-sky-900 border-sky-400'
                              : status === 'น้ำหนักเกิน'
                              ? 'bg-amber-100 text-amber-900 border-amber-400'
                              : 'bg-rose-100 text-rose-900 border-rose-400'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-2 border border-black">
                        <input
                          type="text"
                          value={entry.note}
                          onChange={(e) => handleInputChange(st.id, 'note', e.target.value)}
                          className="w-full text-xs"
                          placeholder="คำแนะนำสุขภาพ..."
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

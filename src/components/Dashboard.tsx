/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  BookOpen,
  PieChart as PieChartIcon,
  Search,
  School,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

import {
  Student,
  TeacherStaff,
  AttendanceRecord,
  ScheduleSlot,
  TeachingLog,
  SchoolClass,
  ALL_CLASSES,
} from '../types';
import { StorageService } from '../services/storage';

interface DashboardProps {
  onOpenTeachingLog: () => void;
  onOpenLogin: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenTeachingLog,
  onOpenLogin,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<TeacherStaff[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [teachingLogs, setTeachingLogs] = useState<TeachingLog[]>([]);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduleClass, setScheduleClass] = useState<SchoolClass>('ป.1/1');
  const [absentFilterClass, setAbsentFilterClass] = useState<string>('ทั้งหมด');
  const [showSchedulePrintModal, setShowSchedulePrintModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = () => {
    setStudents(StorageService.getStudents());
    setTeachers(StorageService.getTeachers());
    setAttendance(StorageService.getAttendance());
    setSchedules(StorageService.getSchedules());
    setTeachingLogs(StorageService.getTeachingLogs());
  };

  // Convert Gregorian date YYYY-MM-DD to Thai Date (e.g. 14 มิถุนายน 2569)
  const formatThaiDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const thaiMonths = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ];
      const day = d.getDate();
      const month = thaiMonths[d.getMonth()];
      const year = d.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Metric Computations
  const maleTeachers = teachers.filter((t) => t.name.startsWith('ครู') || t.name.startsWith('นาย')).length;
  const femaleTeachers = teachers.length - maleTeachers;

  const maleStudents = students.filter(
    (s) => s.part1.prefix === 'เด็กชาย' || s.part1.prefix === 'นาย'
  ).length;
  const femaleStudents = students.filter(
    (s) => s.part1.prefix === 'เด็กหญิง' || s.part1.prefix === 'นางสาว'
  ).length;
  const totalStudents = students.length;

  // Filter attendance for selected date
  const todayAttendance = attendance.filter((a) => a.date === selectedDate);
  const totalPresentToday = todayAttendance.filter((a) => a.status === 'มา').length;
  const totalAbsentToday = todayAttendance.filter((a) => a.status === 'ขาด').length;
  const totalLeaveToday = todayAttendance.filter((a) => a.status === 'ลา').length;
  const totalSickToday = todayAttendance.filter((a) => a.status === 'ป่วย').length;

  // Unchecked classes list
  const checkedClasses = Array.from(new Set(todayAttendance.map((a) => a.className)));
  const uncheckedClasses = ALL_CLASSES.filter((c) => !checkedClasses.includes(c));

  // Absent students list for phone calls
  const absentStudents = todayAttendance.filter(
    (a) => (a.status === 'ขาด' || a.status === 'ลา' || a.status === 'ป่วย') &&
      (absentFilterClass === 'ทั้งหมด' || a.className === absentFilterClass)
  );

  // Group class breakdown statistics for attendance table
  const getClassStats = (c: SchoolClass) => {
    const classStudents = students.filter((s) => s.part1.className === c);
    const maleFull = classStudents.filter(
      (s) => s.part1.prefix === 'เด็กชาย' || s.part1.prefix === 'นาย'
    ).length;
    const femaleFull = classStudents.filter(
      (s) => s.part1.prefix === 'เด็กหญิง' || s.part1.prefix === 'นางสาว'
    ).length;
    const totalFull = classStudents.length;

    const classAtt = todayAttendance.filter((a) => a.className === c);
    const malePresent = classAtt.filter(
      (a) => a.status === 'มา' && (a.studentName.includes('เด็กชาย') || a.studentName.includes('นาย'))
    ).length;
    const femalePresent = classAtt.filter(
      (a) => a.status === 'มา' && (a.studentName.includes('เด็กหญิง') || a.studentName.includes('นางสาว'))
    ).length;
    const totalPresent = malePresent + femalePresent;

    const sick = classAtt.filter((a) => a.status === 'ป่วย').length;
    const leave = classAtt.filter((a) => a.status === 'ลา').length;
    const absent = classAtt.filter((a) => a.status === 'ขาด').length;
    const totalNotPresent = sick + leave + absent;

    const percentPresent = totalFull > 0 ? ((totalPresent / totalFull) * 100).toFixed(1) : '0.0';

    return {
      className: c,
      maleFull,
      femaleFull,
      totalFull,
      malePresent,
      femalePresent,
      totalPresent,
      sick,
      leave,
      absent,
      totalNotPresent,
      percentPresent: parseFloat(percentPresent),
      teacher1: c === 'ป.1/1' ? 'ครูสมใจ ใจดี' : c === 'ป.1/2' ? 'ครูวิภา รุ่งเรือง' : 'ครูอัมพร อนุบาลจิต',
      teacher2: c === 'ป.1/1' ? 'ครูวิภา รุ่งเรือง' : 'ครูชัยพร สุขสวัสดิ์',
    };
  };

  // Category aggregations:
  const preKClasses: SchoolClass[] = ['ตอ.1/1'];
  const kindergartenClasses: SchoolClass[] = [
    'อ.1/1',
    'อ.1/2',
    'อ.2/1',
    'อ.2/2',
    'อ.3/1',
    'อ.3/2',
  ];
  const primaryClasses: SchoolClass[] = [
    'ป.1/1',
    'ป.1/2',
    'ป.2/1',
    'ป.2/2',
    'ป.3/1',
    'ป.3/2',
    'ป.4/1',
    'ป.4/2',
    'ป.5/1',
    'ป.5/2',
    'ป.6/1',
    'ป.6/2',
  ];

  const sumStats = (classList: SchoolClass[]) => {
    return classList.reduce(
      (acc, c) => {
        const s = getClassStats(c);
        acc.maleFull += s.maleFull;
        acc.femaleFull += s.femaleFull;
        acc.totalFull += s.totalFull;
        acc.malePresent += s.malePresent;
        acc.femalePresent += s.femalePresent;
        acc.totalPresent += s.totalPresent;
        acc.sick += s.sick;
        acc.leave += s.leave;
        acc.absent += s.absent;
        acc.totalNotPresent += s.totalNotPresent;
        return acc;
      },
      {
        maleFull: 0,
        femaleFull: 0,
        totalFull: 0,
        malePresent: 0,
        femalePresent: 0,
        totalPresent: 0,
        sick: 0,
        leave: 0,
        absent: 0,
        totalNotPresent: 0,
      }
    );
  };

  const preKSum = sumStats(preKClasses);
  const kindergartenSum = sumStats(kindergartenClasses);
  const primarySum = sumStats(primaryClasses);
  const grandTotalSum = sumStats(ALL_CLASSES);

  // Schedules for dropdown class
  const currentClassSchedules = schedules.filter((s) => s.className === scheduleClass);

  return (
    <div className="space-y-6 pb-12 font-['Sarabun']">
      {/* 1. Metric Summary Cards (สี่เหลี่ยมมน แยกสีพื้นสลับกัน) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Teachers */}
        <div className="bg-emerald-800 text-white p-5 rounded-xl border-2 border-black shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-200">จำนวนครูและบุคลากร</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-200 mt-1">
                {teachers.length} <span className="text-sm font-normal text-white">คน</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-700 rounded-lg border border-emerald-600">
              <Users className="w-7 h-7 text-amber-300" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-700/60 flex items-center justify-between text-xs text-emerald-100">
            <span>ชาย: <strong className="text-amber-200">{maleTeachers}</strong> คน</span>
            <span>หญิง: <strong className="text-amber-200">{femaleTeachers}</strong> คน</span>
          </div>
        </div>

        {/* Card 2: Students Male/Female */}
        <div className="bg-amber-100 text-amber-950 p-5 rounded-xl border-2 border-black shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800">นักเรียนรวมทั้งหมด</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
                {totalStudents} <span className="text-sm font-normal text-slate-700">คน</span>
              </h3>
            </div>
            <div className="p-3 bg-amber-200 rounded-lg border border-amber-400">
              <GraduationCap className="w-7 h-7 text-amber-800" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-300 flex items-center justify-between text-xs text-amber-900">
            <span>ชาย: <strong>{maleStudents}</strong> คน</span>
            <span>หญิง: <strong>{femaleStudents}</strong> คน</span>
          </div>
        </div>

        {/* Card 3: Present Today */}
        <div className="bg-sky-100 text-sky-950 p-5 rounded-xl border-2 border-black shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-sky-800">มาเรียนวันนี้ ({formatThaiDate(selectedDate)})</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-900 mt-1">
                {totalPresentToday}{' '}
                <span className="text-xs font-normal text-sky-700">
                  ({totalStudents > 0 ? ((totalPresentToday / totalStudents) * 100).toFixed(1) : 0}%)
                </span>
              </h3>
            </div>
            <div className="p-3 bg-sky-200 rounded-lg border border-sky-400">
              <CheckCircle2 className="w-7 h-7 text-sky-700" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-sky-300 flex items-center justify-between text-xs text-sky-900">
            <span>บันทึกแล้ว: <strong>{todayAttendance.length}</strong> คน</span>
            <span>รอเช็คชื่อ: <strong>{totalStudents - todayAttendance.length}</strong> คน</span>
          </div>
        </div>

        {/* Card 4: Absent/Leave/Sick Today */}
        <div className="bg-rose-100 text-rose-950 p-5 rounded-xl border-2 border-black shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-800">ไม่มาเรียนวันนี้ (ขาด/ลา/ป่วย)</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-1">
                {totalAbsentToday + totalLeaveToday + totalSickToday}{' '}
                <span className="text-xs font-normal text-rose-700">คน</span>
              </h3>
            </div>
            <div className="p-3 bg-rose-200 rounded-lg border border-rose-400">
              <Clock className="w-7 h-7 text-rose-700" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-300 flex items-center justify-between text-xs text-rose-900">
            <span>ลา: <strong>{totalLeaveToday}</strong></span>
            <span>ป่วย: <strong>{totalSickToday}</strong></span>
            <span>ขาด: <strong className="text-red-700 font-extrabold">{totalAbsentToday}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Attendance Table Section (ตารางสถิติการมาเรียน) */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="bg-emerald-900 text-white p-4 border-b-2 border-black flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <School className="w-6 h-6 text-amber-300" />
            <h2 className="text-base sm:text-lg font-bold text-amber-200 text-center md:text-left">
              ตารางสถิติการมาเรียน ประจำวันที่ {formatThaiDate(selectedDate)}
            </h2>
          </div>

          {/* Thai Date Lookup Picker */}
          <div className="flex items-center gap-2 bg-emerald-800 p-1.5 rounded-lg border border-emerald-700">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span className="text-xs text-cream whitespace-nowrap">ค้นหาวันที่:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs py-1 px-2 rounded border border-black text-slate-900 font-semibold bg-white"
            />
          </div>
        </div>

        {/* Attendance Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-amber-100 text-center border-b border-black">
                <th className="p-2 border border-black font-bold">ระดับชั้น</th>
                <th colSpan={3} className="p-2 border border-black bg-emerald-850">นักเรียนทั้งหมด (เต็ม)</th>
                <th colSpan={3} className="p-2 border border-black bg-sky-900 text-sky-100">มาเรียนวันนี้</th>
                <th colSpan={4} className="p-2 border border-black bg-rose-900 text-rose-100">นักเรียนไม่มาเรียน</th>
                <th className="p-2 border border-black bg-amber-900 text-amber-100">สรุปมาเรียน</th>
                <th className="p-2 border border-black bg-amber-800 text-white">ร้อยละ</th>
                <th className="p-2 border border-black">ครูคนที่ 1</th>
                <th className="p-2 border border-black">ครูคนที่ 2</th>
              </tr>
              <tr className="bg-emerald-700 text-white text-center border-b border-black text-[11px]">
                <th className="p-1.5 border border-black">ห้องเรียน</th>
                <th className="p-1.5 border border-black bg-emerald-800">ชาย</th>
                <th className="p-1.5 border border-black bg-emerald-800">หญิง</th>
                <th className="p-1.5 border border-black bg-emerald-900 font-bold">รวม</th>

                <th className="p-1.5 border border-black bg-sky-800">ชาย</th>
                <th className="p-1.5 border border-black bg-sky-800">หญิง</th>
                <th className="p-1.5 border border-black bg-sky-900 font-bold">รวม</th>

                <th className="p-1.5 border border-black bg-rose-800">ป่วย</th>
                <th className="p-1.5 border border-black bg-rose-800">ลา</th>
                <th className="p-1.5 border border-black bg-rose-800">ขาด</th>
                <th className="p-1.5 border border-black bg-rose-900 font-bold">รวม</th>

                <th className="p-1.5 border border-black bg-amber-800">จำนวนมา</th>
                <th className="p-1.5 border border-black bg-amber-700">%</th>
                <th className="p-1.5 border border-black">ชื่อ-นามสกุล</th>
                <th className="p-1.5 border border-black">ชื่อ-นามสกุล</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Pre-K Rows */}
              {preKClasses.map((c, idx) => {
                const s = getClassStats(c);
                return (
                  <tr key={c} className={idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/40'}>
                    <td className="p-2 border border-black font-bold text-emerald-900">{c}</td>
                    <td className="p-2 border border-black text-center">{s.maleFull}</td>
                    <td className="p-2 border border-black text-center">{s.femaleFull}</td>
                    <td className="p-2 border border-black text-center font-bold">{s.totalFull}</td>
                    <td className="p-2 border border-black text-center bg-sky-50">{s.malePresent}</td>
                    <td className="p-2 border border-black text-center bg-sky-50">{s.femalePresent}</td>
                    <td className="p-2 border border-black text-center font-bold bg-sky-100 text-sky-900">{s.totalPresent}</td>
                    <td className="p-2 border border-black text-center bg-amber-50">{s.sick}</td>
                    <td className="p-2 border border-black text-center bg-amber-50">{s.leave}</td>
                    <td className="p-2 border border-black text-center bg-rose-50 text-rose-700 font-bold">{s.absent}</td>
                    <td className="p-2 border border-black text-center font-bold bg-rose-100">{s.totalNotPresent}</td>
                    <td className="p-2 border border-black text-center font-bold text-emerald-800">{s.totalPresent}</td>
                    <td className="p-2 border border-black text-center font-bold text-emerald-900">{s.percentPresent}%</td>
                    <td className="p-2 border border-black text-slate-700">{s.teacher1}</td>
                    <td className="p-2 border border-black text-slate-700">{s.teacher2}</td>
                  </tr>
                );
              })}
              {/* Summary Row Pre-K */}
              <tr className="bg-emerald-800 text-amber-200 font-bold border-t-2 border-black">
                <td className="p-2 border border-black">สรุปเตรียมอนุบาล</td>
                <td className="p-2 border border-black text-center">{preKSum.maleFull}</td>
                <td className="p-2 border border-black text-center">{preKSum.femaleFull}</td>
                <td className="p-2 border border-black text-center">{preKSum.totalFull}</td>
                <td className="p-2 border border-black text-center">{preKSum.malePresent}</td>
                <td className="p-2 border border-black text-center">{preKSum.femalePresent}</td>
                <td className="p-2 border border-black text-center">{preKSum.totalPresent}</td>
                <td className="p-2 border border-black text-center">{preKSum.sick}</td>
                <td className="p-2 border border-black text-center">{preKSum.leave}</td>
                <td className="p-2 border border-black text-center text-amber-300">{preKSum.absent}</td>
                <td className="p-2 border border-black text-center">{preKSum.totalNotPresent}</td>
                <td className="p-2 border border-black text-center">{preKSum.totalPresent}</td>
                <td className="p-2 border border-black text-center">
                  {preKSum.totalFull > 0 ? ((preKSum.totalPresent / preKSum.totalFull) * 100).toFixed(1) : 0}%
                </td>
                <td colSpan={2} className="p-2 border border-black text-center text-[10px] italic">สายชั้นเตรียมอนุบาล</td>
              </tr>

              {/* 2. Kindergarten Rows */}
              {kindergartenClasses.map((c, idx) => {
                const s = getClassStats(c);
                return (
                  <tr key={c} className={idx % 2 === 0 ? 'bg-amber-50/20' : 'bg-white'}>
                    <td className="p-2 border border-black font-bold text-amber-900">{c}</td>
                    <td className="p-2 border border-black text-center">{s.maleFull}</td>
                    <td className="p-2 border border-black text-center">{s.femaleFull}</td>
                    <td className="p-2 border border-black text-center font-bold">{s.totalFull}</td>
                    <td className="p-2 border border-black text-center bg-sky-50">{s.malePresent}</td>
                    <td className="p-2 border border-black text-center bg-sky-50">{s.femalePresent}</td>
                    <td className="p-2 border border-black text-center font-bold bg-sky-100 text-sky-900">{s.totalPresent}</td>
                    <td className="p-2 border border-black text-center bg-amber-50">{s.sick}</td>
                    <td className="p-2 border border-black text-center bg-amber-50">{s.leave}</td>
                    <td className="p-2 border border-black text-center bg-rose-50 text-rose-700 font-bold">{s.absent}</td>
                    <td className="p-2 border border-black text-center font-bold bg-rose-100">{s.totalNotPresent}</td>
                    <td className="p-2 border border-black text-center font-bold text-emerald-800">{s.totalPresent}</td>
                    <td className="p-2 border border-black text-center font-bold text-emerald-900">{s.percentPresent}%</td>
                    <td className="p-2 border border-black text-slate-700">{s.teacher1}</td>
                    <td className="p-2 border border-black text-slate-700">{s.teacher2}</td>
                  </tr>
                );
              })}
              {/* Summary Row Kindergarten */}
              <tr className="bg-emerald-900 text-amber-200 font-bold border-t-2 border-black">
                <td className="p-2 border border-black">สรุปชั้นอนุบาล (ปฐมวัย)</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.maleFull}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.femaleFull}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.totalFull}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.malePresent}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.femalePresent}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.totalPresent}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.sick}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.leave}</td>
                <td className="p-2 border border-black text-center text-amber-300">{kindergartenSum.absent}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.totalNotPresent}</td>
                <td className="p-2 border border-black text-center">{kindergartenSum.totalPresent}</td>
                <td className="p-2 border border-black text-center">
                  {kindergartenSum.totalFull > 0 ? ((kindergartenSum.totalPresent / kindergartenSum.totalFull) * 100).toFixed(1) : 0}%
                </td>
                <td colSpan={2} className="p-2 border border-black text-center text-[10px] italic">สายชั้นปฐมวัย อ.1-อ.3</td>
              </tr>

              {/* 3. Primary Rows */}
              {primaryClasses.map((c, idx) => {
                const s = getClassStats(c);
                return (
                  <tr key={c} className={idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/20'}>
                    <td className="p-2 border border-black font-bold text-emerald-950">{c}</td>
                    <td className="p-2 border border-black text-center">{s.maleFull}</td>
                    <td className="p-2 border border-black text-center">{s.femaleFull}</td>
                    <td className="p-2 border border-black text-center font-bold">{s.totalFull}</td>
                    <td className="p-2 border border-black text-center bg-sky-50">{s.malePresent}</td>
                    <td className="p-2 border border-black text-center bg-sky-50">{s.femalePresent}</td>
                    <td className="p-2 border border-black text-center font-bold bg-sky-100 text-sky-900">{s.totalPresent}</td>
                    <td className="p-2 border border-black text-center bg-amber-50">{s.sick}</td>
                    <td className="p-2 border border-black text-center bg-amber-50">{s.leave}</td>
                    <td className="p-2 border border-black text-center bg-rose-50 text-rose-700 font-bold">{s.absent}</td>
                    <td className="p-2 border border-black text-center font-bold bg-rose-100">{s.totalNotPresent}</td>
                    <td className="p-2 border border-black text-center font-bold text-emerald-800">{s.totalPresent}</td>
                    <td className="p-2 border border-black text-center font-bold text-emerald-900">{s.percentPresent}%</td>
                    <td className="p-2 border border-black text-slate-700">{s.teacher1}</td>
                    <td className="p-2 border border-black text-slate-700">{s.teacher2}</td>
                  </tr>
                );
              })}
              {/* Summary Row Primary */}
              <tr className="bg-emerald-950 text-amber-200 font-bold border-t-2 border-black">
                <td className="p-2 border border-black">สรุปชั้นประถมศึกษา</td>
                <td className="p-2 border border-black text-center">{primarySum.maleFull}</td>
                <td className="p-2 border border-black text-center">{primarySum.femaleFull}</td>
                <td className="p-2 border border-black text-center">{primarySum.totalFull}</td>
                <td className="p-2 border border-black text-center">{primarySum.malePresent}</td>
                <td className="p-2 border border-black text-center">{primarySum.femalePresent}</td>
                <td className="p-2 border border-black text-center">{primarySum.totalPresent}</td>
                <td className="p-2 border border-black text-center">{primarySum.sick}</td>
                <td className="p-2 border border-black text-center">{primarySum.leave}</td>
                <td className="p-2 border border-black text-center text-amber-300">{primarySum.absent}</td>
                <td className="p-2 border border-black text-center">{primarySum.totalNotPresent}</td>
                <td className="p-2 border border-black text-center">{primarySum.totalPresent}</td>
                <td className="p-2 border border-black text-center">
                  {primarySum.totalFull > 0 ? ((primarySum.totalPresent / primarySum.totalFull) * 100).toFixed(1) : 0}%
                </td>
                <td colSpan={2} className="p-2 border border-black text-center text-[10px] italic">สายชั้นประถมศึกษา ป.1-ป.6</td>
              </tr>

              {/* Grand Total Row */}
              <tr className="bg-amber-400 text-emerald-950 font-extrabold border-t-2 border-black text-sm">
                <td className="p-2 border border-black">สรุปภาพรวมทั้งหมด</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.maleFull}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.femaleFull}</td>
                <td className="p-2 border border-black text-center text-base">{grandTotalSum.totalFull}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.malePresent}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.femalePresent}</td>
                <td className="p-2 border border-black text-center text-base text-emerald-900">{grandTotalSum.totalPresent}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.sick}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.leave}</td>
                <td className="p-2 border border-black text-center text-red-900">{grandTotalSum.absent}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.totalNotPresent}</td>
                <td className="p-2 border border-black text-center">{grandTotalSum.totalPresent}</td>
                <td className="p-2 border border-black text-center text-base">
                  {grandTotalSum.totalFull > 0 ? ((grandTotalSum.totalPresent / grandTotalSum.totalFull) * 100).toFixed(1) : 0}%
                </td>
                <td colSpan={2} className="p-2 border border-black text-center font-normal text-xs">สุธิชาสารสนเทศ SSIS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Unchecked Classes Warning & Absent Students Contact Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Unchecked Classes Warning */}
        <div className="bg-white p-5 rounded-xl border-2 border-black shadow-md flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">
              ชั้นที่ยังไม่ได้เช็คชื่อวันนี้ ({uncheckedClasses.length} ห้อง)
            </h3>
          </div>

          {uncheckedClasses.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs text-center font-bold">
              🎉 เช็คชื่อครบทุกระดับชั้นแล้ว!
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-56">
              <p className="text-xs text-slate-600 mb-2">
                คุณครูประจำชั้นกรุณาบันทึกเช็คชื่อการมาเรียน:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {uncheckedClasses.map((cls) => (
                  <span
                    key={cls}
                    className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 border border-red-400 rounded-md"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={onOpenLogin}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg border border-black shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>เข้าสู่ระบบเพื่อเช็คชื่อ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Absent Student Contact Roster (คลิกเพื่อโทรออกทันที) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border-2 border-black shadow-md flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                รายชื่อนักเรียนที่ไม่มาเรียน / เบอร์ติดต่อผู้ปกครอง
              </h3>
            </div>

            {/* Filter class dropdown */}
            <select
              value={absentFilterClass}
              onChange={(e) => setAbsentFilterClass(e.target.value)}
              className="text-xs py-1 px-2 border border-black rounded bg-cream font-semibold"
            >
              <option value="ทั้งหมด">แสดงทุกชั้นเรียน</option>
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  ห้อง {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-x-auto max-h-64">
            {absentStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                ไม่มีรายชื่อนักเรียนขาดเรียนในเงื่อนไขที่เลือก
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-black">
                    <th className="p-2 border border-black">ชั้น</th>
                    <th className="p-2 border border-black">ชื่อ-นามสกุล</th>
                    <th className="p-2 border border-black">สถานะ</th>
                    <th className="p-2 border border-black">หมายเหตุ</th>
                    <th className="p-2 border border-black text-center">เบอร์โทรติดต่อ</th>
                  </tr>
                </thead>
                <tbody>
                  {absentStudents.map((st) => {
                    const studentObj = students.find((s) => s.id === st.studentId);
                    const phone = studentObj?.part1.parentPhone || '081-234-5678';
                    return (
                      <tr key={st.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                        <td className="p-2 border border-black font-bold text-emerald-800">{st.className}</td>
                        <td className="p-2 border border-black font-medium">{st.studentName}</td>
                        <td className="p-2 border border-black">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                              st.status === 'ขาด'
                                ? 'bg-red-100 text-red-800 border border-red-400'
                                : st.status === 'ลา'
                                ? 'bg-amber-100 text-amber-900 border border-amber-400'
                                : 'bg-blue-100 text-blue-800 border border-blue-400'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="p-2 border border-black text-slate-600">{st.note || '-'}</td>
                        <td className="p-2 border border-black text-center">
                          <a
                            href={`tel:${phone.replace(/-/g, '')}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded border border-black text-xs shadow-xs transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{phone}</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 4. Chart Visualization & Class Timetable Dropdown Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Attendance Distribution Chart */}
        <div className="bg-white p-5 rounded-xl border-2 border-black shadow-md flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <PieChartIcon className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              กราฟแสดงข้อมูลสถิติการมาเรียน / ขาด / ลา (แยกสี ฟ้า-เหลือง-แดง)
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            {/* Visual Bar Comparisons for main segments */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-sky-800">มาเรียน ({totalPresentToday} คน)</span>
                <span className="text-sky-900 font-extrabold">
                  {totalStudents > 0 ? ((totalPresentToday / totalStudents) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full border border-black overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (totalPresentToday / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-800">ลากิจ / ป่วย ({totalLeaveToday + totalSickToday} คน)</span>
                <span className="text-amber-900 font-extrabold">
                  {totalStudents > 0 ? (((totalLeaveToday + totalSickToday) / totalStudents) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full border border-black overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? ((totalLeaveToday + totalSickToday) / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-800">ขาดเรียน ({totalAbsentToday} คน)</span>
                <span className="text-rose-900 font-extrabold">
                  {totalStudents > 0 ? ((totalAbsentToday / totalStudents) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full border border-black overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (totalAbsentToday / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Public Class Teaching Schedule Preview (ตารางสอนประจำวัน) */}
        <div className="bg-white p-5 rounded-xl border-2 border-black shadow-md flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                ตารางสอนประจำวัน (เลือกชั้นเรียน)
              </h3>
            </div>

            {/* Dropdown 1/1, 1/2 ... 6/2 */}
            <div className="flex items-center gap-2">
              <select
                value={scheduleClass}
                onChange={(e) => setScheduleClass(e.target.value as SchoolClass)}
                className="text-xs py-1 px-3 border border-black rounded-lg bg-emerald-50 text-emerald-900 font-bold"
              >
                {ALL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    ชั้น {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowSchedulePrintModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-bold rounded border border-black shadow transition-colors"
                title="พรีวิว & พิมพ์ตารางสอน A5 แนวมอง"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์ A5</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-amber-200 border-b border-black">
                  <th className="p-1.5 border border-black">คาบ</th>
                  <th className="p-1.5 border border-black">เวลา</th>
                  <th className="p-1.5 border border-black">รายวิชา</th>
                  <th className="p-1.5 border border-black">ครูผู้สอน</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((pNum) => {
                  const isLunch = pNum === 4; // Break period slot
                  const slot = currentClassSchedules.find(
                    (s) => s.day === 'จันทร์' && s.periodNumber === pNum
                  );
                  return (
                    <tr key={pNum} className="hover:bg-emerald-50/50">
                      <td className="p-2 border border-black font-bold">คาบ {pNum}</td>
                      <td className="p-2 border border-black text-slate-600">
                        {pNum === 1
                          ? '08:45-09:45'
                          : pNum === 2
                          ? '09:45-10:45'
                          : pNum === 3
                          ? '10:45-11:45'
                          : pNum === 4
                          ? '12:30-13:30'
                          : pNum === 5
                          ? '13:30-14:30'
                          : '14:30-15:30'}
                      </td>
                      <td className="p-2 border border-black font-medium">
                        {slot ? (
                          <span className="text-emerald-900 font-bold">{slot.subjectName}</span>
                        ) : (
                          <span className="text-slate-400 italic">- ว่าง -</span>
                        )}
                      </td>
                      <td className="p-2 border border-black text-slate-700">
                        {slot ? slot.teacherName : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Teaching Log Monitor Section (เมนูการเข้าสอน) */}
      <div className="bg-white p-5 rounded-xl border-2 border-black shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              เมนูการเข้าสอน (รายการเข้าสอนวันนี้ อัปเดตรีลไทม์)
            </h3>
          </div>

          <button
            onClick={onOpenTeachingLog}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <ExternalLink className="w-4 h-4 text-amber-300" />
            <span>เปิดระบบบันทึกการเข้าสอน</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {teachingLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              ยังไม่มีการบันทึกการเข้าสอนในวันนี้
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-amber-200 border-b border-black">
                  <th className="p-2 border border-black">เวลาบันทึก</th>
                  <th className="p-2 border border-black">คาบที่</th>
                  <th className="p-2 border border-black">ชั้น/ห้อง</th>
                  <th className="p-2 border border-black">รายวิชา</th>
                  <th className="p-2 border border-black">ครูผู้สอน</th>
                  <th className="p-2 border border-black">หัวข้อกิจกรรมการสอน</th>
                </tr>
              </thead>
              <tbody>
                {teachingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/50">
                    <td className="p-2 border border-black text-slate-600 font-mono">{log.time} น.</td>
                    <td className="p-2 border border-black font-bold text-center">คาบ {log.periodNumber}</td>
                    <td className="p-2 border border-black font-bold text-emerald-900">{log.className}</td>
                    <td className="p-2 border border-black font-medium">{log.subjectName}</td>
                    <td className="p-2 border border-black">{log.teacherName}</td>
                    <td className="p-2 border border-black text-slate-800">{log.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* A5 Landscape Print Modal Preview */}
      {showSchedulePrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs font-['Sarabun'] no-print">
          <div className="bg-white rounded-xl border-2 border-black max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            {/* Header printable area */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK"
                  alt="โลโก้โรงเรียน"
                  className="h-12 w-auto object-contain p-0.5 border border-black rounded"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ตารางสอนประจำชั้นเรียน {scheduleClass} (ขนาดกระดาษ A5 แนวยาว/แนวนอน)
                  </h3>
                  <p className="text-xs text-slate-600">โรงเรียนอนุบาลสุธิชา ปีการศึกษา 2569</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-lg border border-black shadow"
              >
                <Printer className="w-4 h-4" />
                <span>สั่งพิมพ์ (Print)</span>
              </button>
            </div>

            {/* Timetable grid mockup */}
            <div className="printable-area border border-black p-3 bg-white">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 border border-black font-bold">วัน / เวลา</th>
                    <th className="p-2 border border-black">08:45-09:45</th>
                    <th className="p-2 border border-black">09:45-10:45</th>
                    <th className="p-2 border border-black">10:45-11:45</th>
                    <th className="p-2 border border-black bg-slate-200">11:45-12:30</th>
                    <th className="p-2 border border-black">12:30-13:30</th>
                    <th className="p-2 border border-black">13:30-14:30</th>
                    <th className="p-2 border border-black">14:30-15:30</th>
                  </tr>
                </thead>
                <tbody>
                  {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'].map((day) => (
                    <tr key={day}>
                      <td className="p-2 border border-black font-bold bg-emerald-50">{day}</td>
                      {[1, 2, 3].map((pn) => {
                        const s = schedules.find(
                          (sc) => sc.className === scheduleClass && sc.day === day && sc.periodNumber === pn
                        );
                        return (
                          <td key={pn} className="p-1.5 border border-black text-[11px]">
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
                      {[4, 5, 6].map((pn) => {
                        const s = schedules.find(
                          (sc) => sc.className === scheduleClass && sc.day === day && sc.periodNumber === pn
                        );
                        return (
                          <td key={pn} className="p-1.5 border border-black text-[11px]">
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSchedulePrintModal(false)}
                className="px-4 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-bold rounded border border-black"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

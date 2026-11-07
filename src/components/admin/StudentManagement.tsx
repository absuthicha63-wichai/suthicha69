/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Student,
  SchoolClass,
  ALL_CLASSES,
  User,
} from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import {
  GraduationCap,
  Upload,
  Download,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  UserCheck,
  HeartHandshake,
  BookOpen,
  Award,
  Image as ImageIcon,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface StudentManagementProps {
  onBack: () => void;
  currentUser: User | null;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  onBack,
  currentUser,
}) => {
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [filterClass, setFilterClass] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal view & Tab state
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'part1' | 'part2' | 'part3' | 'part4' | 'part5'>('part1');

  const isAdmin = currentUser?.roles.includes('admin') || false;

  // Form States (Part 1 - 5)
  const [number, setNumber] = useState<number>(1);
  const [code, setCode] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [prefix, setPrefix] = useState<'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว'>('เด็กชาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [className, setClassName] = useState<SchoolClass>('ป.1/1');
  const [birthDate, setBirthDate] = useState('2019-01-01');
  const [status, setStatus] = useState<'กำลังศึกษา' | 'ย้ายออก' | 'พักการเรียน'>('กำลังศึกษา');
  const [address, setAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Part 2
  const [fatherName, setFatherName] = useState('');
  const [fatherJob, setFatherJob] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherJob, setMotherJob] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [approxIncome, setApproxIncome] = useState('');

  // Part 3
  const [gpa, setGpa] = useState<number>(3.5);
  const [strengths, setStrengths] = useState('');
  const [developmentAreas, setDevelopmentAreas] = useState('');

  // Part 4
  const [responsibility, setResponsibility] = useState<'ดีเยี่ยม' | 'ดี' | 'ผ่าน' | 'ปรับปรุง'>('ดีเยี่ยม');
  const [discipline, setDiscipline] = useState<'ดีเยี่ยม' | 'ดี' | 'ผ่าน' | 'ปรับปรุง'>('ดีเยี่ยม');
  const [socialSkills, setSocialSkills] = useState<'ดีเยี่ยม' | 'ดี' | 'ผ่าน' | 'ปรับปรุง'>('ดีเยี่ยม');
  const [healthEmotion, setHealthEmotion] = useState('');

  // Part 5
  const [problemFound, setProblemFound] = useState('');
  const [supportPlan, setSupportPlan] = useState('');
  const [followUpResult, setFollowUpResult] = useState('');

  // Calculate age automatically from birthDate
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNumber(students.length + 1);
    setCode(`STD${Date.now().toString().slice(-4)}`);
    setCitizenId('1-1002-00' + Math.floor(10000 + Math.random() * 90000));
    setPrefix('เด็กชาย');
    setFirstName('');
    setLastName('');
    setClassName('ป.1/1');
    setBirthDate('2019-01-01');
    setStatus('กำลังศึกษา');
    setAddress('จ.ขอนแก่น');
    setParentPhone('081-234-5678');
    setPhotoUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80');

    setFatherName('');
    setFatherJob('');
    setMotherName('');
    setMotherJob('');
    setGuardianName('');
    setApproxIncome('20,000 บาท/เดือน');

    setGpa(3.5);
    setStrengths('อ่านออกเขียนได้ สื่อสารดีเยี่ยม');
    setDevelopmentAreas('ฝึกการเขียนตามคำบอกเพิ่มเติม');

    setResponsibility('ดีเยี่ยม');
    setDiscipline('ดีเยี่ยม');
    setSocialSkills('ดี');
    setHealthEmotion('สุขภาพสมบูรณ์ ร่าเริง แจ่มใส');

    setProblemFound('ไม่มี');
    setSupportPlan('ส่งเสริมกิจกรรมทางวิชาการและดนตรี');
    setFollowUpResult('ทำกิจกรรมได้อย่างต่อเนื่อง');

    setActiveTab('part1');
    setShowModal(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setNumber(st.part1.studentNumber);
    setCode(st.part1.studentCode);
    setCitizenId(st.part1.citizenId);
    setPrefix(st.part1.prefix);
    setFirstName(st.part1.firstName);
    setLastName(st.part1.lastName);
    setClassName(st.part1.className);
    setBirthDate(st.part1.birthDate);
    setStatus(st.part1.status);
    setAddress(st.part1.address);
    setParentPhone(st.part1.parentPhone);
    setPhotoUrl(st.part1.photoUrl || '');

    setFatherName(st.part2.fatherName);
    setFatherJob(st.part2.fatherJob);
    setMotherName(st.part2.motherName);
    setMotherJob(st.part2.motherJob);
    setGuardianName(st.part2.guardianName);
    setApproxIncome(st.part2.approxIncome);

    setGpa(st.part3.gpa);
    setStrengths(st.part3.strengths);
    setDevelopmentAreas(st.part3.developmentAreas);

    setResponsibility(st.part4.responsibility);
    setDiscipline(st.part4.discipline);
    setSocialSkills(st.part4.socialSkills);
    setHealthEmotion(st.part4.healthEmotion);

    setProblemFound(st.part5.problemFound);
    setSupportPlan(st.part5.supportPlan);
    setFollowUpResult(st.part5.followUpResult);

    setActiveTab('part1');
    setShowModal(true);
  };

  const handleDelete = async (st: Student) => {
    const confirm = await showConfirm(
      'ยืนยันการลบนีกเรียน',
      `คุณต้องการลบข้อมูลนักเรียน "${st.part1.prefix}${st.part1.firstName} ${st.part1.lastName}" หรือไม่?`
    );
    if (confirm) {
      const updated = students.filter((s) => s.id !== st.id);
      StorageService.saveStudents(updated);
      setStudents(updated);
      showToast('ลบข้อมูลนักเรียนเรียบร้อย', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('ข้อผิดพลาด', 'กรุณาระบุชื่อและนามสกุลนักเรียน', 'warning');
      return;
    }

    const currentYear = StorageService.getCurrentAcademicYear().year;

    const studentData: Student = {
      id: editingStudent ? editingStudent.id : 'std_' + Date.now(),
      academicYear: currentYear,
      part1: {
        studentNumber: number,
        studentCode: code,
        citizenId,
        prefix,
        firstName,
        lastName,
        className,
        birthDate,
        status,
        address,
        parentPhone,
        photoUrl,
      },
      part2: {
        fatherName,
        fatherJob,
        motherName,
        motherJob,
        guardianName,
        approxIncome,
      },
      part3: {
        gpa,
        strengths,
        developmentAreas,
      },
      part4: {
        responsibility,
        discipline,
        socialSkills,
        healthEmotion,
      },
      part5: {
        problemFound,
        supportPlan,
        followUpResult,
      },
    };

    let updated: Student[];
    if (editingStudent) {
      updated = students.map((s) => (s.id === editingStudent.id ? studentData : s));
      showToast('แก้ไขข้อมูลนักเรียนเรียบร้อย', 'success');
    } else {
      updated = [...students, studentData];
      showToast('เพิ่มนักเรียนใหม่เรียบร้อย', 'success');
    }

    StorageService.saveStudents(updated);
    setStudents(updated);
    setShowModal(false);
  };

  // Import Excel (.xlsx, .xls, .csv)
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (data && data.length > 0) {
          const importedStudents: Student[] = data.map((item, idx) => ({
            id: 'std_imp_' + Date.now() + '_' + idx,
            academicYear: '2569',
            part1: {
              studentNumber: item['เลขที่'] || idx + 1,
              studentCode: item['เลขประจำตัว'] || `STD${6900 + idx}`,
              citizenId: item['เลขประชาชน'] || '1-1002-00000-00-0',
              prefix: item['คำนำหน้า'] || 'เด็กชาย',
              firstName: item['ชื่อ'] || `นักเรียน ${idx + 1}`,
              lastName: item['นามสกุล'] || 'นำเข้า',
              className: (item['ชั้น'] as SchoolClass) || 'ป.1/1',
              birthDate: item['วันเกิด'] || '2019-01-01',
              status: 'กำลังศึกษา',
              address: item['ที่อยู่'] || 'อ.เมือง จ.ขอนแก่น',
              parentPhone: item['เบอร์ผู้ปกครอง'] || '081-234-5678',
              photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
            },
            part2: {
              fatherName: item['ชื่อบิดา'] || '-',
              fatherJob: item['อาชีพบิดา'] || '-',
              motherName: item['ชื่อมารดา'] || '-',
              motherJob: item['อาชีพมารดา'] || '-',
              guardianName: item['ผู้ปกครอง'] || '-',
              approxIncome: '20,000 บาท/เดือน',
            },
            part3: {
              gpa: parseFloat(item['GPA']) || 3.5,
              strengths: 'มีความตั้งใจเรียนดี',
              developmentAreas: 'ฝึกเพิ่มเติม',
            },
            part4: {
              responsibility: 'ดีเยี่ยม',
              discipline: 'ดีเยี่ยม',
              socialSkills: 'ดี',
              healthEmotion: 'ปกติ',
            },
            part5: {
              problemFound: 'ไม่มี',
              supportPlan: 'ส่งเสริมการเรียนรู้',
              followUpResult: 'ติดตามผลต่อเนื่อง',
            },
          }));

          const merged = [...students, ...importedStudents];
          StorageService.saveStudents(merged);
          setStudents(merged);
          showAlert('สำเร็จ', `นำเข้าข้อมูลนักเรียนจำนวน ${importedStudents.length} คน เรียบร้อยแล้ว`, 'success');
        }
      } catch (err) {
        console.error(err);
        showAlert('ข้อผิดพลาด', 'ไม่สามารถอ่านไฟล์ Excel ได้ กรุณาตรวจสอบรูปแบบไฟล์', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportData = filteredStudents.map((s) => ({
      เลขที่: s.part1.studentNumber,
      เลขประจำตัว: s.part1.studentCode,
      เลขประชาชน: s.part1.citizenId,
      คำนำหน้า: s.part1.prefix,
      ชื่อ: s.part1.firstName,
      นามสกุล: s.part1.lastName,
      ชั้น: s.part1.className,
      วันเกิด: s.part1.birthDate,
      เบอร์ผู้ปกครอง: s.part1.parentPhone,
      GPA: s.part3.gpa,
      สถานะ: s.part1.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลนักเรียน');
    XLSX.writeFile(wb, `ข้อมูลนักเรียน_SSIS_${filterClass}.xlsx`);
    showToast('ส่งออกไฟล์ Excel เรียบร้อยแล้ว', 'success');
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchClass = filterClass === 'ทั้งหมด' || s.part1.className === filterClass;
    const matchQuery =
      s.part1.firstName.includes(searchQuery) ||
      s.part1.lastName.includes(searchQuery) ||
      s.part1.studentCode.includes(searchQuery);
    return matchClass && matchQuery;
  });

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
              <GraduationCap className="w-6 h-6 text-emerald-700" />
              3. ระบบข้อมูลนักเรียน (5 ส่วนแบบครอบคลุม)
            </h2>
            <p className="text-xs text-slate-600">ประวัติและข้อมูลสารสนเทศนักเรียน โรงเรียนอนุบาลสุธิชา</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Import button */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-lg border border-black shadow cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>อัพโหลด Excel (.xlsx, .csv)</span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>เพิ่มนักเรียนใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 p-3 rounded-xl border-2 border-black">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-emerald-900 whitespace-nowrap">กรองตามห้องเรียน:</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-xs py-1.5 px-3 border border-black rounded-lg bg-white font-bold text-slate-900 w-full sm:w-auto"
          >
            <option value="ทั้งหมด">แสดงทั้งหมดทุกชั้นเรียน ({students.length} คน)</option>
            {ALL_CLASSES.map((c) => (
              <option key={c} value={c}>
                ชั้น {c}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-black bg-white"
            placeholder="ค้นหาชื่อ, นามสกุล, เลขประจำตัว..."
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black text-center">เลขที่</th>
                <th className="p-3 border border-black">รูป</th>
                <th className="p-3 border border-black">เลขประจำตัว</th>
                <th className="p-3 border border-black">ชื่อ-นามสกุล</th>
                <th className="p-3 border border-black text-center">ชั้นเรียน</th>
                <th className="p-3 border border-black text-center">อายุ</th>
                <th className="p-3 border border-black text-center">GPA</th>
                <th className="p-3 border border-black text-center">สถานะ</th>
                <th className="p-3 border border-black">เบอร์โทรผู้ปกครอง</th>
                <th className="p-3 border border-black text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-xs text-slate-500 italic">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                    <td className="p-3 border border-black text-center font-bold">{st.part1.studentNumber}</td>
                    <td className="p-2 border border-black text-center">
                      <img
                        src={st.part1.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'}
                        alt="รูปนักเรียน"
                        className="w-8 h-8 rounded-full border border-black object-cover mx-auto"
                      />
                    </td>
                    <td className="p-3 border border-black font-mono font-bold text-emerald-900">
                      {st.part1.studentCode}
                    </td>
                    <td className="p-3 border border-black font-medium">
                      {st.part1.prefix} {st.part1.firstName} {st.part1.lastName}
                    </td>
                    <td className="p-3 border border-black text-center font-bold text-amber-900">
                      {st.part1.className}
                    </td>
                    <td className="p-3 border border-black text-center">{calculateAge(st.part1.birthDate)} ปี</td>
                    <td className="p-3 border border-black text-center font-bold text-emerald-800">
                      {st.part3.gpa.toFixed(2)}
                    </td>
                    <td className="p-3 border border-black text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-400">
                        {st.part1.status}
                      </span>
                    </td>
                    <td className="p-3 border border-black text-slate-700">{st.part1.parentPhone}</td>
                    <td className="p-3 border border-black text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded border border-black shadow-xs"
                          title="ดู/แก้ไข 5 ส่วน"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(st)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded border border-black shadow-xs"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabbed 5-Part Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-4 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold text-amber-200">
                    {editingStudent ? `ข้อมูลนักเรียน: ${prefix} ${firstName} ${lastName}` : 'เพิ่มข้อมูลนักเรียนใหม่'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    ระบุข้อมูลรายละเอียดทั้ง 5 ส่วน (วิชาการ & ประวัตินักเรียน)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 rounded border border-emerald-600 text-xs text-white"
              >
                ปิด
              </button>
            </div>

            {/* Tab Selector */}
            <div className="bg-emerald-100 p-2 border-b border-black flex flex-wrap gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('part1')}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-colors ${
                  activeTab === 'part1'
                    ? 'bg-emerald-900 text-amber-200 border-black'
                    : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
                }`}
              >
                ส่วนที่ 1: ข้อมูลทั่วไป ({isAdmin ? 'Admin แก้ไขได้' : 'ครูห้ามแก้ไข'})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('part2')}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-colors ${
                  activeTab === 'part2'
                    ? 'bg-emerald-900 text-amber-200 border-black'
                    : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
                }`}
              >
                ส่วนที่ 2: ข้อมูลครอบครัว
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('part3')}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-colors ${
                  activeTab === 'part3'
                    ? 'bg-emerald-900 text-amber-200 border-black'
                    : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
                }`}
              >
                ส่วนที่ 3: ด้านการเรียน (GPA)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('part4')}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-colors ${
                  activeTab === 'part4'
                    ? 'bg-emerald-900 text-amber-200 border-black'
                    : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
                }`}
              >
                ส่วนที่ 4: พฤติกรรม & คุณลักษณะ
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('part5')}
                className={`px-3 py-1.5 font-bold rounded-lg border transition-colors ${
                  activeTab === 'part5'
                    ? 'bg-emerald-900 text-amber-200 border-black'
                    : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
                }`}
              >
                ส่วนที่ 5: การช่วยเหลือ
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Photo Header Frame */}
              <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl border-2 border-black max-w-xs mx-auto">
                <div className="w-24 h-24 rounded-full border-2 border-black overflow-hidden bg-white mb-2 relative shadow-md">
                  <img
                    src={photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'}
                    alt="รูปนักเรียน"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full space-y-1 text-center">
                  <label className="block text-[10px] font-bold text-slate-700">
                    อัปโหลดรูปภาพนักเรียน:
                  </label>
                  <label className="inline-block px-3 py-1 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded border border-black cursor-pointer shadow-xs transition-colors">
                    <span>📁 เลือกรูปจากเครื่อง</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              setPhotoUrl(evt.target.result as string);
                              showToast('อัปโหลดรูปภาพสำเร็จ', 'success');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full text-xs text-center mt-1"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* PART 1 */}
              {activeTab === 'part1' && (
                <div className="space-y-3">
                  {!isAdmin && (
                    <div className="p-2.5 bg-amber-100 border border-amber-400 rounded-lg text-amber-900 text-xs font-bold">
                      ⚠️ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขส่วนที่ 1 ข้อมูลทั่วไปได้
                    </div>
                  )}
                  <fieldset disabled={!isAdmin} className="space-y-3 disabled:opacity-75">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">เลขที่ในห้องเรียน</label>
                        <input
                          type="number"
                          value={number}
                          onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                          className="w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">เลขประจำตัวนักเรียน</label>
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">เลขประจำตัวประชาชน</label>
                        <input
                          type="text"
                          value={citizenId}
                          onChange={(e) => setCitizenId(e.target.value)}
                          className="w-full text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">คำนำหน้า</label>
                        <select
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value as any)}
                          className="w-full text-xs bg-white"
                        >
                          <option value="เด็กชาย">เด็กชาย</option>
                          <option value="เด็กหญิง">เด็กหญิง</option>
                          <option value="นาย">นาย</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ชื่อ*</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">นามสกุล*</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">ชั้น / ห้อง</label>
                        <select
                          value={className}
                          onChange={(e) => setClassName(e.target.value as SchoolClass)}
                          className="w-full text-xs bg-white font-bold text-emerald-900"
                        >
                          {ALL_CLASSES.map((c) => (
                            <option key={c} value={c}>
                              ชั้น {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">วันเดือนปีเกิด</label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">คำนวณอายุอัตโนมัติ</label>
                        <input
                          type="text"
                          value={`${calculateAge(birthDate)} ปี`}
                          readOnly
                          className="w-full text-xs bg-slate-100 font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">สถานะในชั้นเรียน</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="w-full text-xs bg-white"
                        >
                          <option value="กำลังศึกษา">กำลังศึกษา</option>
                          <option value="ย้ายออก">ย้ายออก</option>
                          <option value="พักการเรียน">พักการเรียน</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">ที่อยู่ตามทะเบียนบ้าน</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">เบอร์โทรศัพท์ผู้ปกครอง</label>
                        <input
                          type="text"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full text-xs font-bold"
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* PART 2 */}
              {activeTab === 'part2' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-900 border-b pb-1">
                    ส่วนที่ 2: ข้อมูลครอบครัว (ครูประจำชั้นสามารถแก้ไขได้)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">ชื่อ-นามสกุล บิดา</label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">อาชีพบิดา</label>
                      <input
                        type="text"
                        value={fatherJob}
                        onChange={(e) => setFatherJob(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">ชื่อ-นามสกุล มารดา</label>
                      <input
                        type="text"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">อาชีพมารดา</label>
                      <input
                        type="text"
                        value={motherJob}
                        onChange={(e) => setMotherJob(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">ชื่อผู้ปกครอง</label>
                      <input
                        type="text"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">รายได้ครอบครัวโดยประมาณ</label>
                      <input
                        type="text"
                        value={approxIncome}
                        onChange={(e) => setApproxIncome(e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PART 3 */}
              {activeTab === 'part3' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-900 border-b pb-1">
                    ส่วนที่ 3: ข้อมูลด้านการเรียน (ครูประจำชั้นสามารถแก้ไขได้)
                  </p>
                  <div>
                    <label className="block text-xs font-bold mb-1">ผลการเรียนเฉลี่ยสะสม (GPA)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.00"
                      value={gpa}
                      onChange={(e) => setGpa(parseFloat(e.target.value) || 0)}
                      className="w-32 text-xs font-bold text-emerald-900 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">จุดเด่นด้านการเรียน</label>
                    <textarea
                      rows={2}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">วิชาที่ควรได้รับการพัฒนา</label>
                    <textarea
                      rows={2}
                      value={developmentAreas}
                      onChange={(e) => setDevelopmentAreas(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              )}

              {/* PART 4 */}
              {activeTab === 'part4' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-900 border-b pb-1">
                    ส่วนที่ 4: พฤติกรรมและคุณลักษณะอันพึงประสงค์ (ครูประจำชั้นสามารถแก้ไขได้)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">ความรับผิดชอบ</label>
                      <select
                        value={responsibility}
                        onChange={(e) => setResponsibility(e.target.value as any)}
                        className="w-full text-xs bg-white"
                      >
                        <option value="ดีเยี่ยม">ดีเยี่ยม</option>
                        <option value="ดี">ดี</option>
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ปรับปรุง">ปรับปรุง</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">วินัยในตนเอง</label>
                      <select
                        value={discipline}
                        onChange={(e) => setDiscipline(e.target.value as any)}
                        className="w-full text-xs bg-white"
                      >
                        <option value="ดีเยี่ยม">ดีเยี่ยม</option>
                        <option value="ดี">ดี</option>
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ปรับปรุง">ปรับปรุง</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">การเข้าสังคมและทำกิจกรรมกลุ่ม</label>
                      <select
                        value={socialSkills}
                        onChange={(e) => setSocialSkills(e.target.value as any)}
                        className="w-full text-xs bg-white"
                      >
                        <option value="ดีเยี่ยม">ดีเยี่ยม</option>
                        <option value="ดี">ดี</option>
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ปรับปรุง">ปรับปรุง</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">สุขภาพร่างกาย และสภาวะอารมณ์</label>
                    <textarea
                      rows={2}
                      value={healthEmotion}
                      onChange={(e) => setHealthEmotion(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              )}

              {/* PART 5 */}
              {activeTab === 'part5' && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-900 border-b pb-1">
                    ส่วนที่ 5: การช่วยเหลือนักเรียน (ครูประจำชั้นสามารถแก้ไขได้)
                  </p>
                  <div>
                    <label className="block text-xs font-bold mb-1">ปัญหาที่พบ</label>
                    <textarea
                      rows={2}
                      value={problemFound}
                      onChange={(e) => setProblemFound(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">แนวทางการช่วยเหลือ</label>
                    <textarea
                      rows={2}
                      value={supportPlan}
                      onChange={(e) => setSupportPlan(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">การติดตามผลการช่วยเหลือ</label>
                    <textarea
                      rows={2}
                      value={followUpResult}
                      onChange={(e) => setFollowUpResult(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Footer action */}
              <div className="flex justify-end gap-2 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-bold rounded border border-black"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold rounded border border-black shadow"
                >
                  บันทึกข้อมูลนักเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

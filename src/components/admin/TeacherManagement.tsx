/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeacherStaff } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { UserCog, Plus, Edit, Trash2, ArrowLeft, Network, PhoneCall } from 'lucide-react';

interface TeacherManagementProps {
  onBack: () => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({ onBack }) => {
  const [teachers, setTeachers] = useState<TeacherStaff[]>(StorageService.getTeachers());
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherStaff | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ปฏิบัติงาน' | 'ลาพัก' | 'พ้นสภาพ'>('ปฏิบัติงาน');

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setCode(`T00${teachers.length + 1}`);
    setName('');
    setPosition('ครู คศ.1');
    setDepartment('กลุ่มสาระการเรียนรู้ภาษาไทย');
    setPhone('081-234-5678');
    setStatus('ปฏิบัติงาน');
    setShowModal(true);
  };

  const handleOpenEdit = (t: TeacherStaff) => {
    setEditingTeacher(t);
    setCode(t.code);
    setName(t.name);
    setPosition(t.position);
    setDepartment(t.department);
    setPhone(t.phone);
    setStatus(t.status);
    setShowModal(true);
  };

  const handleDelete = async (t: TeacherStaff) => {
    const confirm = await showConfirm(
      'ยืนยันการลบข้อมูลครู',
      `คุณต้องการลบข้อมูล "${t.name}" หรือไม่?`
    );
    if (confirm) {
      const updated = teachers.filter((item) => item.id !== t.id);
      StorageService.saveTeachers(updated);
      setTeachers(updated);
      showToast('ลบข้อมูลครูเรียบร้อยแล้ว', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tData: TeacherStaff = {
      id: editingTeacher ? editingTeacher.id : 't_' + Date.now(),
      code: code.trim(),
      name: name.trim(),
      position: position.trim(),
      department: department.trim(),
      phone: phone.trim(),
      status,
    };

    let updated: TeacherStaff[];
    if (editingTeacher) {
      updated = teachers.map((t) => (t.id === editingTeacher.id ? tData : t));
      showToast('แก้ไขข้อมูลครูเรียบร้อย', 'success');
    } else {
      updated = [...teachers, tData];
      showToast('เพิ่มข้อมูลครูเรียบร้อย', 'success');
    }

    StorageService.saveTeachers(updated);
    setTeachers(updated);
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
              <UserCog className="w-6 h-6 text-emerald-700" />
              6. ระบบข้อมูลครูและบุคลากร (Teacher & Staff Roster)
            </h2>
            <p className="text-xs text-slate-600">จัดการประวัติครู และโครงสร้างองค์กรโรงเรียน</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOrgChart(!showOrgChart)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg border border-black shadow transition-colors"
          >
            <Network className="w-4 h-4" />
            <span>{showOrgChart ? 'ดูตารางรายการ' : 'ดูโครงสร้างองค์กร'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>เพิ่มบุคลากรใหม่</span>
          </button>
        </div>
      </div>

      {/* Org Chart Diagram View */}
      {showOrgChart ? (
        <div className="bg-white p-6 rounded-xl border-2 border-black shadow-lg space-y-6">
          <div className="text-center border-b pb-4">
            <h3 className="text-base font-bold text-emerald-950">แผนผังโครงสร้างองค์กร โรงเรียนอนุบาลสุธิชา</h3>
            <p className="text-xs text-slate-600">Suthicha School Organizational Structure</p>
          </div>

          {/* Top: Director */}
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-900 text-amber-200 rounded-xl border-2 border-black text-center shadow-md w-64">
              <span className="text-[10px] font-bold uppercase bg-amber-500 text-emerald-950 px-2 py-0.5 rounded">
                ผู้อำนวยการโรงเรียน
              </span>
              <h4 className="text-sm font-bold mt-2">ผอ.สุธิชา มั่งมี</h4>
              <p className="text-xs text-emerald-200 mt-0.5">โทร: 089-000-1111</p>
            </div>
          </div>

          <div className="w-0.5 h-6 bg-black mx-auto" />

          {/* Department Heads & Teachers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 rounded-xl border-2 border-black text-center space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 border-b border-black pb-1">
                สายชั้นปฐมวัย (อนุบาล)
              </h4>
              <div className="p-2 bg-white rounded border border-black text-xs font-medium">
                ครูอัมพร อนุบาลจิต (ครูปฐมวัยชำนาญการ)
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border-2 border-black text-center space-y-2">
              <h4 className="text-xs font-bold text-amber-900 border-b border-black pb-1">
                กลุ่มสาระภาษาไทย & สังคม
              </h4>
              <div className="p-2 bg-white rounded border border-black text-xs font-medium">
                ครูสมใจ ใจดี (ครูชำนาญการพิเศษ)
              </div>
              <div className="p-2 bg-white rounded border border-black text-xs font-medium">
                ครูเมธาวี ศรีตรัง (ภาษาต่างประเทศ)
              </div>
            </div>

            <div className="p-4 bg-sky-50 rounded-xl border-2 border-black text-center space-y-2">
              <h4 className="text-xs font-bold text-sky-900 border-b border-black pb-1">
                กลุ่มสาระคณิตศาสตร์ & วิทยาศาสตร์
              </h4>
              <div className="p-2 bg-white rounded border border-black text-xs font-medium">
                ครูวิภา รุ่งเรือง (คณิตศาสตร์)
              </div>
              <div className="p-2 bg-white rounded border border-black text-xs font-medium">
                ครูชัยพร สุขสวัสดิ์ (วิทยาศาสตร์)
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                  <th className="p-3 border border-black">ลำดับ</th>
                  <th className="p-3 border border-black">รหัสบุคลากร</th>
                  <th className="p-3 border border-black">ชื่อ-นามสกุล</th>
                  <th className="p-3 border border-black">ตำแหน่ง</th>
                  <th className="p-3 border border-black">กลุ่มสาระ / สายชั้น</th>
                  <th className="p-3 border border-black">เบอร์โทรศัพท์</th>
                  <th className="p-3 border border-black text-center">สถานะ</th>
                  <th className="p-3 border border-black text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                    <td className="p-3 border border-black text-center font-bold">{idx + 1}</td>
                    <td className="p-3 border border-black font-mono font-bold text-emerald-900">{t.code}</td>
                    <td className="p-3 border border-black font-medium">{t.name}</td>
                    <td className="p-3 border border-black text-slate-800">{t.position}</td>
                    <td className="p-3 border border-black text-emerald-950 font-semibold">{t.department}</td>
                    <td className="p-3 border border-black">
                      <a href={`tel:${t.phone}`} className="text-emerald-800 font-bold underline flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" />
                        <span>{t.phone}</span>
                      </a>
                    </td>
                    <td className="p-3 border border-black text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-400">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 border border-black text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded border border-black shadow-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded border border-black shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-black">
              {editingTeacher ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">รหัสบุคลากร</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ชื่อ-นามสกุล*</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">กลุ่มสาระการเรียนรู้</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">สถานะ</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs bg-white"
                  >
                    <option value="ปฏิบัติงาน">ปฏิบัติงาน</option>
                    <option value="ลาพัก">ลาพัก</option>
                    <option value="พ้นสภาพ">พ้นสภาพ</option>
                  </select>
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
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole, ALL_CLASSES, SchoolClass } from '../../types';
import { StorageService } from '../../services/storage';
import { showAlert, showConfirm, showToast } from '../../utils/sweetalert';
import { UserPlus, Edit, Trash2, ShieldCheck, ArrowLeft } from 'lucide-react';

interface UserManagementProps {
  onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roles, setRoles] = useState<UserRole[]>(['teacher']);
  const [assignedClass, setAssignedClass] = useState<SchoolClass>('ป.1/1');
  const [phone, setPhone] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRoles(['teacher']);
    setAssignedClass('ป.1/1');
    setPhone('');
    setShowModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password || '');
    setFullName(u.fullName);
    setRoles(u.roles);
    setAssignedClass((u.assignedClass as SchoolClass) || 'ป.1/1');
    setPhone(u.phone || '');
    setShowModal(true);
  };

  const handleDelete = async (u: User) => {
    if (u.username === 'admin') {
      showAlert('แจ้งเตือน', 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (admin) ได้', 'warning');
      return;
    }
    const confirm = await showConfirm(
      'ยืนยันการลบ',
      `คุณต้องการลบผู้ใช้งาน "${u.fullName}" หรือไม่?`
    );
    if (confirm) {
      const updated = users.filter((item) => item.id !== u.id);
      StorageService.saveUsers(updated);
      setUsers(updated);
      showToast('ลบผู้ใช้งานเรียบร้อยแล้ว', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      showAlert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน', 'warning');
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: username.trim(),
              password: password.trim(),
              fullName: fullName.trim(),
              roles,
              assignedClass: roles.includes('homeroom') ? assignedClass : undefined,
              phone: phone.trim(),
            }
          : u
      );
      StorageService.saveUsers(updated);
      setUsers(updated);
      showToast('แก้ไขข้อมูลผู้ใช้งานเรียบร้อย', 'success');
    } else {
      const newUser: User = {
        id: 'u_' + Date.now(),
        username: username.trim(),
        password: password.trim() || '1234',
        fullName: fullName.trim(),
        roles,
        assignedClass: roles.includes('homeroom') ? assignedClass : undefined,
        phone: phone.trim(),
      };
      const updated = [...users, newUser];
      StorageService.saveUsers(updated);
      setUsers(updated);
      showToast('เพิ่มผู้ใช้งานใหม่เรียบร้อย', 'success');
    }
    setShowModal(false);
  };

  const toggleRole = (r: UserRole) => {
    if (roles.includes(r)) {
      setRoles(roles.filter((item) => item !== r));
    } else {
      setRoles([...roles, r]);
    }
  };

  return (
    <div className="space-y-6 font-['Sarabun'] pb-12">
      {/* Top Action & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border-2 border-black shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg border border-black transition-colors"
            title="ย้อนกลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              1. ระบบจัดการผู้ใช้งาน (User Management)
            </h2>
            <p className="text-xs text-slate-600">กำหนดสิทธิ์และบัญชีเข้าใช้งานระบบ SSIS</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-emerald-900 text-amber-200 border-b-2 border-black">
                <th className="p-3 border border-black">ลำดับ</th>
                <th className="p-3 border border-black">ชื่อผู้ใช้งาน (Username)</th>
                <th className="p-3 border border-black">ชื่อ-นามสกุล</th>
                <th className="p-3 border border-black">สิทธิ์ในระบบ (Roles)</th>
                <th className="p-3 border border-black">ชั้นประจำ (ถ้ามี)</th>
                <th className="p-3 border border-black">เบอร์โทรศัพท์</th>
                <th className="p-3 border border-black text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id} className="hover:bg-amber-50/50 border-b border-slate-200">
                  <td className="p-3 border border-black text-center font-bold">{index + 1}</td>
                  <td className="p-3 border border-black font-mono font-bold text-emerald-900">{u.username}</td>
                  <td className="p-3 border border-black font-medium">{u.fullName}</td>
                  <td className="p-3 border border-black">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            r === 'admin'
                              ? 'bg-purple-100 text-purple-900 border-purple-400'
                              : r === 'homeroom'
                              ? 'bg-amber-100 text-amber-900 border-amber-400'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                          }`}
                        >
                          {r === 'admin'
                            ? 'ผู้ดูแลระบบ'
                            : r === 'homeroom'
                            ? 'ครูประจำชั้น'
                            : r === 'teacher'
                            ? 'ครูผู้สอน'
                            : r === 'director'
                            ? 'ผอ.'
                            : r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 border border-black font-bold text-emerald-800">{u.assignedClass || '-'}</td>
                  <td className="p-3 border border-black">{u.phone || '-'}</td>
                  <td className="p-3 border border-black text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded border border-black shadow-xs"
                        title="แก้ไข"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded border border-black shadow-xs"
                        title="ลบ"
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

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-emerald-950 pb-2 border-b border-black">
              {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">ชื่อผู้ใช้งาน (Username)*</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">รหัสผ่าน (Password)*</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">ชื่อ-นามสกุล*</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">กำหนดสิทธิ์เข้าใช้งาน (เลือกได้หลายตัวเลือก)</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'admin', label: 'ผู้ดูแลระบบ (Admin)' },
                    { id: 'teacher', label: 'ครูผู้สอน (Subject Teacher)' },
                    { id: 'homeroom', label: 'ครูประจำชั้น (Homeroom)' },
                    { id: 'director', label: 'ผอ. / ผู้บริหาร' },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 p-2 bg-white rounded border border-black cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={roles.includes(r.id as UserRole)}
                        onChange={() => toggleRole(r.id as UserRole)}
                        className="rounded accent-emerald-700"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {roles.includes('homeroom') && (
                <div>
                  <label className="block text-xs font-bold mb-1">ชั้นเรียนประจำชั้น (Homeroom Class)</label>
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
              )}

              <div>
                <label className="block text-xs font-bold mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs"
                  placeholder="08X-XXX-XXXX"
                />
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

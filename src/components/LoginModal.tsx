/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, User as UserIcon, LogIn, KeyRound } from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { showAlert, showToast } from '../utils/sweetalert';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminX');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const users = StorageService.getUsers();
    const found = users.find(
      (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
    );

    if (!found) {
      setErrorMsg('ไม่พบชื่อผู้ใช้งานนี้ในระบบ');
      return;
    }

    if (found.password && found.password !== password) {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง');
      return;
    }

    StorageService.setCurrentUser(found);
    showToast(`ยินดีต้อนรับ ${found.fullName}`, 'success');
    onLoginSuccess(found);
    onClose();
  };

  const handleQuickLogin = (usr: string, pwd: string) => {
    setUsername(usr);
    setPassword(pwd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Sarabun']">
      <div className="bg-[#fcfbf7] rounded-xl border-2 border-black shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK"
              alt="โลโก้"
              className="h-10 w-10 object-contain bg-white p-1 rounded border border-black shadow-sm"
            />
            <div>
              <h2 className="text-lg font-bold text-amber-200 leading-tight">เข้าสู่ระบบ SSIS</h2>
              <p className="text-xs text-emerald-200">โรงเรียนอนุบาลสุธิชา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-800 text-xs font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-black focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="ระบุ username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-black focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="ระบุรหัสผ่าน"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-sm font-bold rounded-lg border border-black shadow transition-all hover:scale-[1.01]"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบ</span>
          </button>

          {/* Quick login credentials helper */}
          <div className="pt-3 border-t border-slate-300">
            <p className="text-[11px] font-bold text-slate-600 mb-2 text-center">
              บัญชีทดสอบด่วน (Quick Test Accounts):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'adminX')}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg border border-emerald-400 font-semibold text-left"
              >
                🔑 Admin (ผู้ดูแล)
                <span className="block text-[10px] font-normal text-emerald-700">admin / adminX</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher1', '1234')}
                className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-400 font-semibold text-left"
              >
                👩‍🏫 ครูสมใจ (ป.1/1)
                <span className="block text-[10px] font-normal text-amber-700">teacher1 / 1234</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher2', '1234')}
                className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg border border-sky-400 font-semibold text-left"
              >
                👨‍🏫 ครูวิภา (ป.1/2)
                <span className="block text-[10px] font-normal text-sky-700">teacher2 / 1234</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('director', '1234')}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg border border-purple-400 font-semibold text-left"
              >
                👔 ผอ.สุธิชา
                <span className="block text-[10px] font-normal text-purple-700">director / 1234</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

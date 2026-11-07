/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogIn, LogOut, Menu, School, User as UserIcon, QrCode } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  activeView: string;
  onNavigateHome: () => void;
  onOpenStudentPortal: () => void;
  onOpenGASExporter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onToggleSidebar,
  activeView,
  onNavigateHome,
  onOpenStudentPortal,
  onOpenGASExporter,
}) => {
  return (
    <header className="bg-emerald-900 text-white shadow-md border-b-2 border-emerald-950 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Sidebar Toggle (if logged in) + School Logo & System Title */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-cream transition-colors border border-emerald-700"
              title="เมนูผู้ใช้งาน"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK"
              alt="โลโก้โรงเรียนอนุบาลสุธิชา"
              className="h-11 w-auto object-contain bg-white/90 p-1 rounded-lg border border-black shadow-sm group-hover:scale-105 transition-transform"
              onError={(e) => {
                // Fallback icon if Google Drive direct link needs alternative
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wide text-amber-100 flex items-center gap-1.5 leading-tight">
                สารสนเทศ SSIS
                <span className="hidden sm:inline text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded border border-amber-400/40 font-normal">
                  Suthicha School Information System
                </span>
              </h1>
              <p className="text-xs text-emerald-200">โรงเรียนอนุบาลสุธิชา</p>
            </div>
          </div>
        </div>

        {/* Right: Public Student QR Portal Button, Google Sheet Script Exporter & Login/User Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenStudentPortal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg border border-black shadow-sm transition-colors"
            title="เช็คคะแนนและตารางเรียนสำหรับนักเรียน/ผู้ปกครอง"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden md:inline">ผู้ปกครอง / นักเรียน</span>
          </button>

          <button
            onClick={onOpenGASExporter}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg border border-emerald-600 transition-colors"
            title="โค้ดสำหรับ Google Sheets ID: 139QHO7Ya5ttzJ07ZSD2-g2bbDG9qgYXVHT1GSl8Cu6k"
          >
            <School className="w-4 h-4 text-amber-300" />
            <span>Google Apps Script</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-emerald-800/80 px-3 py-1 rounded-lg border border-emerald-700">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-cream leading-tight">{currentUser.fullName}</p>
                <p className="text-[10px] text-amber-300">
                  {currentUser.roles.includes('admin')
                    ? 'ผู้ดูแลระบบ'
                    : currentUser.roles.includes('homeroom')
                    ? `ครูประจำชั้น ${currentUser.assignedClass || ''}`
                    : 'ครูผู้สอน'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs border border-black font-medium transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-1.5 rounded-lg border border-black shadow transition-all hover:scale-105 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

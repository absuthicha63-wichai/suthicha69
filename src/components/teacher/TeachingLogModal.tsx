/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeachingLog, SchoolClass, ALL_CLASSES, User } from '../../types';
import { StorageService } from '../../services/storage';
import { showToast } from '../../utils/sweetalert';
import { QrCode, Save, X, Clock, BookOpen, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TeachingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogSaved: () => void;
}

export const TeachingLogModal: React.FC<TeachingLogModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogSaved,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('08:50');
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [className, setClassName] = useState<SchoolClass>('ป.1/1');
  const [subjectName, setSubjectName] = useState('ภาษาไทย 1');
  const [teacherName, setTeacherName] = useState(currentUser?.fullName || 'ครูสมใจ ใจดี');
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState('');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newLog: TeachingLog = {
      id: 'log_' + Date.now(),
      date,
      time,
      periodNumber,
      className,
      subjectName,
      teacherName,
      topic: topic.trim(),
      note: note.trim(),
    };

    const existing = StorageService.getTeachingLogs();
    const updated = [newLog, ...existing];
    StorageService.saveTeachingLogs(updated);

    showToast(`บันทึกการเข้าสอน คาบที่ ${periodNumber} เรียบร้อยแล้ว`, 'success');
    onLogSaved();
    onClose();
  };

  const appUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Sarabun']">
      <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QrCode className="w-6 h-6 text-amber-300" />
            <div>
              <h3 className="text-base font-bold text-amber-200">ระบบบันทึกการเข้าสอน (Teaching Log)</h3>
              <p className="text-xs text-emerald-200">โรงเรียนอนุบาลสุธิชา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code toggle helper */}
        <div className="px-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded border border-amber-400"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-800" />
            <span>{showQR ? 'ซ่อน QR Code' : 'แสดง QR Code สแกนผ่านมือถือ'}</span>
          </button>
        </div>

        {showQR && (
          <div className="p-4 bg-white border-y border-black text-center space-y-2">
            <p className="text-xs font-bold text-slate-800">
              สแกน QR Code เพื่อเปิดหน้าบันทึกการเข้าสอนบนมือถือ:
            </p>
            <div className="flex justify-center p-2 bg-cream inline-block rounded-lg border border-black mx-auto">
              <QRCodeSVG value={appUrl} size={140} />
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">วันที่เข้าสอน</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">เวลาบันทึก</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">ชั่วโมงที่ / คาบที่</label>
              <select
                value={periodNumber}
                onChange={(e) => setPeriodNumber(parseInt(e.target.value) || 1)}
                className="w-full text-xs bg-white font-bold text-emerald-900"
              >
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <option key={p} value={p}>
                    คาบที่ {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ชั้น / ห้องเรียน</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value as SchoolClass)}
                className="w-full text-xs bg-white font-bold"
              >
                {ALL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    ชั้น {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">รายวิชา</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs font-semibold"
                placeholder="เช่น ภาษาไทย 1"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ครูผู้สอน</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">หัวข้อกิจกรรมการเรียนการสอน*</label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs"
              placeholder="ระบุเนื้อหา/หัวข้อที่สอนในคาบนี้..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">หมายเหตุเพิ่มเติม</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs"
              placeholder="บรรยากาศการเรียน การบ้าน..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-bold rounded border border-black"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold rounded border border-black shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>บันทึกการเข้าสอน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

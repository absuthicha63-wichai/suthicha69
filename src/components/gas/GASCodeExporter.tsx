/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, School, Code, FileCode, X, Server, Layout } from 'lucide-react';
import { showToast } from '../../utils/sweetalert';

interface GASCodeExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GASCodeExporter: React.FC<GASCodeExporterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend'>('backend');
  const [copiedBackend, setCopiedBackend] = useState(false);
  const [copiedFrontend, setCopiedFrontend] = useState(false);

  if (!isOpen) return null;

  // Complete Code.gs Backend Script
  const codeGsContent = `/**
 * @file Code.gs
 * @description Google Apps Script Backend Engine for SSIS (Suthicha School Information System)
 * 
 * Google Spreadsheet ID: 139QHO7Ya5ttzJ07ZSD2-g2bbDG9qgYXVHT1GSl8Cu6k
 * PDF Storage Folder ID: 1m3ynrGy2Qrx8cckawL0jBZ5NSOfTEkP4
 * Image Storage Folder ID: 13hy3j1w0bedjn-sk0U_dwsdCt1zKtano
 */

const SPREADSHEET_ID = "139QHO7Ya5ttzJ07ZSD2-g2bbDG9qgYXVHT1GSl8Cu6k";
const FOLDER_PDF_ID = "1m3ynrGy2Qrx8cckawL0jBZ5NSOfTEkP4";
const FOLDER_IMAGE_ID = "13hy3j1w0bedjn-sk0U_dwsdCt1zKtano";

function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('สารสนเทศ SSIS - โรงเรียนอนุบาลสุธิชา')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 1. Initialize & Verify Database Sheets with headers if missing
 */
function initDatabaseSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const schema = {
    "USERS": ["ID", "Username", "Password", "FullName", "Roles", "AssignedClass", "Phone"],
    "ACADEMIC_YEARS": ["ID", "Year", "Semester", "IsCurrent"],
    "STUDENTS": ["ID", "AcademicYear", "StudentNumber", "StudentCode", "CitizenID", "Prefix", "FirstName", "LastName", "ClassName", "BirthDate", "Status", "Address", "ParentPhone", "PhotoUrl", "JSON_Parts"],
    "TEACHERS": ["ID", "Code", "Name", "Position", "Department", "Phone", "Status"],
    "SUBJECTS": ["ID", "AcademicYear", "Semester", "Code", "Name", "Credits", "AssignedClass", "PeriodsPerWeek", "FormativeMax", "MidtermMax", "FinalMax"],
    "ASSIGNMENTS": ["ID", "AcademicYear", "Semester", "TeacherId", "TeacherName", "ClassName", "SubjectId", "SubjectCode", "SubjectName"],
    "SCHEDULES": ["ID", "AcademicYear", "Semester", "ClassName", "Day", "PeriodNumber", "TimeRange", "SubjectCode", "SubjectName", "TeacherName"],
    "ATTENDANCE": ["ID", "AcademicYear", "Semester", "Date", "ClassName", "StudentCode", "StudentName", "Status", "Note", "RecordedBy"],
    "BMI": ["ID", "AcademicYear", "Date", "ClassName", "StudentName", "WeightKg", "HeightCm", "BMI", "StatusText", "Note", "Homeroom1", "Homeroom2"],
    "TEACHING_LOGS": ["ID", "Date", "Time", "PeriodNumber", "ClassName", "SubjectName", "TeacherName", "Topic", "Note"]
  };

  Object.keys(schema).forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, schema[sheetName].length).setValues([schema[sheetName]]);
      sheet.getRange(1, 1, 1, schema[sheetName].length)
        .setFontWeight("bold")
        .setBackground("#166534")
        .setFontColor("#ffffff");
    }
  });

  return { success: true, message: "สร้างหัวตารางใน Google Sheets สำเร็จเรียบร้อยแล้ว" };
}

/**
 * 2. Upload Image to Google Drive Folder (Folder_impge ID: 13hy3j1w0bedjn-sk0U_dwsdCt1zKtano)
 * Format URL: https://lh3.googleusercontent.com/d/{FILE_ID}
 */
function uploadImageToDrive(base64Data, fileName) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_IMAGE_ID);
    const contentType = base64Data.substring(5, base64Data.indexOf(';'));
    const bytes = Utilities.base64Decode(base64Data.substr(base64Data.indexOf('base64,') + 7));
    const blob = Utilities.newBlob(bytes, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const publicUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
    return { success: true, url: publicUrl, fileId: file.getId() };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Generic Read Data from Sheet
 */
function readDataFromSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(function(row) {
      let obj = {};
      headers.forEach(function(h, idx) {
        obj[h] = row[idx];
      });
      return obj;
    });
  } catch(e) {
    return [];
  }
}

/**
 * Generic Save JSON Array to Sheet
 */
function saveDataToSheet(sheetName, jsonArray) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      initDatabaseSheets();
      sheet = ss.getSheetByName(sheetName);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Clear data rows except header
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    
    if (!jsonArray || jsonArray.length === 0) return { success: true };
    
    const rows = jsonArray.map(function(item) {
      return headers.map(function(h) {
        return item[h] !== undefined ? item[h] : "";
      });
    });
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    return { success: true, count: rows.length };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// Data API Wrappers for google.script.run
function getStudentsData() { return readDataFromSheet("STUDENTS"); }
function saveStudentsData(data) { return saveDataToSheet("STUDENTS", data); }

function getTeachersData() { return readDataFromSheet("TEACHERS"); }
function saveTeachersData(data) { return saveDataToSheet("TEACHERS", data); }

function getSubjectsData() { return readDataFromSheet("SUBJECTS"); }
function saveSubjectsData(data) { return saveDataToSheet("SUBJECTS", data); }

function getSchedulesData() { return readDataFromSheet("SCHEDULES"); }
function saveSchedulesData(data) { return saveDataToSheet("SCHEDULES", data); }

function getAttendanceData() { return readDataFromSheet("ATTENDANCE"); }
function saveAttendanceData(data) { return saveDataToSheet("ATTENDANCE", data); }

function getBMIData() { return readDataFromSheet("BMI"); }
function saveBMIData(data) { return saveDataToSheet("BMI", data); }

function getTeachingLogsData() { return readDataFromSheet("TEACHING_LOGS"); }
function saveTeachingLogsData(data) { return saveDataToSheet("TEACHING_LOGS", data); }
`;

  // Complete index.html Frontend Template
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>สารสนเทศ SSIS - โรงเรียนอนุบาลสุธิชา</title>
  
  <!-- Fonts: Sarabun -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  
  <style>
    body {
      font-family: 'Sarabun', sans-serif;
      background-color: #fcfbf7;
      color: #1e293b;
    }
    input[type="text"], input[type="number"], input[type="date"], select, textarea {
      border: 1px solid #000000 !important;
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      background-color: #ffffff;
    }
    input:focus, select:focus, textarea:focus {
      outline: 2px solid #166534 !important;
    }
  </style>
</head>
<body class="bg-[#fcfbf7] antialiased min-h-screen">
  
  <!-- Header Bar -->
  <header className="bg-emerald-900 text-white p-4 border-b-2 border-black sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="https://lh3.googleusercontent.com/d/16l-Xet8wUcSxC8CJNeps6IMuve3Bj7uK" alt="โลโก้" class="h-10 w-auto p-0.5 bg-white rounded border border-black" />
        <div>
          <h1 class="text-lg font-bold text-amber-200">สารสนเทศ SSIS (Google Apps Script Frontend)</h1>
          <p class="text-xs text-emerald-200">โรงเรียนอนุบาลสุธิชา · Google Sheets ID: 139QHO7Ya5ttzJ07ZSD2-g2bbDG9qgYXVHT1GSl8Cu6k</p>
        </div>
      </div>
      
      <button onclick="initDatabaseSheetsOnGS()" class="px-3 py-1.5 bg-amber-400 text-emerald-950 font-bold text-xs rounded border border-black shadow hover:bg-amber-300">
        ⚡ ตรวจสอบและสร้างหัวตาราง Sheets
      </button>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-7xl mx-auto p-6 space-y-6">
    <div class="bg-white p-6 rounded-xl border-2 border-black shadow-md text-center space-y-3">
      <h2 class="text-xl font-bold text-emerald-900">ระบบสารสนเทศ SSIS บน Google Apps Script พร้อมทำงานแล้ว!</h2>
      <p class="text-xs text-slate-600">
        สคริปต์นี้เชื่อมต่อผ่าน <code class="bg-amber-100 px-1 font-bold">google.script.run</code> ไปยัง Google Sheets ID: <strong>139QHO7Ya5ttzJ07ZSD2-g2bbDG9qgYXVHT1GSl8Cu6k</strong>
      </p>
      
      <div class="pt-4 flex justify-center gap-3">
        <button onclick="loadStudentsFromGS()" class="px-4 py-2 bg-emerald-800 text-amber-200 font-bold text-xs rounded border border-black shadow">
          โหลดข้อมูลนักเรียนจาก Sheets
        </button>
        <button onclick="loadAttendanceFromGS()" class="px-4 py-2 bg-sky-700 text-white font-bold text-xs rounded border border-black shadow">
          โหลดสถิติการมาเรียนจาก Sheets
        </button>
      </div>
    </div>
    
    <div id="outputContainer" class="bg-white p-6 rounded-xl border-2 border-black shadow-md min-h-64">
      <p class="text-xs text-slate-500 italic text-center">กดปุ่มทดสอบด้านบนเพื่อเรียกดูข้อมูลเรียลไทม์จาก Google Sheets...</p>
    </div>
  </main>

  <script>
    function initDatabaseSheetsOnGS() {
      Swal.fire({ title: 'กำลังตรวจสอบ...', text: 'กำลังเชื่อมต่อ Google Sheets', didOpen: () => Swal.showLoading() });
      google.script.run
        .withSuccessHandler(function(res) {
          Swal.fire('สำเร็จ', res.message, 'success');
        })
        .withFailureHandler(function(err) {
          Swal.fire('ข้อผิดพลาด', err.toString(), 'error');
        })
        .initDatabaseSheets();
    }

    function loadStudentsFromGS() {
      document.getElementById('outputContainer').innerHTML = '<p class="text-xs text-center font-bold text-emerald-800">กำลังโหลดข้อมูลนักเรียน...</p>';
      google.script.run
        .withSuccessHandler(function(data) {
          let html = '<h3 class="text-sm font-bold mb-3 text-emerald-900">รายชื่อนักเรียนจาก Google Sheets (' + data.length + ' คน):</h3>';
          html += '<table class="w-full text-xs border-collapse"><thead><tr class="bg-emerald-900 text-amber-200"><th class="p-2 border border-black">เลขประจำตัว</th><th class="p-2 border border-black">ชื่อ-นามสกุล</th><th class="p-2 border border-black">ชั้น</th></tr></thead><tbody>';
          data.forEach(function(s) {
            html += '<tr className="border-b border-slate-200"><td class="p-2 border border-black font-mono">' + (s.StudentCode||'-') + '</td><td class="p-2 border border-black">' + (s.Prefix||'') + (s.FirstName||'') + ' ' + (s.LastName||'') + '</td><td class="p-2 border border-black text-center font-bold">' + (s.ClassName||'-') + '</td></tr>';
          });
          html += '</tbody></table>';
          document.getElementById('outputContainer').innerHTML = html;
        })
        .getStudentsData();
    }

    function loadAttendanceFromGS() {
      document.getElementById('outputContainer').innerHTML = '<p class="text-xs text-center font-bold text-sky-800">กำลังโหลดสถิติการมาเรียน...</p>';
      google.script.run
        .withSuccessHandler(function(data) {
          Swal.fire('โหลดสำเร็จ', 'พบรายการเช็คชื่อจำนวน ' + data.length + ' รายการ', 'success');
        })
        .getAttendanceData();
    }
  </script>
</body>
</html>
`;

  const handleCopyBackend = () => {
    navigator.clipboard.writeText(codeGsContent);
    setCopiedBackend(true);
    showToast('คัดลอกโค้ด Backend (Code.gs) เรียบร้อยแล้ว', 'success');
    setTimeout(() => setCopiedBackend(false), 2500);
  };

  const handleCopyFrontend = () => {
    navigator.clipboard.writeText(indexHtmlContent);
    setCopiedFrontend(true);
    showToast('คัดลอกโค้ด Frontend (index.html) เรียบร้อยแล้ว', 'success');
    setTimeout(() => setCopiedFrontend(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs font-['Sarabun']">
      <div className="bg-[#fcfbf7] rounded-xl border-2 border-black max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <School className="w-7 h-7 text-amber-300" />
            <div>
              <h3 className="text-base font-bold text-amber-200">
                โค้ด Google Apps Script (Backend Code.gs & Frontend index.html)
              </h3>
              <p className="text-xs text-emerald-200">
                Google Sheets ID: <strong>139QHO7Ya5ttzJ07ZSD2-g2bbDG9qgYXVHT1GSl8Cu6k</strong> | Drive Folder PDF: <strong>1m3ynrGy2Qrx8cckawL0jBZ5NSOfTEkP4</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-emerald-100 p-2 border-b border-black flex gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('backend')}
            className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'backend'
                ? 'bg-emerald-900 text-amber-200 border-black shadow'
                : 'bg-white text-slate-800 border-black hover:bg-emerald-50'
            }`}
          >
            <Server className="w-4 h-4 text-amber-300" />
            <span>1. โค้ด Backend (Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('frontend')}
            className={`flex-1 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'frontend'
                ? 'bg-emerald-900 text-amber-200 border-black shadow'
                : 'bg-white text-slate-800 border-transparent hover:bg-emerald-50'
            }`}
          >
            <Layout className="w-4 h-4 text-amber-300" />
            <span>2. โค้ด Frontend (index.html + google.script.run)</span>
          </button>
        </div>

        {/* Code Content Container */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs">
          <pre>{activeTab === 'backend' ? codeGsContent : indexHtmlContent}</pre>
        </div>

        {/* Modal Footer Toolbar */}
        <div className="p-4 bg-emerald-50 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-700">
            {activeTab === 'backend' ? (
              <span>* นำไปวางในไฟล์ <strong>Code.gs</strong> บนระบบ Google Apps Script Editor</span>
            ) : (
              <span>* นำไปวางในไฟล์ <strong>index.html</strong> บนระบบ Google Apps Script Editor</span>
            )}
          </div>

          <div className="flex gap-2">
            {activeTab === 'backend' ? (
              <button
                onClick={handleCopyBackend}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
              >
                {copiedBackend ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBackend ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด Backend (Code.gs)'}</span>
              </button>
            ) : (
              <button
                onClick={handleCopyFrontend}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-lg border border-black shadow transition-all hover:scale-105"
              >
                {copiedFrontend ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFrontend ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด Frontend (index.html)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

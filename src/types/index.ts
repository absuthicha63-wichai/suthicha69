/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'homeroom' | 'director' | 'guest';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  roles: UserRole[]; // e.g. ['admin', 'teacher', 'homeroom']
  assignedClass?: string; // e.g. 'ป.1/1'
  phone?: string;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g. '2569'
  semester: '1' | '2';
  isCurrent: boolean;
}

export type SchoolClass =
  | 'ตอ.1/1'
  | 'อ.1/1'
  | 'อ.1/2'
  | 'อ.2/1'
  | 'อ.2/2'
  | 'อ.3/1'
  | 'อ.3/2'
  | 'ป.1/1'
  | 'ป.1/2'
  | 'ป.2/1'
  | 'ป.2/2'
  | 'ป.3/1'
  | 'ป.3/2'
  | 'ป.4/1'
  | 'ป.4/2'
  | 'ป.5/1'
  | 'ป.5/2'
  | 'ป.6/1'
  | 'ป.6/2';

export const ALL_CLASSES: SchoolClass[] = [
  'ตอ.1/1',
  'อ.1/1',
  'อ.1/2',
  'อ.2/1',
  'อ.2/2',
  'อ.3/1',
  'อ.3/2',
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

export interface StudentPart1General {
  studentNumber: number;
  studentCode: string; // เลขประจำตัวนักเรียน
  citizenId: string; // เลขประจำตัวประชาชน
  prefix: 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว';
  firstName: string;
  lastName: string;
  className: SchoolClass;
  birthDate: string; // YYYY-MM-DD
  status: 'กำลังศึกษา' | 'ย้ายออก' | 'พักการเรียน';
  address: string;
  parentPhone: string;
  photoUrl?: string;
}

export interface StudentPart2Family {
  fatherName: string;
  fatherJob: string;
  motherName: string;
  motherJob: string;
  guardianName: string;
  approxIncome: string;
}

export interface StudentPart3Academic {
  gpa: number;
  strengths: string;
  developmentAreas: string;
}

export interface StudentPart4Behavior {
  responsibility: 'ดีเยี่ยม' | 'ดี' | 'ผ่าน' | 'ปรับปรุง';
  discipline: 'ดีเยี่ยม' | 'ดี' | 'ผ่าน' | 'ปรับปรุง';
  socialSkills: 'ดีเยี่ยม' | 'ดี' | 'ผ่าน' | 'ปรับปรุง';
  healthEmotion: string;
}

export interface StudentPart5Support {
  problemFound: string;
  supportPlan: string;
  followUpResult: string;
}

export interface Student {
  id: string;
  academicYear: string; // e.g. '2569'
  part1: StudentPart1General;
  part2: StudentPart2Family;
  part3: StudentPart3Academic;
  part4: StudentPart4Behavior;
  part5: StudentPart5Support;
}

export interface TeacherStaff {
  id: string;
  code: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  status: 'ปฏิบัติงาน' | 'ลาพัก' | 'พ้นสภาพ';
}

export interface Subject {
  id: string;
  academicYear: string;
  semester: '1' | '2';
  code: string; // e.g. 'ท11101'
  name: string; // e.g. 'ภาษาไทย 1'
  credits: number;
  assignedClass?: SchoolClass;
  periodsPerWeek: number;
  teacherId?: string;
  teacherName?: string;
  color?: string; // color tag for timetable
  scoreRatio: {
    formativeMax: number;
    midtermMax: number;
    finalMax: number;
  };
}

export interface TeacherAssignment {
  id: string;
  academicYear: string;
  semester: '1' | '2';
  teacherId: string;
  teacherName: string;
  className: SchoolClass;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  isHomeroom1?: boolean;
  isHomeroom2?: boolean;
  canEditPP5?: boolean;
}

export interface ScheduleSlot {
  id: string;
  academicYear: string;
  semester: '1' | '2';
  className: SchoolClass;
  day: 'จันทร์' | 'อังคาร' | 'พุธ' | 'พฤหัสบดี' | 'ศุกร์';
  periodNumber: number; // 1 to 6
  timeRange: string; // e.g. '08:45 - 09:45'
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber?: string;
}

export type AttendanceStatus = 'มา' | 'ลา' | 'ป่วย' | 'ขาด';

export interface AttendanceRecord {
  id: string;
  academicYear: string;
  semester: '1' | '2';
  date: string; // YYYY-MM-DD
  className: SchoolClass;
  studentId: string;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  recordedByTeacher: string;
}

export interface ScoreItem {
  id: string;
  title: string; // e.g. "ใบงานที่ 1"
  maxScore: number;
}

export interface StudentScoreDetail {
  studentId: string;
  itemScores: Record<string, number>; // itemId -> score
  midtermScore: number;
  finalScore: number;
}

export interface GradeSheet {
  id: string;
  academicYear: string;
  semester: '1' | '2';
  subjectId: string;
  subjectCode: string;
  className: SchoolClass;
  items: ScoreItem[];
  studentScores: Record<string, StudentScoreDetail>; // studentId -> detail
}

export interface BMIRecord {
  id: string;
  academicYear: string;
  date: string; // YYYY-MM-DD
  className: SchoolClass;
  studentId: string;
  studentName: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  statusText: 'น้ำหนักน้อย' | 'ปกติ' | 'น้ำหนักเกิน' | 'อ้วนระดับ 1' | 'อ้วนระดับ 2';
  note?: string;
  homeroom1Name: string;
  homeroom2Name: string;
}

export interface TeachingLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  periodNumber: number;
  className: SchoolClass;
  subjectName: string;
  teacherName: string;
  topic: string;
  note?: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  AcademicYear,
  Student,
  TeacherStaff,
  Subject,
  TeacherAssignment,
  ScheduleSlot,
  AttendanceRecord,
  BMIRecord,
  TeachingLog,
  GradeSheet,
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE,
  INITIAL_BMI,
  INITIAL_TEACHING_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'ssis_users',
  CURRENT_USER: 'ssis_current_user',
  ACADEMIC_YEARS: 'ssis_academic_years',
  STUDENTS: 'ssis_students',
  TEACHERS: 'ssis_teachers',
  SUBJECTS: 'ssis_subjects',
  ASSIGNMENTS: 'ssis_assignments',
  SCHEDULES: 'ssis_schedules',
  ATTENDANCE: 'ssis_attendance',
  BMI: 'ssis_bmi',
  TEACHING_LOGS: 'ssis_teaching_logs',
  GRADES: 'ssis_grades',
};

// Check if app is running inside Google Apps Script Web App environment
export const isGAS = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any)?.google?.script?.run;
};

// Helper for generic getItem
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading key ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Users
  getUsers: (): User[] => getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUsers: (users: User[]) => setStored(STORAGE_KEYS.USERS, users),

  getCurrentUser: (): User | null => getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => setStored(STORAGE_KEYS.CURRENT_USER, user),

  // Academic Years
  getAcademicYears: (): AcademicYear[] =>
    getStored<AcademicYear[]>(STORAGE_KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS),
  saveAcademicYears: (years: AcademicYear[]) => setStored(STORAGE_KEYS.ACADEMIC_YEARS, years),
  getCurrentAcademicYear: (): AcademicYear => {
    const years = StorageService.getAcademicYears();
    return years.find((y) => y.isCurrent) || years[0] || { id: 'ay1', year: '2569', semester: '1', isCurrent: true };
  },

  // Teachers
  getTeachers: (): TeacherStaff[] => getStored<TeacherStaff[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS),
  saveTeachers: (teachers: TeacherStaff[]) => setStored(STORAGE_KEYS.TEACHERS, teachers),

  // Students
  getStudents: (): Student[] => getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (students: Student[]) => setStored(STORAGE_KEYS.STUDENTS, students),

  // Subjects
  getSubjects: (): Subject[] => getStored<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS),
  saveSubjects: (subjects: Subject[]) => setStored(STORAGE_KEYS.SUBJECTS, subjects),

  // Teacher Assignments
  getAssignments: (): TeacherAssignment[] =>
    getStored<TeacherAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS),
  saveAssignments: (assignments: TeacherAssignment[]) => setStored(STORAGE_KEYS.ASSIGNMENTS, assignments),

  // Timetable Schedules
  getSchedules: (): ScheduleSlot[] => getStored<ScheduleSlot[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES),
  saveSchedules: (schedules: ScheduleSlot[]) => setStored(STORAGE_KEYS.SCHEDULES, schedules),

  // Attendance
  getAttendance: (): AttendanceRecord[] => getStored<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (records: AttendanceRecord[]) => setStored(STORAGE_KEYS.ATTENDANCE, records),

  // BMI
  getBMIRecords: (): BMIRecord[] => getStored<BMIRecord[]>(STORAGE_KEYS.BMI, INITIAL_BMI),
  saveBMIRecords: (records: BMIRecord[]) => setStored(STORAGE_KEYS.BMI, records),

  // Teaching Logs
  getTeachingLogs: (): TeachingLog[] => getStored<TeachingLog[]>(STORAGE_KEYS.TEACHING_LOGS, INITIAL_TEACHING_LOGS),
  saveTeachingLogs: (logs: TeachingLog[]) => setStored(STORAGE_KEYS.TEACHING_LOGS, logs),

  // Grades / PP5
  getGradeSheets: (): GradeSheet[] => getStored<GradeSheet[]>(STORAGE_KEYS.GRADES, []),
  saveGradeSheets: (sheets: GradeSheet[]) => setStored(STORAGE_KEYS.GRADES, sheets),

  // Reset to initial mock data
  resetAllData: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.BMI, JSON.stringify(INITIAL_BMI));
    localStorage.setItem(STORAGE_KEYS.TEACHING_LOGS, JSON.stringify(INITIAL_TEACHING_LOGS));
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));
  },
};

export interface Student {
  id: string;
  photoUrl: string;
  name: string;
  srNo: string;
  admissionNo: string;
  rollNo: string;
  class: string;
  section: string;
  classSec: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  contact: string;
  mobile: string;
  address: string;
  penNo: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  category: 'General' | 'OBC' | 'SC' | 'ST';
  house: 'Tagore' | 'Ashoka' | 'Shivaji' | 'Raman';
  transportOpted: boolean;
  busRoute?: string;
  status: 'Active' | 'Inactive';
  totalFee: number;
  paidFee: number;
  balanceFee: number;
}

import STUDENTS_1500 from "./students_1500.json";

export const MOCK_STUDENTS: Student[] = STUDENTS_1500 as Student[];

export const STAFF_ATTENDANCE_DATA = [
  { name: "Present", value: 61, percentage: "89.7%", color: "#10b981", count: 61 },
  { name: "On Leave", value: 4, percentage: "5.9%", color: "#0ea5e9", count: 4 },
  { name: "Half Day", value: 1, percentage: "1.5%", color: "#f59e0b", count: 1 },
  { name: "Absent", value: 2, percentage: "2.9%", color: "#f43f5e", count: 2 },
];


export const DASHBOARD_STATS = [
  {
    id: "students",
    title: "Students",
    count: "1924",
    icon: "Users",
    color: "#2ecc71",
    bgColor: "#2ecc71",
    hasExternalLink: true,
    href: "/search-student-advance",
  },
  {
    id: "sms-sent",
    title: "SMS SENT (SEP)",
    count: "2844",
    icon: "MessageSquare",
    color: "#e74c3c",
    bgColor: "#e74c3c",
    hasExternalLink: true,
    href: "/daily-sms-count",
  },
  {
    id: "new-admissions",
    title: "New Admissions",
    count: "592",
    icon: "UserPlus",
    color: "#f1c40f",
    bgColor: "#f1c40f",
    hasExternalLink: true,
    href: "/new-admissions",
  },
  {
    id: "birthdays",
    title: "Birthdays",
    count: "8",
    icon: "Gift",
    color: "#e84393",
    bgColor: "#e84393",
    hasExternalLink: true,
    href: "/list-birthday",
  },
  {
    id: "staff",
    title: "Staff",
    count: "68",
    icon: "User",
    color: "#5dade2",
    bgColor: "#5dade2",
    hasExternalLink: false,
    href: "/staffs",
  },
  {
    id: "hostel-students",
    title: "Hostel Students",
    count: "0",
    icon: "Home",
    color: "#48c9b0",
    bgColor: "#48c9b0",
    hasExternalLink: false,
  },
  {
    id: "day-schooling",
    title: "Day Schooling",
    count: "1924",
    icon: "BookOpen",
    color: "#5d6d7e",
    bgColor: "#5d6d7e",
    hasExternalLink: false,
  },
  {
    id: "transport-students",
    title: "Transport Students",
    count: "458",
    icon: "Bus",
    color: "#a569bd",
    bgColor: "#a569bd",
    hasExternalLink: false,
  },
];

// Exact Classwise Breakdown from Schoollog Screenshot (Images 2, 3, 4, 5)
export interface ClasswiseCountRow {
  standard: string;
  sectionName: string;
  boysCount: number;
  girlsCount: number;
  studentCount: number;
  smsActionTag: string;
}

export const CLASSWISE_STUDENT_COUNT: ClasswiseCountRow[] = [
  { standard: "1 ( 2 )", sectionName: "A, B", boysCount: 35, girlsCount: 17, studentCount: 52, smsActionTag: "SMS CREDS. [1-A, 1-B]" },
  { standard: "2 ( 2 )", sectionName: "A, B", boysCount: 45, girlsCount: 19, studentCount: 64, smsActionTag: "SMS CREDS. [2-A, 2-B]" },
  { standard: "3 ( 3 )", sectionName: "A, B, NO SECTION", boysCount: 27, girlsCount: 11, studentCount: 42, smsActionTag: "SMS CREDS. [3-A, 3-B, 3-NO SECTION]" },
  { standard: "4 ( 3 )", sectionName: "A, B, NO SECTION", boysCount: 39, girlsCount: 11, studentCount: 60, smsActionTag: "SMS CREDS. [4-A, 4-B, 4-NO SECTION]" },
  { standard: "5 ( 3 )", sectionName: "A, B, NO SECTION", boysCount: 53, girlsCount: 10, studentCount: 85, smsActionTag: "SMS CREDS. [5-A, 5-B, 5-NO SECTION]" },
  { standard: "LKG ( 1 )", sectionName: "A", boysCount: 9, girlsCount: 6, studentCount: 15, smsActionTag: "SMS CREDS. [LKG-A]" },
  { standard: "Nursery ( 1 )", sectionName: "A", boysCount: 0, girlsCount: 0, studentCount: 0, smsActionTag: "SMS CREDS. [NURSERY-A]" },
  { standard: "6 ( 4 )", sectionName: "A, B, C, NO SECTION", boysCount: 79, girlsCount: 17, studentCount: 132, smsActionTag: "SMS CREDS. [6-A, 6-B, 6-C, 6-NO SECTION]" },
  { standard: "7 ( 4 )", sectionName: "A, B, C, NO SECTION", boysCount: 80, girlsCount: 18, studentCount: 132, smsActionTag: "SMS CREDS. [7-A, 7-B, 7-C, 7-NO SECTION]" },
  { standard: "8 ( 5 )", sectionName: "A, B, C, D, NO SECTION", boysCount: 86, girlsCount: 10, studentCount: 142, smsActionTag: "SMS CREDS. [8-A, 8-B, 8-C, 8-D, 8-NO SECTION]" },
  { standard: "9 ( 6 )", sectionName: "A, B, C, D, E, NO SECTION", boysCount: 148, girlsCount: 35, studentCount: 238, smsActionTag: "SMS CREDS. [9-A, 9-B, 9-C, 9-D, 9-E, 9-NO SECTION]" },
  { standard: "10 ( 8 )", sectionName: "A, B, C, D, E, F, ALL, NO SECTION", boysCount: 181, girlsCount: 24, studentCount: 254, smsActionTag: "SMS CREDS. [10-A, 10-B, 10-C, 10-D, 10-E, 10-F, 10-ALL, 10-NO SECTION]" },
  { standard: "11 ( 9 )", sectionName: "MATHS, BIO A, BIO B, AGRICULTURE, ARTS A, ARTS B, ARTS C, ARTS D, NO SECTION", boysCount: 232, girlsCount: 36, studentCount: 319, smsActionTag: "SMS CREDS. [11-MATHS, 11-BIO A, 11-BIO B, 11-AGRICULTURE, 11-ARTS A, 11-ARTS B, 11-ARTS C, 11-ARTS D, 11-NO SECTION]" },
  { standard: "12 ( 9 )", sectionName: "MATHS, BIO A, BIO B, AGRICULTURE, ARTS A, ARTS B, ARTS C, ARTS D, NO SECTION", boysCount: 269, girlsCount: 43, studentCount: 362, smsActionTag: "SMS CREDS. [12-MATHS, 12-BIO A, 12-BIO B, 12-AGRICULTURE, 12-ARTS A, 12-ARTS B, 12-ARTS C, 12-ARTS D, 12-NO SECTION]" },
];

export const TOTAL_BOYS = 1303;
export const TOTAL_GIRLS = 264;
export const TOTAL_STUDENTS = 1924;

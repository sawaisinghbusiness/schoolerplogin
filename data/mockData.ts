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

export const MOCK_STUDENTS: Student[] = [
  {
    id: "STU-001",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Aarav Sharma",
    srNo: "SR-2024-001",
    admissionNo: "ADM-9102",
    rollNo: "12",
    class: "10th",
    section: "A",
    classSec: "10th - A",
    fatherName: "Rajesh Sharma",
    motherName: "Sunita Sharma",
    guardianName: "Rajesh Sharma",
    contact: "9876543210",
    mobile: "9876543210",
    address: "Plot 42, Civil Lines, Barmer, Rajasthan",
    penNo: "PEN-RJ-2024-819",
    gender: "Male",
    dob: "2009-04-12",
    category: "General",
    house: "Tagore",
    transportOpted: true,
    busRoute: "Route 3 (Station Road - Mandir)",
    status: "Active",
    totalFee: 42000,
    paidFee: 35000,
    balanceFee: 7000
  },
  {
    id: "STU-002",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    name: "Diya Rathore",
    srNo: "SR-2024-002",
    admissionNo: "ADM-9103",
    rollNo: "05",
    class: "9th",
    section: "B",
    classSec: "9th - B",
    fatherName: "Kalyan Singh Rathore",
    motherName: "Meenakshi Rathore",
    guardianName: "Kalyan Singh Rathore",
    contact: "9829012345",
    mobile: "9829012345",
    address: "Opp. Collectorate, Mahaveer Nagar, Barmer",
    penNo: "PEN-RJ-2024-820",
    gender: "Female",
    dob: "2010-08-25",
    category: "General",
    house: "Ashoka",
    transportOpted: false,
    status: "Active",
    totalFee: 38000,
    paidFee: 38000,
    balanceFee: 0
  },
  {
    id: "STU-003",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    name: "Vikram Choudhary",
    srNo: "SR-2023-114",
    admissionNo: "ADM-8451",
    rollNo: "21",
    class: "12th",
    section: "PCM",
    classSec: "12th - PCM",
    fatherName: "Hanuman Ram Choudhary",
    motherName: "Geeta Devi",
    guardianName: "Hanuman Ram Choudhary",
    contact: "9414156789",
    mobile: "9414156789",
    address: "Baldev Nagar, Near Ratan Singh Circle, Barmer",
    penNo: "PEN-RJ-2023-412",
    gender: "Male",
    dob: "2007-11-03",
    category: "OBC",
    house: "Shivaji",
    transportOpted: true,
    busRoute: "Route 1 (Baldev Nagar - School)",
    status: "Active",
    totalFee: 50000,
    paidFee: 40000,
    balanceFee: 10000
  },
  {
    id: "STU-004",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    name: "Ananya Meena",
    srNo: "SR-2024-045",
    admissionNo: "ADM-9210",
    rollNo: "03",
    class: "8th",
    section: "A",
    classSec: "8th - A",
    fatherName: "Ramesh Chand Meena",
    motherName: "Kamla Meena",
    guardianName: "Ramesh Chand Meena",
    contact: "9784321987",
    mobile: "9784321987",
    address: "Indira Colony, Lane 4, Barmer",
    penNo: "PEN-RJ-2024-954",
    gender: "Female",
    dob: "2011-02-14",
    category: "ST",
    house: "Raman",
    transportOpted: true,
    busRoute: "Route 2 (Indira Colony - Main Gate)",
    status: "Active",
    totalFee: 32000,
    paidFee: 20000,
    balanceFee: 12000
  },
  {
    id: "STU-005",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Karan Soni",
    srNo: "SR-2022-098",
    admissionNo: "ADM-7712",
    rollNo: "18",
    class: "11th",
    section: "Commerce",
    classSec: "11th - COMM",
    fatherName: "Mahesh Soni",
    motherName: "Rekha Soni",
    guardianName: "Mahesh Soni",
    contact: "9460112233",
    mobile: "9460112233",
    address: "Sonar Mohalla, Main Market, Barmer",
    penNo: "PEN-RJ-2022-301",
    gender: "Male",
    dob: "2008-06-19",
    category: "OBC",
    house: "Tagore",
    transportOpted: false,
    status: "Active",
    totalFee: 46000,
    paidFee: 46000,
    balanceFee: 0
  },
  {
    id: "STU-006",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    name: "Pooja Bhati",
    srNo: "SR-2024-110",
    admissionNo: "ADM-9345",
    rollNo: "27",
    class: "6th",
    section: "C",
    classSec: "6th - C",
    fatherName: "Om Prakash Bhati",
    motherName: "Santosh Bhati",
    guardianName: "Om Prakash Bhati",
    contact: "9602445566",
    mobile: "9602445566",
    address: "Nehru Nagar, Behind Stadium, Barmer",
    penNo: "PEN-RJ-2024-118",
    gender: "Female",
    dob: "2013-09-08",
    category: "SC",
    house: "Ashoka",
    transportOpted: true,
    busRoute: "Route 4 (Stadium - Bypass)",
    status: "Active",
    totalFee: 28000,
    paidFee: 15000,
    balanceFee: 13000
  },
  {
    id: "STU-007",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "Mohammad Farhan",
    srNo: "SR-2023-205",
    admissionNo: "ADM-8890",
    rollNo: "09",
    class: "7th",
    section: "B",
    classSec: "7th - B",
    fatherName: "Abdul Rahim",
    motherName: "Zarina Bano",
    guardianName: "Abdul Rahim",
    contact: "9166778899",
    mobile: "9166778899",
    address: "Kazi Para, Old City, Barmer",
    penNo: "PEN-RJ-2023-744",
    gender: "Male",
    dob: "2012-01-30",
    category: "General",
    house: "Shivaji",
    transportOpted: false,
    status: "Active",
    totalFee: 30000,
    paidFee: 30000,
    balanceFee: 0
  },
  {
    id: "STU-008",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    name: "Sneha Patel",
    srNo: "SR-2024-301",
    admissionNo: "ADM-9452",
    rollNo: "33",
    class: "10th",
    section: "B",
    classSec: "10th - B",
    fatherName: "Dinesh Patel",
    motherName: "Laxmi Patel",
    guardianName: "Dinesh Patel",
    contact: "9587661122",
    mobile: "9587661122",
    address: "Kalyanpura, Road No 2, Barmer",
    penNo: "PEN-RJ-2024-519",
    gender: "Female",
    dob: "2009-12-11",
    category: "General",
    house: "Raman",
    transportOpted: true,
    busRoute: "Route 3 (Station Road - Mandir)",
    status: "Active",
    totalFee: 42000,
    paidFee: 42000,
    balanceFee: 0
  }
];

export const STAFF_ATTENDANCE_DATA = [
  { name: "Present", value: 0, percentage: "0%", color: "#2ecc71", count: 0 },
  { name: "Absent", value: 54, percentage: "79.41%", color: "#c0392b", count: 54 },
  { name: "On Leave", value: 0, percentage: "0%", color: "#16a085", count: 0 },
  { name: "Half Day", value: 0, percentage: "0%", color: "#d35400", count: 0 },
  { name: "Unmarked", value: 14, percentage: "20.59%", color: "#bdc3c7", count: 14 },
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

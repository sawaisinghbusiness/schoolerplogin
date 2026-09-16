"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  CreditCard,
  Ticket,
  GraduationCap,
  Phone,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Download,
  Database,
  RefreshCw
} from "lucide-react";
import { MOCK_STUDENTS, Student } from "@/data/mockData";
import { studentService } from "@/lib/services/studentService";
import { ProfileModal } from "@/components/search/ProfileModal";
import { FeeLedgerModal } from "@/components/search/FeeLedgerModal";
import { GatePassModal } from "@/components/search/GatePassModal";
import { exportStudentsToExcel, importStudentsFromExcel } from "@/lib/excelHelper";


type SearchField =
  | "Name"
  | "SR No"
  | "Guardian's Name"
  | "Contact"
  | "Roll No"
  | "Admission No"
  | "Section"
  | "Address"
  | "Pen No";

const SEARCH_OPTIONS: SearchField[] = [
  "Name",
  "SR No",
  "Guardian's Name",
  "Contact",
  "Roll No",
  "Admission No",
  "Section",
  "Address",
  "Pen No"
];

export default function SearchStudentPage() {
  // Student List State (loaded from live Supabase database with fallback)
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await studentService.fetchStudents();
      setStudentsList(res.data);
      setIsLive(res.isLive);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);


  // Main Search State
  const [selectedField, setSelectedField] = useState<SearchField>("Name");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  // Advance Search Drawer State
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [filterClass, setFilterClass] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterHouse, setFilterHouse] = useState("All");
  const [filterTransport, setFilterTransport] = useState("All");

  // Modals state
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isGatePassOpen, setIsGatePassOpen] = useState(false);

  // Trigger search on submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveQuery(searchQuery.trim());
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveQuery("");
    setFilterClass("All");
    setFilterSection("All");
    setFilterGender("All");
    setFilterCategory("All");
    setFilterHouse("All");
    setFilterTransport("All");
  };

  // Handle Excel Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importStudentsFromExcel(file);
      if (imported.length > 0) {
        setStudentsList((prev) => [...(imported as Student[]), ...prev]);
        setImportNotification(`Successfully imported ${imported.length} students from ${file.name}!`);
        setTimeout(() => setImportNotification(null), 5000);
      }
    } catch (err) {
      alert("Error reading Excel file. Please ensure it is a valid .xlsx or .xls spreadsheet.");
    }
  };

  // Filter students based on 9 search dimensions + advance filters
  const filteredStudents = useMemo(() => {
    return studentsList.filter((student) => {
      // 1. Check primary search query if active
      if (activeQuery) {
        const q = activeQuery.toLowerCase();
        let matches = false;

        switch (selectedField) {
          case "Name":
            matches = student.name.toLowerCase().includes(q);
            break;
          case "SR No":
            matches = student.srNo.toLowerCase().includes(q);
            break;
          case "Guardian's Name":
            matches =
              student.guardianName.toLowerCase().includes(q) ||
              student.fatherName.toLowerCase().includes(q) ||
              student.motherName.toLowerCase().includes(q);
            break;
          case "Contact":
            matches =
              student.contact.includes(q) || student.mobile.includes(q);
            break;
          case "Roll No":
            matches = student.rollNo.includes(q);
            break;
          case "Admission No":
            matches = student.admissionNo.toLowerCase().includes(q);
            break;
          case "Section":
            matches =
              student.section.toLowerCase().includes(q) ||
              student.classSec.toLowerCase().includes(q);
            break;
          case "Address":
            matches = student.address.toLowerCase().includes(q);
            break;
          case "Pen No":
            matches = student.penNo.toLowerCase().includes(q);
            break;
          default:
            matches = true;
        }

        if (!matches) return false;
      }

      // 2. Check Advance Search parameters
      if (filterClass !== "All" && student.class !== filterClass) {
        return false;
      }
      if (filterSection !== "All" && student.section !== filterSection) {
        return false;
      }
      if (filterGender !== "All" && student.gender !== filterGender) {
        return false;
      }
      if (filterCategory !== "All" && student.category !== filterCategory) {
        return false;
      }
      if (filterHouse !== "All" && student.house !== filterHouse) {
        return false;
      }
      if (filterTransport !== "All") {
        const wantsTransport = filterTransport === "Yes";
        if (student.transportOpted !== wantsTransport) return false;
      }

      return true;
    });
  }, [
    studentsList,
    activeQuery,
    selectedField,
    filterClass,
    filterSection,
    filterGender,
    filterCategory,
    filterHouse,
    filterTransport
  ]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Students</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">9-Way Multi Search</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Search Student Master
            </h1>
            {isLive ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Supabase Live ({studentsList.length} Scholars)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
                <span>Demo Engine ({studentsList.length})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Query student database instantly across 9 institutional parameters or via advanced demographic filters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Hidden File Input for Excel Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={loadStudents}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-xs transition-colors"
            title="Reload from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-xs transition-colors"
            title="Upload institution student excel sheet"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={() => exportStudentsToExcel(filteredStudents)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            title="Download current filtered student roster to .xlsx"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export (.xlsx)</span>
          </button>
        </div>

      </div>

      {importNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{importNotification}</span>
        </div>
      )}

      {/* Task 3.1: THE 9-WAY SEARCH BAR COMPONENT */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3">
            {/* 1. Dropdown Select for Search Field */}
            <div className="relative min-w-[190px]">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 md:hidden">
                Search By Field
              </label>
              <div className="relative">
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value as SearchField)}
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm rounded-md py-2.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {SEARCH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      Search by {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 2. Text Input with Attached Search! Button */}
            <div className="flex-1 flex items-stretch">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Type ${selectedField.toLowerCase()} to search (e.g. ${
                    selectedField === "Name"
                      ? "Aarav"
                      : selectedField === "SR No"
                      ? "SR-2024-001"
                      : selectedField === "Contact"
                      ? "9876543210"
                      : "..."
                  })...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full border border-r-0 border-slate-300 rounded-l-md px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveQuery("");
                    }}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Attached search! Button matching Schoollog teal styling */}
              <button
                type="submit"
                className="px-5 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-900 rounded-r-md transition-all flex items-center space-x-1.5 shadow-xs"
                style={{ backgroundColor: "#28d4a4" }}
              >
                <Search className="w-3.5 h-3.5 text-slate-900" />
                <span>search!</span>
              </button>
            </div>

            {/* 3. Advance Search Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAdvanceOpen(!isAdvanceOpen)}
              className={`px-4 py-2.5 border rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                isAdvanceOpen
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-emerald-500" />
              <span>Advance Search</span>
              {isAdvanceOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>
          </div>

          {/* Quick field badges helper */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <span className="font-semibold text-slate-500">Quick Fields:</span>
            {SEARCH_OPTIONS.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => setSelectedField(field)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  selectedField === field
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {field}
              </button>
            ))}
          </div>

          {/* Task 3.2: ADVANCE SEARCH SLIDE-DOWN FILTER DRAWER */}
          {isAdvanceOpen && (
            <div className="pt-4 mt-3 border-t border-slate-200 animate-fadeIn space-y-3 bg-slate-50/70 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demographic & Institutional Filter Parameters</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {/* Filter Class */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Class
                  </label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Classes</option>
                    <option value="6th">6th</option>
                    <option value="7th">7th</option>
                    <option value="8th">8th</option>
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                  </select>
                </div>

                {/* Filter Section */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Section
                  </label>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="PCM">PCM</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                {/* Filter Gender */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Filter Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                {/* Filter House */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    House
                  </label>
                  <select
                    value={filterHouse}
                    onChange={(e) => setFilterHouse(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Houses</option>
                    <option value="Tagore">Tagore</option>
                    <option value="Ashoka">Ashoka</option>
                    <option value="Shivaji">Shivaji</option>
                    <option value="Raman">Raman</option>
                  </select>
                </div>

                {/* Filter Transport */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Bus / Transport
                  </label>
                  <select
                    value={filterTransport}
                    onChange={(e) => setFilterTransport(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Commuters</option>
                    <option value="Yes">Bus Pass Opted</option>
                    <option value="No">Day Scholar (Self)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Task 3.3: SEARCH RESULT TABLE & METRICS */}
      <div className="space-y-3">
        {/* Results Header Count & Filters In Effect */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-800">
              Showing {filteredStudents.length} Students
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              Total Database: {studentsList.length} records
            </span>
            {activeQuery && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded border border-emerald-200 text-[11px]">
                {selectedField}: &quot;{activeQuery}&quot;
              </span>
            )}
          </div>

          {(activeQuery || filterClass !== "All" || filterCategory !== "All") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Clear Search Criteria
            </button>
          )}
        </div>

        {/* The Student Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#1e293b] text-slate-200 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Photo</th>
                  <th className="py-3 px-4">Student Name & SR</th>
                  <th className="py-3 px-4">Class - Sec</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4 text-center">Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Photo Avatar */}
                      <td className="py-3 px-4 text-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 mx-auto shadow-xs group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Student Name & SR */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                          <span>SR: {student.srNo}</span>
                          <span>•</span>
                          <span>Adm: {student.admissionNo}</span>
                        </div>
                      </td>

                      {/* Class - Sec */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-semibold font-mono text-[11px]">
                          {student.classSec}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Roll No: {student.rollNo}
                        </div>
                      </td>

                      {/* Father Name */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {student.fatherName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Guardian: {student.guardianName}
                        </div>
                      </td>

                      {/* Mobile Number */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 font-mono text-slate-800">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{student.mobile}</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          SMS Enabled
                        </div>
                      </td>

                      {/* Action Buttons: View Profile, Fee Ledger, Issue Gate Pass */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* 1. View Profile Button */}
                          <button
                            onClick={() => {
                              setActiveStudent(student);
                              setIsProfileOpen(true);
                            }}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                            title="View Student Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Profile</span>
                          </button>

                          {/* 2. Fee Ledger Button */}
                          <button
                            onClick={() => {
                              setActiveStudent(student);
                              setIsLedgerOpen(true);
                            }}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                            title="View Institutional Fee Ledger"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Fee Ledger</span>
                          </button>

                          {/* 3. Issue Gate Pass Button */}
                          <button
                            onClick={() => {
                              setActiveStudent(student);
                              setIsGatePassOpen(true);
                            }}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                            title="Issue Immediate Early Exit Gate Pass"
                          >
                            <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">Gate Pass</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                      <Search className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-sm font-semibold text-slate-600">
                        No students found matching your search query
                      </div>
                      <p className="text-xs text-slate-400">
                        Try searching with a different parameter or reset your advance filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold inline-block mt-2"
                      >
                        Reset Search Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <ProfileModal
        student={activeStudent}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenLedger={(s) => {
          setActiveStudent(s);
          setIsLedgerOpen(true);
        }}
        onOpenGatePass={(s) => {
          setActiveStudent(s);
          setIsGatePassOpen(true);
        }}
      />

      <FeeLedgerModal
        student={activeStudent}
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
      />

      <GatePassModal
        student={activeStudent}
        isOpen={isGatePassOpen}
        onClose={() => setIsGatePassOpen(false)}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  List,
  Check,
  BookOpen,
  MoveUp,
  MoveDown,
  Database,
  Copy,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { classService, ClassItem, SectionItem } from "@/lib/services/classService";

const PRESET_STANDARDS = [
  "Pre Nursery",
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const COMMON_SUBJECTS = [
  "Mathematics",
  "English",
  "Hindi",
  "ENVIRONMENT STUDIES",
  "Science",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Accounts",
  "Business Studies",
  "History",
  "Geography",
  "Political Science",
  "AGRICULTURE",
  "Agriculture Chemistry",
  "Agriculture Biology",
  "HINDI LIT.",
  "Computer Science",
  "Physical Education",
  "Sanskrit",
  "General Knowledge",
  "Drawing / Art",
];

const SQL_SETUP_SCRIPT = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    order_seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    subjects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, name)
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public write classes" ON public.classes FOR ALL USING (true);

CREATE POLICY "Allow public read sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Allow public write sections" ON public.sections FOR ALL USING (true);
`;

export default function ClassesSubjectsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [selectedClassIds, setSelectedClassIds] = useState<Record<string, boolean>>({});
  const [selectedSectionIds, setSelectedSectionIds] = useState<Record<string, boolean>>({});

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showOrderClassesModal, setShowOrderClassesModal] = useState(false);
  const [activeClass, setActiveClass] = useState<ClassItem | null>(null);
  const [activeSection, setActiveSection] = useState<SectionItem | null>(null);

  // Form states for Add Class
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [customStandard, setCustomStandard] = useState<string>("");
  const [defaultSectionsList, setDefaultSectionsList] = useState<string[]>(["A"]);
  const [sectionInputValue, setSectionInputValue] = useState<string>("");

  // Form states for Add Section to existing class
  const [newSectionList, setNewSectionList] = useState<string[]>([]);
  const [newSectionInput, setNewSectionInput] = useState<string>("");

  // Form states for Edit Class
  const [editClassName, setEditClassName] = useState("");

  // Form states for Subjects Options
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [activeSectionSubjects, setActiveSectionSubjects] = useState<string[]>([]);

  // Feedback banner
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await classService.fetchClasses();
    setTableMissing(res.tableMissing);
    setClasses(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    setStatusMsg({ text: msg, isError });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // ----------------------------------------------------
  // Add Class Modal handlers (Supabase Direct)
  // ----------------------------------------------------
  const handleOpenAddClassModal = () => {
    setSelectedStandard("");
    setCustomStandard("");
    setDefaultSectionsList(["A"]);
    setSectionInputValue("");
    setShowAddClassModal(true);
  };

  const handleAddSectionTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && sectionInputValue.trim()) {
      e.preventDefault();
      const val = sectionInputValue.trim().toUpperCase();
      if (!defaultSectionsList.includes(val)) {
        setDefaultSectionsList([...defaultSectionsList, val]);
      }
      setSectionInputValue("");
    }
  };

  const handleRemoveSectionTag = (secToRemove: string) => {
    setDefaultSectionsList(defaultSectionsList.filter((s) => s !== secToRemove));
  };

  const handleSaveNewClass = async () => {
    const finalStandard = customStandard.trim() || selectedStandard.trim();
    if (!finalStandard) {
      alert("Please select or enter a standard name!");
      return;
    }

    const sectionsToAdd = defaultSectionsList.length > 0 ? defaultSectionsList : ["A"];

    // Default subjects based on standard
    let defaultSubjects = ["Mathematics", "English", "Hindi", "ENVIRONMENT STUDIES"];
    if (finalStandard === "11" || finalStandard === "12" || finalStandard.includes("11") || finalStandard.includes("12")) {
      defaultSubjects = ["Physics", "Chemistry", "Mathematics", "English", "Hindi"];
    } else if (finalStandard.toLowerCase().includes("nursery") || finalStandard.toLowerCase().includes("kg")) {
      defaultSubjects = ["English", "Hindi", "Mathematics", "Rhymes & Activities"];
    }

    const res = await classService.createClass(finalStandard, sectionsToAdd, defaultSubjects);
    if (!res.success) {
      showNotification("Failed to save class. Please try again.", true);
      return;
    }

    showNotification(`Class "${finalStandard}" saved successfully!`);
    setShowAddClassModal(false);
    await loadData();
  };

  // ----------------------------------------------------
  // Delete Class
  // ----------------------------------------------------
  const handleDeleteClass = async (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete Class "${className}"?`)) {
      const res = await classService.deleteClass(classId);
      if (!res.success) {
        showNotification("Failed to delete class. Please try again.", true);
        return;
      }
      showNotification(`Class "${className}" deleted successfully!`);
      await loadData();
    }
  };

  // ----------------------------------------------------
  // Edit Class Name
  // ----------------------------------------------------
  const handleOpenEditClass = (cls: ClassItem) => {
    setActiveClass(cls);
    setEditClassName(cls.name);
    setShowEditClassModal(true);
  };

  const handleSaveEditClass = async () => {
    if (!activeClass || !editClassName.trim()) return;
    const res = await classService.updateClass(activeClass.id, editClassName.trim());
    if (!res.success) {
      showNotification("Failed to update class. Please try again.", true);
      return;
    }
    showNotification("Class updated successfully!");
    setShowEditClassModal(false);
    await loadData();
  };

  // ----------------------------------------------------
  // Add Section to class (Supabase Direct)
  // ----------------------------------------------------
  const handleOpenAddSectionModal = (cls: ClassItem) => {
    setActiveClass(cls);
    setNewSectionList([]);
    setNewSectionInput("");
    setShowAddSectionModal(true);
  };

  const handleAddNewSectionTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSectionInput.trim()) {
      e.preventDefault();
      const val = newSectionInput.trim().toUpperCase();
      if (!newSectionList.includes(val)) {
        setNewSectionList([...newSectionList, val]);
      }
      setNewSectionInput("");
    }
  };

  const handleSaveNewSections = async () => {
    if (!activeClass || newSectionList.length === 0) {
      alert("Please enter at least one section name (press Enter to add)!");
      return;
    }

    const defaultSubjects =
      activeClass.sections[0]?.subjects && activeClass.sections[0].subjects.length > 0
        ? [...activeClass.sections[0].subjects]
        : ["Mathematics", "English", "Hindi"];

    const res = await classService.addSections(activeClass.id, newSectionList, defaultSubjects);
    if (!res.success) {
      showNotification(`Error: ${res.error}`, true);
      return;
    }

    showNotification(`Sections added to Class ${activeClass.name} successfully!`);
    setShowAddSectionModal(false);
    await loadData();
  };

  // ----------------------------------------------------
  // Delete Section
  // ----------------------------------------------------
  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (confirm(`Are you sure you want to delete Section "${sectionName}"?`)) {
      const res = await classService.deleteSection(sectionId);
      if (!res.success) {
        showNotification(`Error: ${res.error}`, true);
        return;
      }
      showNotification(`Section ${sectionName} deleted successfully!`);
      await loadData();
    }
  };

  // ----------------------------------------------------
  // Remove Subject chip directly (Supabase Direct)
  // ----------------------------------------------------
  const handleRemoveSubjectFromSection = async (
    sectionId: string,
    currentSubjects: string[],
    subjectToRemove: string
  ) => {
    const updated = currentSubjects.filter((s) => s !== subjectToRemove);
    const res = await classService.updateSectionSubjects(sectionId, updated);
    if (!res.success) {
      showNotification(`Error updating subjects: ${res.error}`, true);
      return;
    }
    await loadData();
  };

  // ----------------------------------------------------
  // Subjects Options Modal (Supabase Direct)
  // ----------------------------------------------------
  const handleOpenSubjectModal = (cls: ClassItem, sec: SectionItem) => {
    setActiveClass(cls);
    setActiveSection(sec);
    setActiveSectionSubjects([...sec.subjects]);
    setCustomSubjectInput("");
    setShowSubjectModal(true);
  };

  const handleToggleSubject = (sub: string) => {
    if (activeSectionSubjects.includes(sub)) {
      setActiveSectionSubjects(activeSectionSubjects.filter((s) => s !== sub));
    } else {
      setActiveSectionSubjects([...activeSectionSubjects, sub]);
    }
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (trimmed && !activeSectionSubjects.includes(trimmed)) {
      setActiveSectionSubjects([...activeSectionSubjects, trimmed]);
      setCustomSubjectInput("");
    }
  };

  const handleSaveSubjectsOptions = async () => {
    if (!activeSection) return;

    const res = await classService.updateSectionSubjects(activeSection.id, activeSectionSubjects);
    if (!res.success) {
      showNotification(`Error saving subjects: ${res.error}`, true);
      return;
    }

    showNotification(`Subjects updated for Section ${activeSection.name}!`);
    setShowSubjectModal(false);
    await loadData();
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-7xl pb-16 text-xs text-slate-800">
      {/* Toast Notification */}
      {statusMsg && (
        <div
          className={`fixed top-4 right-4 z-50 text-white font-bold py-2.5 px-4 rounded shadow-lg flex items-center space-x-2 ${
            statusMsg.isError ? "bg-rose-600" : "bg-[#26b99a]"
          }`}
        >
          {statusMsg.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Add Classes and Sections
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure school standards, sections, and curriculum subjects
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenAddClassModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white rounded text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Class</span>
          </button>
          <button
            onClick={() => setShowOrderClassesModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#2980b9] hover:bg-[#2471a3] text-white rounded text-xs font-bold shadow-xs transition-colors"
          >
            <List className="w-4 h-4" />
            <span>Order Classes</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200 text-slate-500 font-semibold">
          Loading classes and sections...
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200 space-y-3">
          <p className="text-slate-500 font-medium">No classes configured yet.</p>
          <button
            onClick={handleOpenAddClassModal}
            className="px-4 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
          >
            + Add New Class
          </button>
        </div>
      ) : (
        /* Classes List */
        <div className="space-y-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Class Header Bar */}
              <div className="bg-[#eafaf1] border-b border-emerald-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedClassIds[cls.id])}
                    onChange={(e) =>
                      setSelectedClassIds({
                        ...selectedClassIds,
                        [cls.id]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span className="font-black text-slate-900 text-base sm:text-lg">
                    {cls.name}
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    onClick={() => handleOpenEditClass(cls)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#26b99a] border border-[#26b99a] rounded text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Class</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddSectionModal(cls)}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#26b99a] border border-[#26b99a] rounded text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Sections</span>
                  </button>

                  <button
                    onClick={() => {
                      if (cls.sections.length > 0) {
                        handleOpenSubjectModal(cls, cls.sections[0]);
                      } else {
                        alert("Please add at least one section first!");
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Edit Subjects</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 rounded text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Class</span>
                  </button>
                </div>
              </div>

              {/* Section and Subjects Sub-block */}
              <div className="p-4 space-y-3">
                <h3 className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                  Section and Subjects
                </h3>

                {cls.sections.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-slate-500 font-medium">
                    No sections added for this class yet. Click{" "}
                    <strong className="text-[#26b99a]">"+ Add Sections"</strong> above to add sections.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cls.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-[#f8fafc] border border-slate-200/90 rounded-lg p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                      >
                        {/* Left: Checkbox + Section Name + Subject Chips */}
                        <div className="flex items-center flex-wrap gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedSectionIds[sec.id])}
                            onChange={(e) =>
                              setSelectedSectionIds({
                                ...selectedSectionIds,
                                [sec.id]: e.target.checked,
                              })
                            }
                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
                          />

                          {/* Section Name Box */}
                          <div className="px-3 py-1 bg-white border border-slate-300 text-slate-800 font-bold rounded text-xs tracking-wider shadow-2xs min-w-[36px] text-center">
                            {sec.name}
                          </div>

                          {/* Subjects Chips List with ⓧ */}
                          <div className="flex items-center flex-wrap gap-1.5">
                            {sec.subjects.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">
                                No subjects mapped
                              </span>
                            ) : (
                              sec.subjects.map((subj, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-sky-300 hover:border-sky-400 text-slate-700 rounded-md text-[11px] font-medium shadow-2xs"
                                >
                                  <span>{subj}</span>
                                  <button
                                    onClick={() =>
                                      handleRemoveSubjectFromSection(sec.id, sec.subjects, subj)
                                    }
                                    title={`Remove ${subj}`}
                                    className="text-slate-400 hover:text-rose-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Right: Section Buttons */}
                        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => handleOpenSubjectModal(cls, sec)}
                            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-[11px] flex items-center space-x-1 shadow-2xs transition-colors"
                          >
                            <List className="w-3.5 h-3.5 text-slate-500" />
                            <span>Subjects Options</span>
                          </button>

                          <div className="relative group">
                            <button
                              onClick={() => {
                                const action = prompt(
                                  `Section "${sec.name}" Options:\nType "rename" to rename section\nType "delete" to delete section`
                                );
                                if (action?.toLowerCase() === "delete") {
                                  handleDeleteSection(sec.id, sec.name);
                                } else if (action?.toLowerCase() === "rename") {
                                  const newName = prompt("Enter new section name:", sec.name);
                                  if (newName?.trim()) {
                                    classService
                                      .renameSection(sec.id, newName.trim())
                                      .then((res) => {
                                        if (res.success) {
                                          showNotification("Section renamed successfully!");
                                          loadData();
                                        } else {
                                          showNotification(`Error: ${res.error}`, true);
                                        }
                                      });
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-[11px] flex items-center space-x-1 shadow-2xs transition-colors"
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                              <span>More</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 1. ADD CLASSES & SECTIONS MODAL (Matching Image 2 Design)             */}
      {/* ====================================================================== */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Modal Header: Teal/Green background with close icon */}
            <div className="bg-[#48cfad] px-5 py-3.5 flex items-center justify-between text-white">
              <h2 className="text-base font-bold tracking-tight">
                Add Classes & Sections
              </h2>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="text-white hover:text-emerald-100 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Select Standard */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-2">
                  Select Standard
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {PRESET_STANDARDS.map((std) => {
                    const isSelected = selectedStandard === std && !customStandard;
                    return (
                      <button
                        key={std}
                        type="button"
                        onClick={() => {
                          setSelectedStandard(std);
                          setCustomStandard("");
                        }}
                        className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center space-x-2 transition-all ${
                          isSelected
                            ? "border-[#48cfad] bg-emerald-50 text-emerald-800 ring-1 ring-[#48cfad]"
                            : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-[#48cfad] bg-[#48cfad]"
                              : "border-slate-400"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </span>
                        <span>{std}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OR Divider with Circle Badge */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 px-2 py-0.5 border border-slate-300 rounded-full text-[11px] font-bold text-slate-500 bg-white">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Enter New Standard */}
              <div className="flex items-center gap-3">
                <label className="text-slate-700 font-bold text-xs whitespace-nowrap shrink-0">
                  Enter New Standard:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Play Group, 11th - Arts"
                  value={customStandard}
                  onChange={(e) => {
                    setCustomStandard(e.target.value);
                    if (e.target.value) {
                      setSelectedStandard("");
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#48cfad] focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-200"></div>

              {/* Default Sections */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  Default Sections:
                </label>
                <div className="p-2 border border-slate-300 rounded bg-white flex flex-wrap items-center gap-1.5 min-h-[42px] focus-within:ring-1 focus-within:ring-[#48cfad]">
                  {defaultSectionsList.map((sec) => (
                    <span
                      key={sec}
                      className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <span>{sec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSectionTag(sec)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Press Enter"
                    value={sectionInputValue}
                    onChange={(e) => setSectionInputValue(e.target.value)}
                    onKeyDown={handleAddSectionTag}
                    className="flex-1 min-w-[80px] p-1 text-xs outline-none bg-transparent"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  *Select or add standard name first to add sections
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleSaveNewClass}
                  className="px-8 py-2 bg-[#5dc2b5] hover:bg-[#48cfad] text-white font-bold rounded-lg shadow-sm transition-colors text-xs tracking-wider uppercase"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. ADD SECTIONS TO EXISTING CLASS MODAL                               */}
      {/* ====================================================================== */}
      {showAddSectionModal && activeClass && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#48cfad] px-5 py-3.5 flex items-center justify-between text-white">
              <h2 className="text-base font-bold tracking-tight">
                Add Sections to Class {activeClass.name}
              </h2>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="text-white hover:text-emerald-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  New Section Names:
                </label>
                <div className="p-2 border border-slate-300 rounded bg-white flex flex-wrap items-center gap-1.5 min-h-[42px] focus-within:ring-1 focus-within:ring-[#48cfad]">
                  {newSectionList.map((sec) => (
                    <span
                      key={sec}
                      className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <span>{sec}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewSectionList(newSectionList.filter((s) => s !== sec))
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Type name and press Enter (e.g. C, PCM, ARTS)"
                    value={newSectionInput}
                    onChange={(e) => setNewSectionInput(e.target.value)}
                    onKeyDown={handleAddNewSectionTag}
                    className="flex-1 min-w-[120px] p-1 text-xs outline-none bg-transparent"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Type a section name and press <kbd className="px-1 py-0.5 bg-slate-100 border rounded font-mono">Enter</kbd> to add.
                </p>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewSections}
                  className="px-6 py-2 bg-[#5dc2b5] hover:bg-[#48cfad] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Sections
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. SUBJECTS OPTIONS / MANAGE SUBJECTS MODAL                           */}
      {/* ====================================================================== */}
      {showSubjectModal && activeClass && activeSection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-[#48cfad] px-5 py-3.5 flex items-center justify-between text-white">
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  Subjects for Class {activeClass.name} - Section {activeSection.name}
                </h2>
                <p className="text-[11px] text-emerald-100">
                  Configure assigned subjects for this section
                </p>
              </div>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="text-white hover:text-emerald-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Add Custom Subject Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom subject name..."
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                  className="flex-1 p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#48cfad] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                >
                  + Add
                </button>
              </div>

              {/* Currently Selected Subjects */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  Currently Assigned Subjects ({activeSectionSubjects.length}):
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded min-h-[50px] max-h-32 overflow-y-auto">
                  {activeSectionSubjects.length === 0 ? (
                    <span className="text-slate-400 italic text-xs">
                      No subjects assigned yet.
                    </span>
                  ) : (
                    activeSectionSubjects.map((sub) => (
                      <span
                        key={sub}
                        className="px-2.5 py-1 bg-white border border-sky-300 text-slate-800 rounded text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSubject(sub)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Available Subjects Selection */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  Choose from Curriculum Catalog:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded bg-white">
                  {COMMON_SUBJECTS.map((sub) => {
                    const isChecked = activeSectionSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleToggleSubject(sub)}
                        className={`p-2 rounded text-left text-xs font-semibold flex items-center space-x-2 border transition-colors ${
                          isChecked
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span className="truncate">{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSubjectsOptions}
                  className="px-6 py-2 bg-[#5dc2b5] hover:bg-[#48cfad] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 4. EDIT CLASS NAME MODAL                                              */}
      {/* ====================================================================== */}
      {showEditClassModal && activeClass && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="bg-[#48cfad] px-5 py-3.5 flex items-center justify-between text-white">
              <h2 className="text-base font-bold tracking-tight">Edit Class Name</h2>
              <button
                onClick={() => setShowEditClassModal(false)}
                className="text-white hover:text-emerald-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">
                  Class / Standard Name:
                </label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-xs focus:ring-1 focus:ring-[#48cfad] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditClassModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditClass}
                  className="px-5 py-1.5 bg-[#5dc2b5] hover:bg-[#48cfad] text-white font-bold rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 5. SQL SCRIPT MODAL (For Supabase Dashboard Migration)               */}
      {/* ====================================================================== */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold tracking-tight">Supabase SQL Editor Script</h2>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-xs leading-relaxed">
                Supabase me backend tables create karne ke liye, neeche diya gaya SQL copy karein aur apne{" "}
                <strong>Supabase Dashboard &gt; SQL Editor</strong> me paste karke <strong>Run</strong> button dabayein:
              </p>

              <div className="relative bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 border border-slate-800">
                <pre>{SQL_SETUP_SCRIPT}</pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold flex items-center space-x-1 border border-slate-700"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded text-xs flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? "Copied to Clipboard!" : "Copy SQL to Clipboard"}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded font-bold text-slate-700 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

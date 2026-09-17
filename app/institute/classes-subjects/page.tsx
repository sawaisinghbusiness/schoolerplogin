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
  CheckSquare,
  Square,
  BookOpen,
  Layers,
  ArrowUpDown,
  MoveUp,
  MoveDown
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

export default function ClassesSubjectsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [subjectSearch, setSubjectSearch] = useState("");
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [activeSectionSubjects, setActiveSectionSubjects] = useState<string[]>([]);

  // Feedback banner
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await classService.fetchClasses();
      setClasses(res.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const updateAndPersistClasses = async (updated: ClassItem[], notification?: string) => {
    setClasses(updated);
    await classService.saveClasses(updated);
    if (notification) {
      showNotification(notification);
    }
  };

  // ----------------------------------------------------
  // Add Class Modal handlers
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

    const newClass: ClassItem = {
      id: `cls-${Date.now()}`,
      name: finalStandard,
      sections: sectionsToAdd.map((sec, idx) => ({
        id: `sec-${Date.now()}-${idx}`,
        name: sec,
        subjects: [...defaultSubjects],
      })),
    };

    const updated = [...classes, newClass];
    await updateAndPersistClasses(updated, `Class "${finalStandard}" added and saved successfully!`);
    setShowAddClassModal(false);
  };

  // ----------------------------------------------------
  // Delete Class
  // ----------------------------------------------------
  const handleDeleteClass = async (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete Class "${className}" and all its sections?`)) {
      const updated = classes.filter((c) => c.id !== classId);
      await updateAndPersistClasses(updated, `Class "${className}" deleted!`);
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
    const updated = classes.map((c) =>
      c.id === activeClass.id ? { ...c, name: editClassName.trim() } : c
    );
    await updateAndPersistClasses(updated, `Class renamed to "${editClassName.trim()}"!`);
    setShowEditClassModal(false);
  };

  // ----------------------------------------------------
  // Add Section to specific class
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

    const newSections: SectionItem[] = newSectionList.map((secName, idx) => ({
      id: `sec-${Date.now()}-${idx}`,
      name: secName,
      subjects: [...defaultSubjects],
    }));

    const updated = classes.map((c) => {
      if (c.id === activeClass.id) {
        return {
          ...c,
          sections: [...c.sections, ...newSections],
        };
      }
      return c;
    });

    await updateAndPersistClasses(
      updated,
      `Added ${newSections.length} new section(s) to Class ${activeClass.name}!`
    );
    setShowAddSectionModal(false);
  };

  // ----------------------------------------------------
  // Delete a Section
  // ----------------------------------------------------
  const handleDeleteSection = async (classId: string, sectionId: string, sectionName: string) => {
    if (confirm(`Delete Section "${sectionName}"?`)) {
      const updated = classes.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            sections: c.sections.filter((s) => s.id !== sectionId),
          };
        }
        return c;
      });
      await updateAndPersistClasses(updated, `Section ${sectionName} deleted!`);
    }
  };

  // ----------------------------------------------------
  // Remove Subject chip directly
  // ----------------------------------------------------
  const handleRemoveSubjectFromSection = async (
    classId: string,
    sectionId: string,
    subjectToRemove: string
  ) => {
    const updated = classes.map((c) => {
      if (c.id === classId) {
        return {
          ...c,
          sections: c.sections.map((s) => {
            if (s.id === sectionId) {
              return {
                ...s,
                subjects: s.subjects.filter((sub) => sub !== subjectToRemove),
              };
            }
            return s;
          }),
        };
      }
      return c;
    });
    await updateAndPersistClasses(updated);
  };

  // ----------------------------------------------------
  // Subjects Options Modal
  // ----------------------------------------------------
  const handleOpenSubjectModal = (cls: ClassItem, sec: SectionItem) => {
    setActiveClass(cls);
    setActiveSection(sec);
    setActiveSectionSubjects([...sec.subjects]);
    setSubjectSearch("");
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
    if (!activeClass || !activeSection) return;

    const updated = classes.map((c) => {
      if (c.id === activeClass.id) {
        return {
          ...c,
          sections: c.sections.map((s) => {
            if (s.id === activeSection.id) {
              return {
                ...s,
                subjects: [...activeSectionSubjects],
              };
            }
            return s;
          }),
        };
      }
      return c;
    });

    await updateAndPersistClasses(
      updated,
      `Subjects updated for Class ${activeClass.name} - Section ${activeSection.name}!`
    );
    setShowSubjectModal(false);
  };

  // ----------------------------------------------------
  // Order Classes
  // ----------------------------------------------------
  const handleMoveClass = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= classes.length) return;
    const reordered = [...classes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateAndPersistClasses(reordered);
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-7xl pb-16 text-xs text-slate-800">
      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#26b99a] text-white font-bold py-2.5 px-4 rounded shadow-lg flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Add Classes and Sections
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure school standards, sections, and curriculum subjects saved directly to database
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
          Loading classes and curriculum data...
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200 space-y-3">
          <p className="text-slate-500 font-medium">No classes configured yet.</p>
          <button
            onClick={handleOpenAddClassModal}
            className="px-4 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
          >
            + Add Your First Class
          </button>
        </div>
      ) : (
        /* Classes List */
        <div className="space-y-6">
          {classes.map((cls, classIndex) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Class Header Bar (Greenish background matching screenshots) */}
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
                    onClick={() => {
                      const newOrder = [...cls.sections].reverse();
                      const updated = classes.map((c) =>
                        c.id === cls.id ? { ...c, sections: newOrder } : c
                      );
                      updateAndPersistClasses(updated, `Reordered sections in Class ${cls.name}`);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-[#2980b9] border border-[#2980b9] rounded text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                  >
                    <List className="w-3 h-3" />
                    <span>Section Order</span>
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
                                      handleRemoveSubjectFromSection(cls.id, sec.id, subj)
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
                                  handleDeleteSection(cls.id, sec.id, sec.name);
                                } else if (action?.toLowerCase() === "rename") {
                                  const newName = prompt("Enter new section name:", sec.name);
                                  if (newName?.trim()) {
                                    const updated = classes.map((c) =>
                                      c.id === cls.id
                                        ? {
                                            ...c,
                                            sections: c.sections.map((s) =>
                                              s.id === sec.id
                                                ? { ...s, name: newName.trim().toUpperCase() }
                                                : s
                                            ),
                                          }
                                        : c
                                    );
                                    updateAndPersistClasses(updated, `Section renamed to ${newName.trim()}`);
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

              {/* Save Button (Centered cyan/teal rounded button) */}
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
                  Select mapped subjects or type a custom subject name
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
      {/* 5. ORDER CLASSES MODAL                                                */}
      {/* ====================================================================== */}
      {showOrderClassesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#2980b9] px-5 py-3.5 flex items-center justify-between text-white">
              <h2 className="text-base font-bold tracking-tight">Order Classes</h2>
              <button
                onClick={() => setShowOrderClassesModal(false)}
                className="text-white hover:text-blue-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-slate-500 text-xs">
                Use arrows to adjust the sequence of classes displayed in menus, reports, and attendance:
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {classes.map((cls, idx) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded font-bold text-xs"
                  >
                    <span className="text-slate-800">
                      {idx + 1}. Class {cls.name}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveClass(idx, "up")}
                        className="p-1 text-slate-600 hover:text-blue-600 disabled:opacity-30 rounded hover:bg-slate-200"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={idx === classes.length - 1}
                        onClick={() => handleMoveClass(idx, "down")}
                        className="p-1 text-slate-600 hover:text-blue-600 disabled:opacity-30 rounded hover:bg-slate-200"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowOrderClassesModal(false)}
                  className="px-5 py-1.5 bg-[#2980b9] hover:bg-[#2471a3] text-white font-bold rounded"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

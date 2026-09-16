"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Search,
  Download,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  MapPin,
  Tag
} from "lucide-react";

interface SchoolEvent {
  id: string;
  title: string;
  category: "Holiday" | "Event" | "Exam" | "Meeting" | "Celebration";
  startDate: string;
  endDate: string;
  isHoliday: boolean;
  notifySms: boolean;
  description: string;
}

export default function EventHolidaysPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState<SchoolEvent["category"]>("Holiday");
  const [startDate, setStartDate] = useState("2026-09-20");
  const [endDate, setEndDate] = useState("2026-09-20");
  const [isHoliday, setIsHoliday] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [description, setDescription] = useState("");

  const [events, setEvents] = useState<SchoolEvent[]>([
    {
      id: "EVT-01",
      title: "Ramdev Jayanti / Teja Dashami",
      category: "Holiday",
      startDate: "2026-09-21",
      endDate: "2026-09-21",
      isHoliday: true,
      notifySms: true,
      description: "State Holiday declared for Rajasthan Govt schools and academies."
    },
    {
      id: "EVT-02",
      title: "Pre-Board Exam Term 1 Commencement",
      category: "Exam",
      startDate: "2026-09-25",
      endDate: "2026-10-06",
      isHoliday: false,
      notifySms: true,
      description: "Commencement of Class 10th and 12th Pre-Board Exams."
    },
    {
      id: "EVT-03",
      title: "Mahatma Gandhi Jayanti",
      category: "Holiday",
      startDate: "2026-10-02",
      endDate: "2026-10-02",
      isHoliday: true,
      notifySms: false,
      description: "National Gazetted Holiday."
    },
    {
      id: "EVT-04",
      title: "Parent Teacher Meeting (PTM) - Term 1 Progress",
      category: "Meeting",
      startDate: "2026-10-10",
      endDate: "2026-10-10",
      isHoliday: false,
      notifySms: true,
      description: "Mandatory PTM for all standards from 8:30 AM to 12:30 PM."
    },
    {
      id: "EVT-05",
      title: "Inter-House Sports Meet & Athletics Day",
      category: "Celebration",
      startDate: "2026-10-18",
      endDate: "2026-10-20",
      isHoliday: false,
      notifySms: false,
      description: "Annual 3-day track and field sports competition at Barmer Stadium."
    },
    {
      id: "EVT-06",
      title: "Diwali & Deepawali Mid-Term Break",
      category: "Holiday",
      startDate: "2026-10-28",
      endDate: "2026-11-06",
      isHoliday: true,
      notifySms: true,
      description: "Diwali Vacation for all students and academic staff."
    }
  ]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: SchoolEvent = {
      id: `EVT-${Date.now()}`,
      title: eventTitle,
      category: eventCategory,
      startDate,
      endDate,
      isHoliday,
      notifySms,
      description
    };
    setEvents([newEvent, ...events]);
    setShowAddModal(false);
    setEventTitle("");
    setDescription("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const deleteEvent = (id: string) => {
    if (confirm("Are you sure you want to remove this calendar entry?")) {
      setEvents(events.filter((ev) => ev.id !== id));
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "holiday") return matchesSearch && ev.category === "Holiday";
    if (activeTab === "event") return matchesSearch && ev.category === "Event";
    if (activeTab === "exam") return matchesSearch && ev.category === "Exam";
    if (activeTab === "meeting") return matchesSearch && ev.category === "Meeting";
    if (activeTab === "celebration") return matchesSearch && ev.category === "Celebration";
    return matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Extra Features</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Calendar Events</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Events & Holidays Calendar (2026-2027)
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage academic schedule, gazetted holidays, annual celebrations, PTMs, and exam dates
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Event / Holiday</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>New calendar event saved and published successfully!</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { key: "all", label: `All (${events.length})` },
          { key: "holiday", label: "Holidays" },
          { key: "event", label: "Events" },
          { key: "exam", label: "Exams" },
          { key: "meeting", label: "Meetings" },
          { key: "celebration", label: "Celebrations" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
              activeTab === tab.key
                ? "bg-[#26b99a] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Calendar Excel</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Event Date</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Holiday Status</th>
                <th className="p-3">SMS Parents</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 whitespace-nowrap font-mono font-semibold text-slate-700">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.startDate}</span>
                      {ev.startDate !== ev.endDate && (
                        <span className="text-slate-400">to {ev.endDate}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{ev.title}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.category === "Holiday"
                          ? "bg-red-100 text-red-800"
                          : ev.category === "Exam"
                          ? "bg-amber-100 text-amber-800"
                          : ev.category === "Meeting"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {ev.category}
                    </span>
                  </td>
                  <td className="p-3">
                    {ev.isHoliday ? (
                      <span className="text-red-600 font-bold text-[11px]">School Closed</span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Working Day</span>
                    )}
                  </td>
                  <td className="p-3">
                    {ev.notifySms ? (
                      <span className="text-emerald-600 font-semibold text-[11px]">Enabled</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Disabled</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{ev.description}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add New Calendar Event / Holiday</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Diwali Vacation"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Holiday">Holiday</option>
                    <option value="Event">Event</option>
                    <option value="Exam">Exam</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Celebration">Celebration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Is School Holiday?</label>
                  <select
                    value={isHoliday ? "yes" : "no"}
                    onChange={(e) => setIsHoliday(e.target.value === "yes")}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="yes">Yes (Closed)</option>
                    <option value="no">No (Working)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details or circular notes..."
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

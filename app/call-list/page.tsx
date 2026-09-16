"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Plus,
  Search,
  Download,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  BarChart2
} from "lucide-react";

interface CallCampaign {
  id: string;
  campaignName: string;
  category: "Fee Defaulter" | "Absentee Followup" | "Enquiry Followup" | "Academic Notice";
  targetGroup: string;
  totalContacts: number;
  completedCalls: number;
  pendingCalls: number;
  assignedStaff: string;
  createdAt: string;
  status: "Active" | "Completed" | "Paused";
}

export default function CallListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const [campaigns, setCampaigns] = useState<CallCampaign[]>([
    {
      id: "CMP-01",
      campaignName: "Quarter 2 Fee Dues Recovery Followup",
      category: "Fee Defaulter",
      targetGroup: "Students with Balance Fee > ₹5,000 (342 Students)",
      totalContacts: 342,
      completedCalls: 210,
      pendingCalls: 132,
      assignedStaff: "Finance Calling Desk (3 Staff)",
      createdAt: "2026-09-01",
      status: "Active"
    },
    {
      id: "CMP-02",
      campaignName: "Consecutive 3-Day Absent Students Calling",
      category: "Absentee Followup",
      targetGroup: "Students absent without leave from 12-15 Sept",
      totalContacts: 48,
      completedCalls: 45,
      pendingCalls: 3,
      assignedStaff: "Class Teachers & Coordinators",
      createdAt: "2026-09-15",
      status: "Active"
    },
    {
      id: "CMP-03",
      campaignName: "Session 2026-27 Prospective Enquiries Followup",
      category: "Enquiry Followup",
      targetGroup: "Walk-in enquiries visited in August",
      totalContacts: 115,
      completedCalls: 98,
      pendingCalls: 17,
      assignedStaff: "Front Desk Counselor",
      createdAt: "2026-08-25",
      status: "Active"
    }
  ]);

  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [category, setCategory] = useState<CallCampaign["category"]>("Fee Defaulter");
  const [targetGroup, setTargetGroup] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: CallCampaign = {
      id: `CMP-${Date.now()}`,
      campaignName,
      category,
      targetGroup,
      totalContacts: 50,
      completedCalls: 0,
      pendingCalls: 50,
      assignedStaff: "Admin Calling Team",
      createdAt: "2026-09-16",
      status: "Active"
    };
    setCampaigns([newCamp, ...campaigns]);
    setShowCreateModal(false);
    setCampaignName("");
    setTargetGroup("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <PhoneCall className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Call List</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Campaigns</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Calling Campaigns & Outreach Lists
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Organize systematic parent telecalling drives for fee dues, student absentees, and admission counselling
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/my-calls"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold border border-slate-300 transition-colors flex items-center space-x-1"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#26b99a]" />
            <span>Open My Calls Queue</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Calling Campaign</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>New calling campaign launched successfully!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaign name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/call-list-reasons"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300"
          >
            ⚙ Manage Call Reasons
          </Link>
          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded border border-slate-300 flex items-center space-x-1">
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3"># Campaign</th>
                <th className="p-3">Category</th>
                <th className="p-3">Target Audience</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Assigned Staff</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCampaigns.map((c) => {
                const percent = Math.round((c.completedCalls / c.totalContacts) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.campaignName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{c.id} • Created {c.createdAt}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.category === "Fee Defaulter"
                            ? "bg-amber-100 text-amber-800"
                            : c.category === "Absentee Followup"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs truncate">{c.targetGroup}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#26b99a] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-700">{percent}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {c.completedCalls} / {c.totalContacts} called
                      </span>
                    </td>
                    <td className="p-3 font-bold text-rose-600">{c.pendingCalls} Remaining</td>
                    <td className="p-3 text-slate-600">{c.assignedStaff}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href="/my-calls"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#26b99a] hover:text-white rounded font-bold text-[11px] text-slate-700 transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Start Calls</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Create New Calling Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. October Fee Defaulters Drive"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                >
                  <option value="Fee Defaulter">Fee Defaulter Calling</option>
                  <option value="Absentee Followup">Absentee Followup</option>
                  <option value="Enquiry Followup">Enquiry Followup</option>
                  <option value="Academic Notice">Academic Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Description *</label>
                <input
                  type="text"
                  required
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="e.g. Students with outstanding balance > ₹3000"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

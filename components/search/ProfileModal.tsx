"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Student } from "@/data/mockData";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  ShieldAlert,
  Bus,
  Hash,
  Award,
  CreditCard
} from "lucide-react";

interface ProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLedger?: (student: Student) => void;
  onOpenGatePass?: (student: Student) => void;
}

export function ProfileModal({
  student,
  isOpen,
  onClose,
  onOpenLedger,
  onOpenGatePass
}: ProfileModalProps) {
  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Master Profile"
      subtitle={`Academic Record for ${student.name} (${student.srNo})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs sm:text-sm">
        {/* Top Header Profile Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-400 shrink-0 shadow-sm">
            <img
              src={student.photoUrl}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {student.status}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                Class: {student.classSec}
              </span>
            </div>

            <p className="text-slate-500 text-xs">
              Father: <strong className="text-slate-700">{student.fatherName}</strong> | Mother: <strong className="text-slate-700">{student.motherName}</strong>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-600">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{student.contact}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Roll: <strong>{student.rollNo}</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-purple-500" />
                <span>House: <strong>{student.house}</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Grid Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enrollment & Bio Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Admission No:</span>
                <span className="font-mono font-semibold text-slate-700">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block">SR Number:</span>
                <span className="font-mono font-semibold text-slate-700">{student.srNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Birth:</span>
                <span className="font-medium text-slate-700">{student.dob}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gender / Category:</span>
                <span className="font-medium text-slate-700">{student.gender} / {student.category}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Government PEN No:</span>
                <span className="font-mono font-semibold text-slate-700">{student.penNo}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center space-x-1.5">
              <Bus className="w-3.5 h-3.5 text-blue-600" />
              <span>Transport & Residential Info</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400 block">Transport Facility:</span>
                <span className="font-semibold text-slate-800">
                  {student.transportOpted ? (
                    <span className="text-emerald-600">Opted ({student.busRoute})</span>
                  ) : (
                    <span className="text-slate-500">Day Scholar (Self Commute)</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Residential Address:</span>
                <span className="font-medium text-slate-700 flex items-start space-x-1">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                  <span>{student.address}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Guardian Contact:</span>
                <span className="font-medium text-slate-700">{student.guardianName} ({student.mobile})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Fee Snapshot in Profile */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Fee Balance Status:</span>
            {student.balanceFee === 0 ? (
              <span className="font-bold text-emerald-600 flex items-center space-x-1">
                <span>All Fees Cleared (₹{student.paidFee.toLocaleString()})</span>
              </span>
            ) : (
              <span className="font-bold text-rose-600">
                Pending Due: ₹{student.balanceFee.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {onOpenLedger && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLedger(student);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                View Fee Ledger
              </button>
            )}
            {onOpenGatePass && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGatePass(student);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-xs"
              >
                Issue Gate Pass
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

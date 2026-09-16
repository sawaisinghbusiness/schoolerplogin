"use client";

import React, { useState } from "react";
import { Gift, Send, CheckCircle2, Phone } from "lucide-react";

export default function BirthdaysPage() {
  const [sentList, setSentList] = useState<Record<string, boolean>>({});

  const birthdays = [
    { id: "1", name: "Aarav Sharma", role: "Student", classSec: "10th - A", mobile: "9876543210", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { id: "2", name: "Karan Soni", role: "Student", classSec: "11th - COMM", mobile: "9460112233", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { id: "3", name: "Pooja Bhati", role: "Student", classSec: "6th - C", mobile: "9602445566", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
    { id: "4", name: "Mohit Verma", role: "Student", classSec: "8th - B", mobile: "9414512345", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
    { id: "5", name: "Simran Kaur", role: "Student", classSec: "12th - PCB", mobile: "9829412345", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" },
    { id: "6", name: "Yashraj Singh", role: "Student", classSec: "9th - A", mobile: "9784112233", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
    { id: "7", name: "Mrs. Sunita Sharma", role: "Teacher", classSec: "PGT Mathematics", mobile: "9829055443", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
    { id: "8", name: "Mr. Mahendra Singh", role: "Staff", classSec: "Sports HOD", mobile: "9602433445", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  ];

  const handleSendGreeting = (id: string, name: string) => {
    setSentList(prev => ({ ...prev, [id]: true }));
    alert(`Birthday greeting SMS successfully sent to ${name}!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-10">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
            <Gift className="w-3.5 h-3.5 text-pink-500" />
            <span>Academic Ops</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-800 font-semibold">Today&apos;s Birthdays</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Today&apos;s Birthdays (8 Celebrants Today)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Students and faculty celebrating birthdays today. Send instant customized institutional greetings via SMS / WhatsApp.
          </p>
        </div>

        <button
          onClick={() => alert("Broadcasting Happy Birthday greeting SMS to all 8 celebrants...")}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-bold shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Wish All 8 Celebrants</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {birthdays.map((b) => (
          <div key={b.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <img src={b.photo} alt={b.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-slate-900">{b.name}</h3>
                  <span className="px-1.5 py-0.2 bg-pink-100 text-pink-700 rounded text-[10px] font-bold">
                    {b.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{b.classSec}</div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{b.mobile}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSendGreeting(b.id, b.name)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                sentList[b.id]
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {sentList[b.id] ? "Wished ✓" : "Send SMS"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

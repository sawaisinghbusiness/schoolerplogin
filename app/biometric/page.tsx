"use client";

import React, { useState } from "react";
import { Wifi, Plus, RefreshCw, CheckCircle2, Server, ShieldCheck } from "lucide-react";

export default function BiometricDevicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [devices, setDevices] = useState([
    {
      id: "CEXJ232160976",
      name: "Main Reception Gate - ZK Teco",
      ip: "192.168.1.120",
      port: "4370",
      syncedStaff: 55,
      totalStaff: 68,
      status: "Online",
      lastSync: "16-09-2026 13:42:10"
    }
  ]);

  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceSerial, setNewDeviceSerial] = useState("");
  const [newDeviceIp, setNewDeviceIp] = useState("");

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceSerial.trim()) return;
    setDevices([
      ...devices,
      {
        id: newDeviceSerial.trim(),
        name: newDeviceName.trim() || "Campus Biometric Terminal",
        ip: newDeviceIp.trim() || "192.168.1.121",
        port: "4370",
        syncedStaff: 0,
        totalStaff: 68,
        status: "Online",
        lastSync: "Just now"
      }
    ]);
    setIsModalOpen(false);
    setNewDeviceName("");
    setNewDeviceSerial("");
  };

  const handleSync = (deviceId: string) => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert(`Device ${deviceId}: 68 staff fingerprints & RFID cards synchronized successfully!`);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl pb-16 text-xs text-slate-800">
      <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Biometric Devices</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              Live TCP/IP
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Hardware synchronization portal for biometric punch terminals (Mother Teresa Nobles Academy)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Biometric Device</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div key={dev.id} className="p-5 bg-white rounded border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  SERIAL: {dev.id}
                </span>
                <h3 className="font-bold text-sm text-slate-900 pt-1">{dev.name}</h3>
                <p className="text-slate-500 text-[11px] font-mono">IP: {dev.ip}:{dev.port}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{dev.status}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Synced Staff</div>
                <div className="text-base font-black text-slate-900 font-mono">
                  {dev.syncedStaff} / {dev.totalStaff} Staff
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Last Punch Sync</div>
                <div className="text-[11px] font-mono text-slate-700">{dev.lastSync}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => handleSync(dev.id)}
                disabled={syncing}
                className="flex-1 py-2 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "Syncing..." : "Sync All Staff"}</span>
              </button>
              <button
                onClick={() => alert(`Ping IP ${dev.ip}: Status OK (2ms latency)`)}
                className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-bold"
              >
                Ping IP
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <form onSubmit={handleAddDevice} className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl border-t-4 border-[#26b99a]">
            <h3 className="font-bold text-sm text-slate-900">Add New Biometric Hardware Device</h3>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Device Name / Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Staff Room Terminal"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Device Serial Number *</label>
                <input
                  type="text"
                  placeholder="e.g. CEXJ99887766"
                  value={newDeviceSerial}
                  onChange={(e) => setNewDeviceSerial(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Static IP Address *</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.125"
                  value={newDeviceIp}
                  onChange={(e) => setNewDeviceIp(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white font-bold rounded shadow-xs"
              >
                Save Device
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

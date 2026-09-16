"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Heart,
  Share2,
  Calendar,
  Eye,
  Trash2,
  Upload,
  CheckCircle2,
  FolderPlus
} from "lucide-react";

interface Album {
  id: string;
  title: string;
  eventDate: string;
  coverUrl: string;
  photoCount: number;
  likes: number;
  category: "Annual Function" | "Sports" | "Celebrations" | "Academics";
}

export default function GalleryPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [success, setSuccess] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([
    {
      id: "ALB-01",
      title: "Annual Cultural Fest & Prize Distribution 2026",
      eventDate: "15 Jan 2026",
      coverUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
      photoCount: 48,
      likes: 132,
      category: "Annual Function"
    },
    {
      id: "ALB-02",
      title: "Republic Day Patriotic Parade & Flag Hoisting",
      eventDate: "26 Jan 2026",
      coverUrl: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80",
      photoCount: 34,
      likes: 95,
      category: "Celebrations"
    },
    {
      id: "ALB-03",
      title: "Inter-School Science, Robotics & Math Exhibition",
      eventDate: "12 Nov 2025",
      coverUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
      photoCount: 56,
      likes: 180,
      category: "Academics"
    },
    {
      id: "ALB-04",
      title: "District Athletics Meet & Kho-Kho Championship",
      eventDate: "05 Dec 2025",
      coverUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
      photoCount: 42,
      likes: 114,
      category: "Sports"
    }
  ]);

  // Form states
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumCategory, setAlbumCategory] = useState<Album["category"]>("Annual Function");
  const [albumDate, setAlbumDate] = useState("2026-09-16");

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlb: Album = {
      id: `ALB-${Date.now()}`,
      title: albumTitle,
      eventDate: albumDate,
      coverUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
      photoCount: 0,
      likes: 0,
      category: albumCategory
    };
    setAlbums([newAlb, ...albums]);
    setShowCreateModal(false);
    setAlbumTitle("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 text-xs text-slate-800">
      {/* Header Breadcrumb */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 text-[11px]">
            <ImageIcon className="w-3.5 h-3.5 text-[#26b99a]" />
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span>Extra Features</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">School Photo Gallery</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Photo & Event Gallery Albums
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Organize photo albums from school functions, publish to student mobile app, and manage photo archives
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-[#26b99a] hover:bg-[#209b81] text-white rounded font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Create Album</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center space-x-2 animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>New photo album created successfully! You can now upload photos to it.</span>
        </div>
      )}

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {albums.map((alb) => (
          <div
            key={alb.id}
            className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <img
                src={alb.coverUrl}
                alt={alb.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                {alb.photoCount} Photos
              </span>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#26b99a] text-white">
                {alb.category}
              </span>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{alb.eventDate}</span>
              </div>

              <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                {alb.title}
              </h3>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                  <span className="flex items-center space-x-1 text-rose-500 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{alb.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedAlbum(alb)}
                    className="p-1.5 text-[#26b99a] hover:bg-emerald-50 rounded transition-colors"
                    title="View Album"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete Album"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Create New Photo Album</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="e.g. Science Fair 2026"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-[#26b99a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={albumCategory}
                    onChange={(e) => setAlbumCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Annual Function">Annual Function</option>
                    <option value="Sports">Sports</option>
                    <option value="Celebrations">Celebrations</option>
                    <option value="Academics">Academics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={albumDate}
                    onChange={(e) => setAlbumDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Album Cover Photo</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg p-3 text-center cursor-pointer bg-slate-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-600 font-semibold text-xs">
                    Choose Cover Image (JPG, PNG)
                  </span>
                </div>
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
                  Create & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Album Preview Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedAlbum.title}</h3>
                <span className="text-[10px] text-slate-400">{selectedAlbum.eventDate} • {selectedAlbum.category}</span>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg overflow-hidden max-h-96">
              <img
                src={selectedAlbum.coverUrl}
                alt={selectedAlbum.title}
                className="w-full h-auto object-contain max-h-80 mx-auto"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Total {selectedAlbum.photoCount} high-resolution photographs in this album
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700 flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Upload Photos</span>
                </button>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="px-4 py-1.5 bg-[#26b99a] text-white rounded font-bold"
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

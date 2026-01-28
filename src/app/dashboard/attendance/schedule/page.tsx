"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Calendar, Plus, Filter, Users, Clock } from "lucide-react";

export default function AttendanceSchedulePage() {
  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Jadwal Absensi</h2>
                <p className="mt-1 text-cyan-100">
                  Atur jadwal dan waktu absensi
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-cyan-600 shadow-lg transition-all hover:bg-white/90">
              <Plus className="h-5 w-5" />
              Tambah Jadwal
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-cyan-600" />
                Kelas
              </label>
              <select className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Semua Kelas</option>
              </select>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4 text-sky-600" />
                Hari
              </label>
              <select className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Semua Hari</option>
                <option value="senin">Senin</option>
                <option value="selasa">Selasa</option>
                <option value="rabu">Rabu</option>
                <option value="kamis">Kamis</option>
                <option value="jumat">Jumat</option>
                <option value="sabtu">Sabtu</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-cyan-100 p-2">
              <Clock className="h-5 w-5 text-cyan-600" />
            </div>
            <CardTitle>Daftar Jadwal Absensi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gray-100 p-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <p className="font-medium">Belum ada jadwal absensi</p>
            <p className="mt-2 text-sm">Tambah jadwal baru untuk memulai</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

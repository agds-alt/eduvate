"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

export default function ReportCardsPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Raport Siswa</h2>
          <p className="text-muted-foreground">
            Kelola dan cetak raport siswa
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          + Generate Raport
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">Semua Kelas</option>
                <option value="1">Kelas 1</option>
                <option value="2">Kelas 2</option>
                <option value="3">Kelas 3</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">Pilih Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Tahun Ajaran</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Raport Selesai</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-muted-foreground">Dalam Proses</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Sudah Dicetak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Sudah Diterima</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Raport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📋</div>
            <p>Belum ada data raport</p>
            <p className="text-sm mt-2">Pilih kelas dan semester untuk melihat raport</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

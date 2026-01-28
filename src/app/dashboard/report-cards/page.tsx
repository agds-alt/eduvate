"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { FileText, Plus, Filter, CheckCircle2, Clock, Printer, Send, ClipboardList } from "lucide-react";

export default function ReportCardsPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Raport Siswa</h2>
                <p className="mt-1 text-purple-100">
                  Kelola dan cetak raport siswa
                </p>
              </div>
            </div>
            <Button className="bg-white text-purple-600 hover:bg-white/90 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Generate Raport
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-2">
              <Filter className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle>Filter Raport</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
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
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
              >
                <option value="">Pilih Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Tahun Ajaran</label>
              <select className="w-full rounded-lg border border-input bg-background px-4 py-2">
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Raport Selesai
                </p>
                <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
              </div>
              <div className="rounded-full bg-purple-100 p-4">
                <CheckCircle2 className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dalam Proses
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">0</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sudah Dicetak
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">0</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <Printer className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sudah Diterima
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Send className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards List */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-100 p-2">
              <ClipboardList className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle>Daftar Raport</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gray-100 p-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <p className="font-medium">Belum ada data raport</p>
            <p className="mt-2 text-sm">Pilih kelas dan semester untuk melihat raport</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

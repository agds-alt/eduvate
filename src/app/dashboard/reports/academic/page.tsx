"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AcademicReportPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rekap Akademik</h2>
          <p className="text-muted-foreground">Laporan prestasi dan nilai akademik</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Export Laporan
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Kelas</option>
                <option value="1">Kelas 1</option>
                <option value="2">Kelas 2</option>
                <option value="3">Kelas 3</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Mata Pelajaran</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Mapel</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Semester</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Nilai Tertinggi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-muted-foreground">Nilai Terendah</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">0%</div>
              <p className="text-sm text-muted-foreground">Tingkat Kelulusan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📊</div>
              <p>Grafik distribusi nilai akan ditampilkan di sini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Antar Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📈</div>
              <p>Grafik perbandingan akan ditampilkan di sini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Rekap Akademik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📚</div>
            <p>Pilih filter untuk melihat rekap akademik</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

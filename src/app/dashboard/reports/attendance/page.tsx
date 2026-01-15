"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AttendanceReportPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rekap Absensi</h2>
          <p className="text-muted-foreground">Laporan kehadiran siswa dan guru</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Export Laporan
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Tipe</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="siswa">Siswa</option>
                <option value="guru">Guru/Staff</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Periode</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="semester">Semester</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Bulan</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Pilih Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0%</div>
              <p className="text-sm text-muted-foreground">Rata-rata Kehadiran</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Total Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-muted-foreground">Total Izin/Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">0</div>
              <p className="text-sm text-muted-foreground">Total Alpa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📊</div>
              <p>Grafik kehadiran akan ditampilkan di sini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📈</div>
              <p>Tren kehadiran akan ditampilkan di sini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Rekap Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📄</div>
            <p>Pilih periode untuk melihat rekap absensi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

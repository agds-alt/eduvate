"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function DailyLogPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Log Absensi Harian</h2>
          <p className="text-muted-foreground">Rekap absensi per hari</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Export Excel
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Kelas</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
                Filter
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-muted-foreground">Izin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">0</div>
              <p className="text-sm text-muted-foreground">Alpa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Absensi Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📄</div>
            <p>Pilih tanggal untuk melihat log absensi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AttendanceManualPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Absensi Manual</h2>
          <p className="text-muted-foreground">Input absensi siswa secara manual</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Simpan Absensi
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Pilih Kelas</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Mata Pelajaran</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Pilih Mata Pelajaran</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">✍️</div>
            <p>Pilih kelas untuk mulai absensi manual</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AttendanceSettingsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pengaturan Absensi</h2>
          <p className="text-muted-foreground">Konfigurasi sistem absensi sekolah</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Simpan Pengaturan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waktu Absensi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">⚙️</div>
              <p>Pengaturan waktu absensi</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metode Absensi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📱</div>
              <p>Pilih metode absensi yang digunakan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

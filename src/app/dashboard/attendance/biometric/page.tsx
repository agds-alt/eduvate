"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AttendanceBiometricPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Absensi Biometrik</h2>
          <p className="text-muted-foreground">Sistem absensi menggunakan sidik jari atau wajah</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Sinkronisasi Perangkat
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Perangkat Terhubung</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Absensi Hari Ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Data Biometrik Terdaftar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Absensi Biometrik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">👆</div>
            <p>Belum ada log absensi biometrik</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

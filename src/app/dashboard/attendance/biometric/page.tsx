"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Fingerprint, RefreshCw, Cpu, CheckCircle2, Database, ClipboardList } from "lucide-react";

export default function AttendanceBiometricPage() {
  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Fingerprint className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Absensi Biometrik</h2>
                <p className="mt-1 text-cyan-100">
                  Sistem absensi menggunakan sidik jari atau wajah
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-cyan-600 shadow-lg transition-all hover:bg-white/90">
              <RefreshCw className="h-5 w-5" />
              Sinkronisasi Perangkat
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card className="overflow-hidden border-l-4 border-l-cyan-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Perangkat Terhubung
                </p>
                <p className="mt-2 text-3xl font-bold">0</p>
              </div>
              <div className="rounded-full bg-cyan-100 p-4">
                <Cpu className="h-7 w-7 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Absensi Hari Ini
                </p>
                <p className="mt-2 text-3xl font-bold">0</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data Biometrik Terdaftar
                </p>
                <p className="mt-2 text-3xl font-bold">0</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Database className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-cyan-100 p-2">
              <ClipboardList className="h-5 w-5 text-cyan-600" />
            </div>
            <CardTitle>Log Absensi Biometrik</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gray-100 p-6">
                <Fingerprint className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <p className="font-medium">Belum ada log absensi biometrik</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { QrCode, Camera, ClipboardList } from "lucide-react";

export default function AttendanceScanPage() {
  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <QrCode className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Scan Absensi</h2>
              <p className="mt-1 text-cyan-100">
                Scan QR Code atau Barcode untuk absensi
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-cyan-100 p-2">
                <Camera className="h-5 w-5 text-cyan-600" />
              </div>
              <CardTitle>Scanner</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gray-100 p-6">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Aktifkan kamera untuk scan QR Code</p>
              <button className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white transition-all hover:bg-primary/90 mx-auto">
                <Camera className="h-4 w-4" />
                Buka Scanner
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-sky-100 p-2">
                <ClipboardList className="h-5 w-5 text-sky-600" />
              </div>
              <CardTitle>Riwayat Scan Hari Ini</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gray-100 p-6">
                  <ClipboardList className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Belum ada absensi hari ini</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

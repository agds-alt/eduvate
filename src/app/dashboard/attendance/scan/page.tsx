"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AttendanceScanPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Scan Absensi</h2>
          <p className="text-muted-foreground">Scan QR Code atau Barcode untuk absensi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📱</div>
              <p>Aktifkan kamera untuk scan QR Code</p>
              <button className="mt-4 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90">
                Buka Scanner
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Scan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📄</div>
              <p>Belum ada absensi hari ini</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

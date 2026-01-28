"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Clock, Scan, Fingerprint, HandMetal, CheckCircle, Settings } from "lucide-react";

export default function AttendanceSettingsPage() {
  // Dummy settings state - in production this would come from API
  const [settings, setSettings] = useState({
    checkInTime: "07:00",
    checkOutTime: "15:00",
    lateTolerance: 15,
    enableManual: true,
    enableScanner: false,
    enableBiometric: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Pengaturan berhasil disimpan");
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Pengaturan Absensi</h2>
                <p className="mt-1 text-cyan-100">
                  Konfigurasi sistem absensi sekolah
                </p>
              </div>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-white text-cyan-600 hover:bg-white/90 shadow-lg"
            >
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Waktu Absensi
            </CardTitle>
            <CardDescription>Atur waktu check-in dan check-out standar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Waktu Masuk</label>
              <input
                type="time"
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={settings.checkInTime}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Waktu Keluar</label>
              <input
                type="time"
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={settings.checkOutTime}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Toleransi Keterlambatan (menit)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={settings.lateTolerance}
                onChange={(e) => setSettings({ ...settings, lateTolerance: parseInt(e.target.value) })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Siswa yang datang {settings.lateTolerance} menit setelah waktu masuk akan ditandai terlambat
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Sistem</CardTitle>
            <CardDescription>Informasi konfigurasi saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Jam Operasional</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.checkInTime} - {settings.checkOutTime}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Toleransi Keterlambatan</p>
                  <p className="text-sm text-muted-foreground">{settings.lateTolerance} menit</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Metode Aktif</p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      settings.enableManual && "Manual",
                      settings.enableScanner && "Scanner",
                      settings.enableBiometric && "Biometric",
                    ]
                      .filter(Boolean)
                      .join(", ") || "Tidak ada"}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metode Absensi</CardTitle>
          <CardDescription>Aktifkan metode absensi yang ingin digunakan di sekolah</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                settings.enableManual
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleToggle("enableManual")}
            >
              <div className="mb-4 flex items-center justify-between">
                <HandMetal className="h-8 w-8 text-primary" />
                {settings.enableManual && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <h3 className="mb-2 font-semibold">Absensi Manual</h3>
              <p className="text-sm text-muted-foreground">
                Guru mengisi absensi siswa secara manual melalui form
              </p>
            </div>

            <div
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                settings.enableScanner
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleToggle("enableScanner")}
            >
              <div className="mb-4 flex items-center justify-between">
                <Scan className="h-8 w-8 text-primary" />
                {settings.enableScanner && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <h3 className="mb-2 font-semibold">Scan QR/Barcode</h3>
              <p className="text-sm text-muted-foreground">
                Siswa melakukan scan kartu dengan QR code atau barcode
              </p>
            </div>

            <div
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                settings.enableBiometric
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleToggle("enableBiometric")}
            >
              <div className="mb-4 flex items-center justify-between">
                <Fingerprint className="h-8 w-8 text-primary" />
                {settings.enableBiometric && <CheckCircle className="h-5 w-5 text-primary" />}
              </div>
              <h3 className="mb-2 font-semibold">Biometrik</h3>
              <p className="text-sm text-muted-foreground">
                Absensi menggunakan sidik jari atau pengenalan wajah
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tips:</strong> Anda dapat mengaktifkan beberapa metode sekaligus. Sistem akan
              mencatat metode yang digunakan untuk setiap absensi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function BiometricDataPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Kelola Data Biometrik</h2>
          <p className="text-muted-foreground">Pendaftaran dan pengelolaan data biometrik siswa</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          + Daftar Biometrik Baru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Total Terdaftar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Sidik Jari</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Pengenalan Wajah</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Data Biometrik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">🔐</div>
            <p>Belum ada data biometrik terdaftar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

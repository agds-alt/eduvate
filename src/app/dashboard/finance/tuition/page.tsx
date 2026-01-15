"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function TuitionPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">SPP / Tagihan Siswa</h2>
          <p className="text-muted-foreground">Kelola pembayaran SPP dan tagihan siswa</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          + Tambah Tagihan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Rp 0</div>
              <p className="text-sm text-muted-foreground">Total Tagihan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Rp 0</div>
              <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">Rp 0</div>
              <p className="text-sm text-muted-foreground">Belum Dibayar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">Rp 0</div>
              <p className="text-sm text-muted-foreground">Terlambat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan SPP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">💰</div>
            <p>Belum ada data tagihan SPP</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

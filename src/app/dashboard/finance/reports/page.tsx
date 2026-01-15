"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function FinanceReportsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Laporan Keuangan</h2>
          <p className="text-muted-foreground">Laporan pemasukan dan pengeluaran sekolah</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Export Laporan
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Periode</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Pilih Periode</option>
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Bulan</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Pilih Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Rp 0</div>
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">Rp 0</div>
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Rp 0</div>
              <p className="text-sm text-muted-foreground">Saldo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📈</div>
              <p>Grafik pemasukan belum tersedia</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grafik Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📉</div>
              <p>Grafik pengeluaran belum tersedia</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

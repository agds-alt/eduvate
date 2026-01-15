"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function InformationPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Informasi & Pengumuman</h2>
          <p className="text-muted-foreground">Kelola informasi dan pengumuman sekolah</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          + Buat Pengumuman
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Total Pengumuman</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-muted-foreground">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Minggu Ini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Kategori</option>
                <option value="umum">Umum</option>
                <option value="akademik">Akademik</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="penting">Penting</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="draft">Draft</option>
                <option value="arsip">Arsip</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Urutan</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengumuman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📢</div>
            <p>Belum ada pengumuman</p>
            <p className="text-sm mt-2">Buat pengumuman untuk memulai</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

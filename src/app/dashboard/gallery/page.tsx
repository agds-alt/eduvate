"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function GalleryPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Galeri Foto & Video</h2>
          <p className="text-muted-foreground">Kelola foto dan video kegiatan sekolah</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
          + Upload Media
        </button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Kategori</option>
                <option value="kegiatan">Kegiatan Sekolah</option>
                <option value="lomba">Lomba</option>
                <option value="upacara">Upacara</option>
                <option value="ekstrakurikuler">Ekstrakurikuler</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Jenis</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Jenis</option>
                <option value="foto">Foto</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Tahun</option>
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
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Total Media</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-muted-foreground">Foto</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-muted-foreground">Video</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galeri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-4">📷</div>
            <p>Belum ada media di galeri</p>
            <p className="text-sm mt-2">Upload foto atau video untuk memulai</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

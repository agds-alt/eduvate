"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

export default function SchoolProfilePage() {
  const { data: school, isLoading } = api.school.getProfile.useQuery();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">School not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Profil Sekolah</h2>
          <p className="text-muted-foreground">
            Kelola informasi profil sekolah Anda
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          {isEditing ? "Batal" : "Edit Profil"}
        </button>
      </div>

      {/* School Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Sekolah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Nama Sekolah
              </label>
              <p className="mt-1 text-lg font-semibold">{school.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">NPSN</label>
              <p className="mt-1 text-lg">{school.npsn || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1 text-lg">{school.email || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Telepon
              </label>
              <p className="mt-1 text-lg">{school.phone || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Alamat</label>
              <p className="mt-1 text-lg">{school.address || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Website
              </label>
              <p className="mt-1 text-lg">
                {school.website ? (
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {school.website}
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                    school.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {school.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                </span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Kuota Pengguna
              </label>
              <p className="mt-1 text-lg">
                {school.activeUsers} / {school.quota} pengguna
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Tanggal Kadaluarsa
              </label>
              <p className="mt-1 text-lg">
                {school.expiresAt
                  ? new Date(school.expiresAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Tidak terbatas"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Fitur Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Manajemen Siswa</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Manajemen Guru</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Absensi</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Keuangan</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Ujian</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Raport</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Laporan</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

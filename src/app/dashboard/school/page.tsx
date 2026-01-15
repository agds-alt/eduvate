"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Calendar,
  Award,
  Target,
  Eye,
  Lightbulb,
  School,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle
} from "lucide-react";

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
    <div className="space-y-6">
      {/* Header with School Banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* School Logo Placeholder */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <School className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{school.name}</h1>
                <p className="mt-2 text-blue-100">
                  {school.npsn ? `NPSN: ${school.npsn}` : "Sekolah Indonesia"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant={school.status === "ACTIVE" ? "default" : "destructive"}
                    className="bg-white/20 backdrop-blur-sm"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {school.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur-sm">
                    <Award className="mr-1 h-3 w-3" />
                    Terakreditasi A
                  </Badge>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-indigo-600 transition-all hover:bg-white/90"
            >
              {isEditing ? "Batal" : "Edit Profil"}
            </button>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white"></div>
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Siswa
                </p>
                <p className="text-3xl font-bold">250</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  +12 tahun ini
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Guru
                </p>
                <p className="text-3xl font-bold">45</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  28 guru tetap
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Jumlah Kelas
                </p>
                <p className="text-3xl font-bold">18</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  6 rombongan belajar
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tahun Berdiri
                </p>
                <p className="text-3xl font-bold">1985</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  39 tahun beroperasi
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Alamat
                    </p>
                    <p className="mt-1">{school.address || "Belum diisi"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1">{school.email || "Belum diisi"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Telepon
                    </p>
                    <p className="mt-1">{school.phone || "Belum diisi"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Website
                    </p>
                    <p className="mt-1">
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
                        "Belum diisi"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vision & Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visi & Misi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold">Visi</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Menjadi lembaga pendidikan yang unggul, berkarakter, dan
                    berwawasan global, serta mampu mencetak generasi yang
                    berakhlak mulia dan berprestasi.
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-orange-600" />
                    <h3 className="font-semibold">Misi</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>
                        Menyelenggarakan pendidikan yang berkualitas dan
                        berstandar nasional
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>
                        Membentuk karakter siswa yang berakhlak mulia dan
                        bertanggung jawab
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>
                        Mengembangkan potensi akademik dan non-akademik siswa
                        secara optimal
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      <span>
                        Menciptakan lingkungan belajar yang kondusif dan
                        menyenangkan
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fasilitas */}
          <Card>
            <CardHeader>
              <CardTitle>Fasilitas Sekolah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Ruang Kelas Ber-AC",
                  "Laboratorium Komputer",
                  "Laboratorium Sains",
                  "Perpustakaan Digital",
                  "Lapangan Olahraga",
                  "Kantin",
                  "Masjid",
                  "Ruang Multimedia",
                  "Wifi Area",
                  "Parkir Luas",
                  "UKS",
                  "Ruang Konseling",
                ].map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{facility}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status Akun
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      school.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {school.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Kuota Pengguna
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{school.activeUsers} / {school.quota}</span>
                    <span className="text-muted-foreground">
                      {Math.round((school.activeUsers / school.quota) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600"
                      style={{
                        width: `${(school.activeUsers / school.quota) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Berlaku Hingga
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {school.expiresAt
                    ? new Date(school.expiresAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Tidak terbatas"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Jam Operasional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jam Operasional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Senin - Jumat</span>
                <span className="font-medium">07:00 - 16:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sabtu</span>
                <span className="font-medium">07:00 - 12:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minggu</span>
                <span className="font-medium text-red-600">Libur</span>
              </div>
            </CardContent>
          </Card>

          {/* Ekstrakurikuler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ekstrakurikuler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Pramuka",
                  "Basket",
                  "Futsal",
                  "Voli",
                  "Tari",
                  "Paduan Suara",
                  "PMR",
                  "Robotika",
                  "English Club",
                  "Seni Rupa",
                ].map((ekskul) => (
                  <Badge key={ekskul} variant="secondary">
                    {ekskul}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  School,
  BarChart3,
  UserCheck,
  UsersRound,
  BookOpen,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  MapPin,
  Bell,
  Palmtree,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

// Loading Skeleton Components
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  // Fetch all data in parallel for better performance
  const { data: dashboardData, isLoading: isDashboardLoading } = api.dashboard.getStats.useQuery();
  const { data: comprehensiveStats, isLoading: isComprehensiveLoading } =
    api.dashboard.getComprehensiveStats.useQuery();
  const { data: attendanceSummary, isLoading: isAttendanceLoading } =
    api.dashboard.getAttendanceSummary.useQuery();
  const { data: recentStudents, isLoading: isStudentsLoading } =
    api.dashboard.getRecentStudents.useQuery({ limit: 5 });

  // Memoize currency formatter
  const formatCurrency = useMemo(
    () => (amount: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount),
    []
  );

  const isMainLoading = isDashboardLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <School className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {isMainLoading ? (
                  <Skeleton className="h-9 w-64 bg-white/20" />
                ) : (
                  `Dashboard ${dashboardData?.school?.name ?? ""}`
                )}
              </h2>
              <p className="mt-1 text-blue-100">
                {isMainLoading ? (
                  <Skeleton className="h-5 w-96 bg-white/20" />
                ) : (
                  `Selamat datang kembali! Berikut ringkasan aktivitas hari ini.`
                )}
              </p>
            </div>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Information & Announcements - Moved to Top */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-100 p-2">
              <Bell className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle className="text-lg font-semibold">Informasi & Pengumuman</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isComprehensiveLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : comprehensiveStats?.recentInformation && comprehensiveStats.recentInformation.length > 0 ? (
            <div className="space-y-4">
              {comprehensiveStats.recentInformation.map((info) => (
                <div key={info.id} className="rounded-lg border border-orange-200 p-4 transition-colors hover:bg-orange-50/50">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-orange-100 p-2">
                      <Bell className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900">{info.title}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                        {info.content}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {info.publishedAt
                          ? new Date(info.publishedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Belum dipublikasi"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p>Tidak ada informasi tersedia</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Calendar */}
      <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-indigo-100 p-2">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-lg font-semibold">Kalender Akademik</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isComprehensiveLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : comprehensiveStats?.upcomingEvents && comprehensiveStats.upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {comprehensiveStats.upcomingEvents.map((event) => (
                <div key={event.id} className="rounded-lg border border-indigo-200 p-4 transition-colors hover:bg-indigo-50/50">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-indigo-100 p-2">
                      <CalendarDays className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-indigo-900">{event.title}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                        {event.description || "Tidak ada deskripsi"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {event.endDate && event.endDate !== event.startDate && (
                            <span>
                              {" - "}
                              {new Date(event.endDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </p>
                        {event.location && (
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <CalendarDays className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p>Tidak ada acara akademik mendatang</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Aksi Cepat</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <Link
              href="/dashboard/students"
              className="group flex flex-col items-center rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 rounded-full bg-blue-100 p-3 transition-colors group-hover:bg-blue-200">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-center text-sm font-medium">Data Siswa</span>
            </Link>
            <Link
              href="/dashboard/teachers"
              className="group flex flex-col items-center rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 rounded-full bg-green-100 p-3 transition-colors group-hover:bg-green-200">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-center text-sm font-medium">Data Guru</span>
            </Link>
            <Link
              href="/dashboard/attendance/manual"
              className="group flex flex-col items-center rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 rounded-full bg-purple-100 p-3 transition-colors group-hover:bg-purple-200">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-center text-sm font-medium">Absensi</span>
            </Link>
            <Link
              href="/dashboard/exams"
              className="group flex flex-col items-center rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 rounded-full bg-orange-100 p-3 transition-colors group-hover:bg-orange-200">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-center text-sm font-medium">Ujian</span>
            </Link>
            <Link
              href="/dashboard/finance/tuition"
              className="group flex flex-col items-center rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 rounded-full bg-emerald-100 p-3 transition-colors group-hover:bg-emerald-200">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-center text-sm font-medium">Keuangan</span>
            </Link>
            <Link
              href="/dashboard/agenda"
              className="group flex flex-col items-center rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 rounded-full bg-indigo-100 p-3 transition-colors group-hover:bg-indigo-200">
                <CalendarDays className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-center text-sm font-medium">Agenda</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards - 8 Cards with Loading States */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isMainLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            {/* Teachers */}
            <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Guru</p>
                    <p className="mt-2 text-3xl font-bold">{dashboardData?.stats.teachers ?? 0}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Guru aktif</p>
                  </div>
                  <div className="rounded-full bg-green-100 p-4">
                    <Users className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students */}
            <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Siswa</p>
                    <p className="mt-2 text-3xl font-bold">{dashboardData?.stats.students ?? 0}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Siswa aktif</p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-4">
                    <GraduationCap className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classes */}
            <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Kelas</p>
                    <p className="mt-2 text-3xl font-bold">{dashboardData?.stats.classes ?? 0}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Kelas aktif</p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-4">
                    <School className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Today */}
            <Card className="overflow-hidden border-l-4 border-l-orange-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Absensi Hari Ini</p>
                    <p className="mt-2 text-3xl font-bold">{dashboardData?.attendanceRate ?? 0}%</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dashboardData?.stats.attendanceToday ?? 0} catatan
                    </p>
                  </div>
                  <div className="rounded-full bg-orange-100 p-4">
                    <BarChart3 className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alumni */}
            <Card className="overflow-hidden border-l-4 border-l-indigo-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alumni</p>
                    <p className="mt-2 text-3xl font-bold">
                      {isComprehensiveLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        comprehensiveStats?.alumni ?? 0
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Total lulusan</p>
                  </div>
                  <div className="rounded-full bg-indigo-100 p-4">
                    <GraduationCap className="h-7 w-7 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parents */}
            <Card className="overflow-hidden border-l-4 border-l-teal-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wali Murid</p>
                    <p className="mt-2 text-3xl font-bold">
                      {isComprehensiveLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        comprehensiveStats?.parents ?? 0
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Orang tua terdaftar</p>
                  </div>
                  <div className="rounded-full bg-teal-100 p-4">
                    <UsersRound className="h-7 w-7 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card className="overflow-hidden border-l-4 border-l-pink-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mata Pelajaran</p>
                    <p className="mt-2 text-3xl font-bold">
                      {isComprehensiveLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        comprehensiveStats?.subjects ?? 0
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Mapel aktif</p>
                  </div>
                  <div className="rounded-full bg-pink-100 p-4">
                    <BookOpen className="h-7 w-7 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exam Average */}
            <Card className="overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                    <p className="mt-2 text-3xl font-bold">
                      {isComprehensiveLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        comprehensiveStats?.examResults.avgScore ?? 0
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {comprehensiveStats?.examResults.totalResults ?? 0} hasil ujian
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-4">
                    <TrendingUp className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Finance Summary */}
      {isComprehensiveLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-6 w-32" />
                <Skeleton className="mb-2 h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        comprehensiveStats?.financeStats && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-900">Total Pendapatan</p>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-green-700">
                      {formatCurrency(comprehensiveStats.financeStats.paidAmount)}
                    </p>
                    <p className="mt-1 text-xs text-green-600">Dari tagihan terbayar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-orange-100 p-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-sm font-medium text-orange-900">Belum Dibayar</p>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-orange-700">
                      {formatCurrency(comprehensiveStats.financeStats.unpaidAmount)}
                    </p>
                    <p className="mt-1 text-xs text-orange-600">Tagihan outstanding</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-blue-900">Total Tagihan</p>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-blue-700">
                      {comprehensiveStats.financeStats.totalBills}
                    </p>
                    <p className="mt-1 text-xs text-blue-600">Semua tagihan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-base">Ringkasan Absensi Hari Ini</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isAttendanceLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                ))}
              </div>
            ) : attendanceSummary && attendanceSummary.length > 0 ? (
              <div className="space-y-3">
                {attendanceSummary.map((item) => {
                  const getStatusIcon = () => {
                    switch (item.status) {
                      case "PRESENT":
                        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
                      case "ABSENT":
                        return <AlertCircle className="h-5 w-5 text-red-600" />;
                      case "LATE":
                        return <Clock className="h-5 w-5 text-yellow-600" />;
                      case "SICK":
                        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
                      case "PERMISSION":
                        return <FileText className="h-5 w-5 text-blue-600" />;
                      case "EXCUSED":
                        return <AlertCircle className="h-5 w-5 text-gray-600" />;
                      default:
                        return null;
                    }
                  };

                  const getStatusLabel = () => {
                    switch (item.status) {
                      case "PRESENT":
                        return "Hadir";
                      case "ABSENT":
                        return "Tidak Hadir";
                      case "LATE":
                        return "Terlambat";
                      case "SICK":
                        return "Sakit";
                      case "PERMISSION":
                        return "Izin";
                      case "EXCUSED":
                        return "Alfa";
                      default:
                        return item.status;
                    }
                  };

                  return (
                    <div key={item.status} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                      <span className="flex items-center gap-3 text-sm font-medium">
                        {getStatusIcon()}
                        {getStatusLabel()}
                      </span>
                      <span className="text-2xl font-bold">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada catatan absensi hari ini
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Ujian Mendatang</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isComprehensiveLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : comprehensiveStats?.upcomingExams && comprehensiveStats.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {comprehensiveStats.upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-purple-100 p-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{exam.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {exam.subject.name} • {exam.class.name} {exam.class.section}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(exam.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada ujian mendatang
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-indigo-100 p-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-base">Siswa Terbaru</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isStudentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : recentStudents && recentStudents.length > 0 ? (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-indigo-100 p-2">
                        <GraduationCap className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{student.user.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {student.currentClass?.name || "Belum ada kelas"} • {student.nis}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada siswa terbaru
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Holidays */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-teal-100 p-2">
              <Palmtree className="h-5 w-5 text-teal-600" />
            </div>
            <CardTitle className="text-base">Hari Libur Mendatang</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
            {isComprehensiveLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : comprehensiveStats?.upcomingHolidays && comprehensiveStats.upcomingHolidays.length > 0 ? (
              <div className="space-y-4">
                {comprehensiveStats.upcomingHolidays.map((holiday) => (
                  <div key={holiday.id} className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-teal-100 p-2">
                          <Palmtree className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{holiday.name}</h4>
                          {holiday.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{holiday.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                        <Calendar className="h-3 w-3" />
                        {new Date(holiday.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada libur mendatang
              </p>
            )}
        </CardContent>
      </Card>

      {/* Upcoming Agenda */}
      {!isMainLoading && dashboardData?.upcomingAgenda && dashboardData.upcomingAgenda.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-indigo-100 p-2">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-base">Agenda Sekolah</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingAgenda.map((agenda) => (
                <div
                  key={agenda.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-indigo-100 p-3">
                      <CalendarDays className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{agenda.title}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(agenda.startDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {agenda.endDate &&
                            ` - ${new Date(agenda.endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`}
                        </span>
                        {agenda.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {agenda.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Alert */}
      {!isMainLoading && dashboardData?.unpaidBills && dashboardData.unpaidBills > 0 && (
        <Card className="overflow-hidden border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-orange-100 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">Tagihan Belum Dibayar</h4>
                <p className="mt-1 text-sm text-orange-700">
                  Ada <span className="font-semibold">{dashboardData.unpaidBills} tagihan</span> yang
                  belum dibayar. Segera lakukan pembayaran!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

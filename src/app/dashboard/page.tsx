"use client";

import Link from "next/link";
import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = api.dashboard.getStats.useQuery();
  const { data: comprehensiveStats } = api.dashboard.getComprehensiveStats.useQuery();
  const { data: attendanceSummary } = api.dashboard.getAttendanceSummary.useQuery();
  const { data: recentStudents } = api.dashboard.getRecentStudents.useQuery({ limit: 5 });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">No school data found</div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back to {dashboardData.school.name}! Here's what's happening today.
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <Link
              href="/dashboard/students"
              className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-2xl">👨‍🎓</div>
              <span className="text-center text-sm font-medium">Data Siswa</span>
            </Link>
            <Link
              href="/dashboard/teachers"
              className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-2xl">👨‍🏫</div>
              <span className="text-center text-sm font-medium">Data Guru</span>
            </Link>
            <Link
              href="/dashboard/attendance/manual"
              className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-2xl">✅</div>
              <span className="text-center text-sm font-medium">Absensi</span>
            </Link>
            <Link
              href="/dashboard/exams"
              className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-2xl">📝</div>
              <span className="text-center text-sm font-medium">Ujian</span>
            </Link>
            <Link
              href="/dashboard/finance/tuition"
              className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-2xl">💰</div>
              <span className="text-center text-sm font-medium">Keuangan</span>
            </Link>
            <Link
              href="/dashboard/agenda"
              className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-2xl">📅</div>
              <span className="text-center text-sm font-medium">Agenda</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards - 8 Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Teachers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <div className="text-2xl">👨‍🏫</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.teachers}</div>
            <p className="text-xs text-muted-foreground">Active teachers</p>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <div className="text-2xl">👨‍🎓</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.students}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        {/* Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <div className="text-2xl">🏫</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.classes}</div>
            <p className="text-xs text-muted-foreground">Active classes</p>
          </CardContent>
        </Card>

        {/* Attendance Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absensi Hari Ini</CardTitle>
            <div className="text-2xl">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.stats.attendanceToday} records
            </p>
          </CardContent>
        </Card>

        {/* Alumni */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumni</CardTitle>
            <div className="text-2xl">🎓</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comprehensiveStats?.alumni ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total graduates</p>
          </CardContent>
        </Card>

        {/* Parents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wali Murid</CardTitle>
            <div className="text-2xl">👨‍👩‍👧</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comprehensiveStats?.parents ?? 0}</div>
            <p className="text-xs text-muted-foreground">Registered parents</p>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
            <div className="text-2xl">📚</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comprehensiveStats?.subjects ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active subjects</p>
          </CardContent>
        </Card>

        {/* Exam Average */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <div className="text-2xl">📈</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comprehensiveStats?.examResults.avgScore ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {comprehensiveStats?.examResults.totalResults ?? 0} exam results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Summary */}
      {comprehensiveStats?.financeStats && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-900">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(comprehensiveStats.financeStats.paidAmount)}
              </div>
              <p className="text-xs text-green-600">From paid bills</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-orange-900">
                Belum Dibayar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                {formatCurrency(comprehensiveStats.financeStats.unpaidAmount)}
              </div>
              <p className="text-xs text-orange-600">Outstanding bills</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-900">Total Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {comprehensiveStats.financeStats.totalBills}
              </div>
              <p className="text-xs text-blue-600">All time bills</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Three Column Layout */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceSummary && attendanceSummary.length > 0 ? (
              <div className="space-y-4">
                {attendanceSummary.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="flex items-center text-sm font-medium">
                      <span className="mr-2">
                        {item.status === "PRESENT" && "✅"}
                        {item.status === "ABSENT" && "❌"}
                        {item.status === "LATE" && "⏰"}
                        {item.status === "SICK" && "🤒"}
                        {item.status === "PERMISSION" && "📝"}
                        {item.status === "EXCUSED" && "📋"}
                      </span>
                      {item.status === "PRESENT" && "Hadir"}
                      {item.status === "ABSENT" && "Tidak Hadir"}
                      {item.status === "LATE" && "Terlambat"}
                      {item.status === "SICK" && "Sakit"}
                      {item.status === "PERMISSION" && "Izin"}
                      {item.status === "EXCUSED" && "Alfa"}
                    </span>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No attendance records for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Ujian Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            {comprehensiveStats?.upcomingExams &&
            comprehensiveStats.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {comprehensiveStats.upcomingExams.map((exam) => (
                  <div key={exam.id} className="border-b pb-3 last:border-0">
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {exam.subject.name} • {exam.class.name} {exam.class.section}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exam.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No upcoming exams</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle>Siswa Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents && recentStudents.length > 0 ? (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <div key={student.id} className="border-b pb-3 last:border-0">
                    <p className="font-medium">{student.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.currentClass?.name || "No class"} • {student.nis}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No recent students</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Information Board */}
        <Card>
          <CardHeader>
            <CardTitle>📢 Informasi & Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            {comprehensiveStats?.recentInformation &&
            comprehensiveStats.recentInformation.length > 0 ? (
              <div className="space-y-4">
                {comprehensiveStats.recentInformation.map((info) => (
                  <div key={info.id} className="border-b pb-4 last:border-0">
                    <h4 className="font-medium">{info.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {info.content}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {info.publishedAt
                        ? new Date(info.publishedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not published"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Holidays */}
        <Card>
          <CardHeader>
            <CardTitle>🏖️ Hari Libur Mendatang</CardTitle>
          </CardHeader>
          <CardContent>
            {comprehensiveStats?.upcomingHolidays &&
            comprehensiveStats.upcomingHolidays.length > 0 ? (
              <div className="space-y-4">
                {comprehensiveStats.upcomingHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div>
                      <h4 className="font-medium">{holiday.name}</h4>
                      {holiday.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{holiday.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium">
                        {new Date(holiday.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No upcoming holidays</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Agenda */}
      {dashboardData.upcomingAgenda && dashboardData.upcomingAgenda.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📅 Agenda Sekolah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.upcomingAgenda.map((agenda) => (
                <div
                  key={agenda.id}
                  className="flex items-start space-x-4 border-b pb-3 last:border-0"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <div className="text-2xl">🗓️</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{agenda.title}</h4>
                    <p className="text-sm text-muted-foreground">
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
                      {agenda.location && ` • ${agenda.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Alert */}
      {dashboardData.unpaidBills > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <div className="text-2xl">⚠️</div>
              </div>
              <div>
                <h4 className="font-medium text-orange-900">Tagihan Belum Dibayar</h4>
                <p className="text-sm text-orange-700">
                  Ada {dashboardData.unpaidBills} tagihan yang belum dibayar. Segera lakukan
                  pembayaran!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

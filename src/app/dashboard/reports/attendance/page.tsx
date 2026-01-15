"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { id } from "date-fns/locale";
import { Download, TrendingUp } from "lucide-react";

type PeriodType = "bulanan" | "semester" | "tahunan";

export default function AttendanceReportPage() {
  const currentDate = new Date();
  const [reportType, setReportType] = useState<"siswa" | "guru">("siswa");
  const [period, setPeriod] = useState<PeriodType>("bulanan");
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    if (period === "bulanan") {
      return {
        startDate: startOfMonth(new Date(selectedYear, selectedMonth - 1)),
        endDate: endOfMonth(new Date(selectedYear, selectedMonth - 1)),
      };
    } else if (period === "tahunan") {
      return {
        startDate: startOfYear(new Date(selectedYear, 0)),
        endDate: endOfYear(new Date(selectedYear, 0)),
      };
    } else {
      // Semester 1 (Jan-Jun) or Semester 2 (Jul-Dec)
      const isSemester1 = selectedMonth <= 6;
      return {
        startDate: new Date(selectedYear, isSemester1 ? 0 : 6, 1),
        endDate: new Date(selectedYear, isSemester1 ? 5 : 11, 31),
      };
    }
  }, [period, selectedMonth, selectedYear]);

  // Fetch classes
  const { data: classes = [] } = api.class.getAll.useQuery();

  // Fetch attendance records for students
  const { data: studentRecords = [], isLoading: loadingStudents } = api.attendance.getAll.useQuery(
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      classId: selectedClassId || undefined,
    },
    { enabled: reportType === "siswa" }
  );

  // Fetch teacher attendance
  const { data: teacherRecords = [], isLoading: loadingTeachers } =
    api.teacherAttendance.getAll.useQuery(
      {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      { enabled: reportType === "guru" }
    );

  const isLoading = reportType === "siswa" ? loadingStudents : loadingTeachers;
  const records = reportType === "siswa" ? studentRecords : teacherRecords;

  // Calculate statistics
  const stats = useMemo(() => {
    const counts = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      SICK: 0,
      PERMISSION: 0,
      EXCUSED: 0,
    };

    records.forEach((record) => {
      if (counts.hasOwnProperty(record.status)) {
        counts[record.status as keyof typeof counts]++;
      }
    });

    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    const present = counts.PRESENT + counts.LATE;
    const excused = counts.SICK + counts.PERMISSION + counts.EXCUSED;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : "0";

    return {
      ...counts,
      total,
      present,
      excused,
      attendanceRate,
    };
  }, [records]);

  // Group by class for breakdown
  const classSummary = useMemo(() => {
    if (reportType !== "siswa") return [];

    const classMap = new Map<string, {
      className: string;
      present: number;
      late: number;
      absent: number;
      excused: number;
      total: number;
    }>();

    studentRecords.forEach((record) => {
      const className = record.class?.name || "Tidak ada kelas";
      if (!classMap.has(className)) {
        classMap.set(className, {
          className,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
          total: 0,
        });
      }

      const classData = classMap.get(className)!;
      classData.total++;

      if (record.status === "PRESENT") classData.present++;
      else if (record.status === "LATE") classData.late++;
      else if (record.status === "ABSENT") classData.absent++;
      else if (["SICK", "PERMISSION", "EXCUSED"].includes(record.status)) {
        classData.excused++;
      }
    });

    return Array.from(classMap.values()).map((data) => ({
      ...data,
      attendanceRate: data.total > 0
        ? (((data.present + data.late) / data.total) * 100).toFixed(1)
        : "0",
    }));
  }, [reportType, studentRecords]);

  const handleExport = () => {
    const headers = reportType === "siswa"
      ? ["Tanggal", "NIS", "Nama", "Kelas", "Status", "Waktu Masuk", "Waktu Keluar"]
      : ["Tanggal", "NIK", "Nama", "Status", "Waktu Masuk", "Waktu Keluar"];

    const rows = records.map((record: any) => {
      if (reportType === "siswa") {
        return [
          format(new Date(record.date), "dd/MM/yyyy"),
          record.student?.nis || "-",
          record.student?.user.name || "-",
          record.class?.name || "-",
          record.status,
          record.checkIn ? format(new Date(record.checkIn), "HH:mm") : "-",
          record.checkOut ? format(new Date(record.checkOut), "HH:mm") : "-",
        ];
      } else {
        return [
          format(new Date(record.date), "dd/MM/yyyy"),
          record.teacher?.employeeId || "-",
          record.teacher?.user.name || "-",
          record.status,
          record.checkIn ? format(new Date(record.checkIn), "HH:mm") : "-",
          record.checkOut ? format(new Date(record.checkOut), "HH:mm") : "-",
        ];
      }
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `rekap-absensi-${reportType}-${format(dateRange.startDate, "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rekap Absensi</h2>
          <p className="text-muted-foreground">Laporan kehadiran siswa dan guru</p>
        </div>
        <Button onClick={handleExport} disabled={records.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Laporan
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Tipe</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as "siswa" | "guru")}
              >
                <option value="siswa">Siswa</option>
                <option value="guru">Guru/Staff</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Periode</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
              >
                <option value="bulanan">Bulanan</option>
                <option value="semester">Semester</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
            {period === "bulanan" && (
              <div>
                <label className="mb-2 block text-sm font-medium">Bulan</label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-4 py-2"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
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
            )}
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            {reportType === "siswa" && (
              <div>
                <label className="mb-2 block text-sm font-medium">Kelas</label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-4 py-2"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <p className="text-sm text-muted-foreground">Rata-rata Kehadiran</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.present}</div>
              <p className="text-sm text-muted-foreground">Total Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.excused}</div>
              <p className="text-sm text-muted-foreground">Total Izin/Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.ABSENT}</div>
              <p className="text-sm text-muted-foreground">Total Alpa</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Status Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">⏳</div>
                <p>Memuat data...</p>
              </div>
            ) : stats.total === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">📊</div>
                <p>Tidak ada data untuk periode ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">Hadir</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{stats.PRESENT}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((stats.PRESENT / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="font-medium">Terlambat</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{stats.LATE}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((stats.LATE / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="font-medium">Alpa</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{stats.ABSENT}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((stats.ABSENT / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Sakit</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{stats.SICK}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((stats.SICK / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    <span className="font-medium">Izin</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{stats.PERMISSION}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((stats.PERMISSION / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {reportType === "siswa" && (
          <Card>
            <CardHeader>
              <CardTitle>Perbandingan Antar Kelas</CardTitle>
            </CardHeader>
            <CardContent>
              {classSummary.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="mb-4 text-4xl">📈</div>
                  <p>Tidak ada data kelas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classSummary.map((cls) => (
                    <div key={cls.className} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">{cls.className}</span>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-bold">{cls.attendanceRate}%</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${cls.attendanceRate}%` }}
                        />
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>Hadir: {cls.present + cls.late}</span>
                        <span>Izin: {cls.excused}</span>
                        <span>Alpa: {cls.absent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {reportType === "guru" && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Periode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Periode Laporan</p>
                  <p className="mt-1 font-medium">
                    {format(dateRange.startDate, "dd MMMM yyyy", { locale: id })} -{" "}
                    {format(dateRange.endDate, "dd MMMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="mt-1 text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Tipe Laporan</p>
                  <p className="mt-1 font-medium">Guru & Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Rekap Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">📄</div>
              <p>Tidak ada data absensi untuk periode yang dipilih</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Total Records</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Kehadiran</p>
                    <p className="text-xl font-bold text-green-600">{stats.attendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Periode</p>
                    <p className="font-medium capitalize">{period}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipe</p>
                    <p className="font-medium capitalize">{reportType}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Menampilkan {records.length} data absensi dari periode{" "}
                {format(dateRange.startDate, "dd MMM", { locale: id })} -{" "}
                {format(dateRange.endDate, "dd MMM yyyy", { locale: id })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AttendanceStatus } from "@prisma/client";
import { Download, ClipboardList, Calendar, Filter, CheckCircle2, Clock, XCircle, Thermometer, FileText, Shield } from "lucide-react";

export default function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Fetch classes
  const { data: classes = [] } = api.class.getAll.useQuery();

  // Fetch daily attendance log
  const { data: records = [], isLoading } = api.attendance.getDailyLog.useQuery({
    date: new Date(selectedDate),
    classId: selectedClassId || undefined,
  });

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

    return counts;
  }, [records]);

  const getStatusBadge = (status: AttendanceStatus) => {
    const styles = {
      PRESENT: "bg-green-100 text-green-800 border-green-200",
      LATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ABSENT: "bg-red-100 text-red-800 border-red-200",
      SICK: "bg-blue-100 text-blue-800 border-blue-200",
      PERMISSION: "bg-purple-100 text-purple-800 border-purple-200",
      EXCUSED: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const labels = {
      PRESENT: "Hadir",
      LATE: "Terlambat",
      ABSENT: "Alpa",
      SICK: "Sakit",
      PERMISSION: "Izin",
      EXCUSED: "Dispensasi",
    };

    return (
      <span className={`rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleExport = () => {
    // Convert data to CSV format
    const headers = ["No", "Tanggal", "NIS", "Nama Siswa", "Kelas", "Status", "Waktu Masuk", "Waktu Keluar", "Catatan"];
    const rows = records.map((record, index) => [
      index + 1,
      format(new Date(record.date), "dd/MM/yyyy", { locale: id }),
      record.student.nis || "-",
      record.student.user.name,
      record.class?.name || "-",
      record.status,
      record.checkInTime ? format(new Date(record.checkInTime), "HH:mm", { locale: id }) : "-",
      record.checkOutTime ? format(new Date(record.checkOutTime), "HH:mm", { locale: id }) : "-",
      record.notes || "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `absensi-harian-${selectedDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Log Absensi Harian</h2>
                <p className="mt-1 text-cyan-100">
                  Rekap absensi per hari
                </p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={records.length === 0}
              className="bg-white text-cyan-600 hover:bg-white/90 shadow-lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filter Card with Gradient Background */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-cyan-600" />
                Tanggal
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4 text-sky-600" />
                Kelas
              </label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.academicYear}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-green-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.PRESENT}</div>
              <p className="text-xs text-muted-foreground">Hadir</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.LATE}</div>
              <p className="text-xs text-muted-foreground">Terlambat</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-red-500 transition-all hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-red-100 p-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.ABSENT}</div>
              <p className="text-xs text-muted-foreground">Alpa</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-blue-100 p-2">
                <Thermometer className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.SICK}</div>
              <p className="text-xs text-muted-foreground">Sakit</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.PERMISSION}</div>
              <p className="text-xs text-muted-foreground">Izin</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-gray-500 transition-all hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 rounded-full bg-gray-100 p-2">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-600">{stats.EXCUSED}</div>
              <p className="text-xs text-muted-foreground">Dispensasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-cyan-100 p-2">
              <ClipboardList className="h-5 w-5 text-cyan-600" />
            </div>
            <CardTitle>
              Detail Absensi Harian - {format(new Date(selectedDate), "dd MMMM yyyy", { locale: id })}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
              <p>Memuat data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gray-100 p-6">
                  <ClipboardList className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Tidak ada data absensi untuk tanggal ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">NIS</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nama Siswa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Kelas</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Waktu Masuk</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Waktu Keluar</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id} className="border-b transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {record.student.nis || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{record.student.user.name}</td>
                      <td className="px-4 py-3 text-sm">{record.class?.name || "-"}</td>
                      <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {record.checkInTime ? (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              {format(new Date(record.checkInTime), "HH:mm", { locale: id })}
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {record.checkOutTime ? (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              {format(new Date(record.checkOutTime), "HH:mm", { locale: id })}
                            </>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />
                  Total: {records.length} siswa
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

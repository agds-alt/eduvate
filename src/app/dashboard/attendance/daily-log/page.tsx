"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AttendanceStatus } from "@prisma/client";
import { Download } from "lucide-react";

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Log Absensi Harian</h2>
          <p className="text-muted-foreground">Rekap absensi per hari</p>
        </div>
        <Button onClick={handleExport} disabled={records.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal</label>
              <input
                type="date"
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
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
                    {cls.name} - {cls.academicYear}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.PRESENT}</div>
              <p className="text-sm text-muted-foreground">Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.LATE}</div>
              <p className="text-sm text-muted-foreground">Terlambat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.ABSENT}</div>
              <p className="text-sm text-muted-foreground">Alpa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.SICK}</div>
              <p className="text-sm text-muted-foreground">Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.PERMISSION}</div>
              <p className="text-sm text-muted-foreground">Izin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.EXCUSED}</div>
              <p className="text-sm text-muted-foreground">Dispensasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Detail Absensi Harian - {format(new Date(selectedDate), "dd MMMM yyyy", { locale: id })}
          </CardTitle>
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
              <p>Tidak ada data absensi untuk tanggal ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">No</th>
                    <th className="py-3 text-left font-medium">NIS</th>
                    <th className="py-3 text-left font-medium">Nama Siswa</th>
                    <th className="py-3 text-left font-medium">Kelas</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Waktu Masuk</th>
                    <th className="py-3 text-left font-medium">Waktu Keluar</th>
                    <th className="py-3 text-left font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{index + 1}</td>
                      <td className="py-3">{record.student.nis || "-"}</td>
                      <td className="py-3">{record.student.user.name}</td>
                      <td className="py-3">{record.class?.name || "-"}</td>
                      <td className="py-3">{getStatusBadge(record.status)}</td>
                      <td className="py-3">
                        {record.checkInTime
                          ? format(new Date(record.checkInTime), "HH:mm", { locale: id })
                          : "-"}
                      </td>
                      <td className="py-3">
                        {record.checkOutTime
                          ? format(new Date(record.checkOutTime), "HH:mm", { locale: id })
                          : "-"}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{record.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-muted-foreground">
                Total: {records.length} siswa
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

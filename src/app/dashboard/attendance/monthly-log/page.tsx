"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format, getDaysInMonth } from "date-fns";
import { id } from "date-fns/locale";
import { AttendanceStatus } from "@prisma/client";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthlyLogPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Fetch classes
  const { data: classes = [] } = api.class.getAll.useQuery();

  // Fetch monthly attendance log
  const { data: records = [], isLoading } = api.attendance.getMonthlyLog.useQuery({
    year: selectedYear,
    month: selectedMonth,
    classId: selectedClassId || undefined,
  });

  // Get unique students from records
  const students = useMemo(() => {
    const studentMap = new Map();
    records.forEach((record) => {
      if (!studentMap.has(record.studentId)) {
        studentMap.set(record.studentId, {
          id: record.studentId,
          nis: record.student.nis,
          name: record.student.user.name,
          className: record.class?.name,
        });
      }
    });
    return Array.from(studentMap.values());
  }, [records]);

  // Get attendance for specific student and date
  const getAttendanceForDate = (studentId: string, day: number) => {
    const record = records.find((r) => {
      const recordDate = new Date(r.date);
      return r.studentId === studentId && recordDate.getDate() === day;
    });
    return record?.status;
  };

  // Calculate statistics per student
  const getStudentStats = (studentId: string) => {
    const studentRecords = records.filter((r) => r.studentId === studentId);
    const stats = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      SICK: 0,
      PERMISSION: 0,
      EXCUSED: 0,
    };

    studentRecords.forEach((record) => {
      if (stats.hasOwnProperty(record.status)) {
        stats[record.status as keyof typeof stats]++;
      }
    });

    return stats;
  };

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const stats = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      SICK: 0,
      PERMISSION: 0,
      EXCUSED: 0,
    };

    records.forEach((record) => {
      if (stats.hasOwnProperty(record.status)) {
        stats[record.status as keyof typeof stats]++;
      }
    });

    return stats;
  }, [records]);

  const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatusColor = (status?: AttendanceStatus) => {
    if (!status) return "bg-gray-100";
    const colors = {
      PRESENT: "bg-green-500",
      LATE: "bg-yellow-500",
      ABSENT: "bg-red-500",
      SICK: "bg-blue-500",
      PERMISSION: "bg-purple-500",
      EXCUSED: "bg-gray-500",
    };
    return colors[status];
  };

  const getStatusLabel = (status?: AttendanceStatus) => {
    if (!status) return "-";
    const labels = {
      PRESENT: "H",
      LATE: "T",
      ABSENT: "A",
      SICK: "S",
      PERMISSION: "I",
      EXCUSED: "D",
    };
    return labels[status];
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleExport = () => {
    // Create CSV header with all days
    const headers = ["No", "NIS", "Nama Siswa", "Kelas", ...days.map((d) => `${d}`), "H", "T", "A", "S", "I", "D"];

    const rows = students.map((student, index) => {
      const stats = getStudentStats(student.id);
      return [
        index + 1,
        student.nis || "-",
        student.name,
        student.className || "-",
        ...days.map((day) => getStatusLabel(getAttendanceForDate(student.id, day))),
        stats.PRESENT,
        stats.LATE,
        stats.ABSENT,
        stats.SICK,
        stats.PERMISSION,
        stats.EXCUSED,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `absensi-bulanan-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthName = format(new Date(selectedYear, selectedMonth - 1), "MMMM yyyy", { locale: id });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Log Absensi Bulanan</h2>
          <p className="text-muted-foreground">Rekap absensi per bulan</p>
        </div>
        <Button onClick={handleExport} disabled={students.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Bulan & Tahun</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex flex-1 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 font-medium">
                  {monthName}
                </div>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
              <div className="text-3xl font-bold text-green-600">{overallStats.PRESENT}</div>
              <p className="text-sm text-muted-foreground">Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{overallStats.LATE}</div>
              <p className="text-sm text-muted-foreground">Terlambat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{overallStats.ABSENT}</div>
              <p className="text-sm text-muted-foreground">Alpa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{overallStats.SICK}</div>
              <p className="text-sm text-muted-foreground">Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{overallStats.PERMISSION}</div>
              <p className="text-sm text-muted-foreground">Izin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{overallStats.EXCUSED}</div>
              <p className="text-sm text-muted-foreground">Dispensasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi - {monthName}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">📄</div>
              <p>Tidak ada data absensi untuk bulan ini</p>
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-lg bg-muted p-4">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                    <span>H = Hadir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-yellow-500"></div>
                    <span>T = Terlambat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-red-500"></div>
                    <span>A = Alpa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-blue-500"></div>
                    <span>S = Sakit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-purple-500"></div>
                    <span>I = Izin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-gray-500"></div>
                    <span>D = Dispensasi</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="sticky left-0 bg-background py-2 text-left font-medium">No</th>
                      <th className="sticky left-0 bg-background py-2 text-left font-medium">NIS</th>
                      <th className="sticky left-0 bg-background py-2 text-left font-medium">Nama</th>
                      {days.map((day) => (
                        <th key={day} className="py-2 text-center font-medium">
                          {day}
                        </th>
                      ))}
                      <th className="py-2 text-center font-medium">H</th>
                      <th className="py-2 text-center font-medium">T</th>
                      <th className="py-2 text-center font-medium">A</th>
                      <th className="py-2 text-center font-medium">S</th>
                      <th className="py-2 text-center font-medium">I</th>
                      <th className="py-2 text-center font-medium">D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const stats = getStudentStats(student.id);
                      return (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="sticky left-0 bg-background py-2">{index + 1}</td>
                          <td className="sticky left-0 bg-background py-2">{student.nis || "-"}</td>
                          <td className="sticky left-0 bg-background py-2">{student.name}</td>
                          {days.map((day) => {
                            const status = getAttendanceForDate(student.id, day);
                            return (
                              <td key={day} className="py-2 text-center">
                                <div
                                  className={`mx-auto flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${getStatusColor(status)}`}
                                  title={status}
                                >
                                  {getStatusLabel(status)}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-2 text-center font-medium">{stats.PRESENT}</td>
                          <td className="py-2 text-center font-medium">{stats.LATE}</td>
                          <td className="py-2 text-center font-medium">{stats.ABSENT}</td>
                          <td className="py-2 text-center font-medium">{stats.SICK}</td>
                          <td className="py-2 text-center font-medium">{stats.PERMISSION}</td>
                          <td className="py-2 text-center font-medium">{stats.EXCUSED}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-4 text-sm text-muted-foreground">
                  Total: {students.length} siswa • {records.length} records absensi
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

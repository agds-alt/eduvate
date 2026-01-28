"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { AttendanceStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Edit3, Calendar, Filter, Users, CheckCircle2, Clock, XCircle, Thermometer, FileText, AlertCircle } from "lucide-react";

export default function AttendanceManualPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch classes
  const { data: classes = [] } = api.class.getAll.useQuery();

  // Fetch students for attendance with existing records
  const { data: students = [], refetch: refetchStudents } = api.attendance.getStudentsForAttendance.useQuery(
    {
      classId: selectedClassId,
      date: new Date(selectedDate),
    },
    {
      enabled: !!selectedClassId,
    }
  );

  // Get current teacher (for now, we'll use the first teacher)
  const { data: teachers = [] } = api.teacher.getAll.useQuery();
  const currentTeacher = teachers[0];

  // Initialize attendance data when students are loaded
  useMemo(() => {
    if (students.length > 0) {
      const initialData: Record<string, AttendanceStatus> = {};
      students.forEach((student) => {
        if (student.attendanceStatus) {
          initialData[student.id] = student.attendanceStatus;
        }
      });
      setAttendanceData(initialData);
    }
  }, [students]);

  // Create bulk attendance mutation
  const createBulkMutation = api.attendance.createBulk.useMutation({
    onSuccess: () => {
      toast.success("Absensi berhasil disimpan");
      refetchStudents();
    },
    onError: (error) => {
      toast.error(`Gagal menyimpan absensi: ${error.message}`);
    },
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    if (!currentTeacher) {
      toast.error("Guru tidak ditemukan");
      return;
    }

    const records = students
      .filter((student) => attendanceData[student.id])
      .map((student) => ({
        studentId: student.id,
        status: attendanceData[student.id]!,
        checkInTime: attendanceData[student.id] === AttendanceStatus.PRESENT ? new Date() : undefined,
      }));

    if (records.length === 0) {
      toast.error("Tidak ada data absensi untuk disimpan");
      return;
    }

    setIsSaving(true);
    try {
      await createBulkMutation.mutateAsync({
        classId: selectedClassId,
        teacherId: currentTeacher.id,
        date: new Date(selectedDate),
        type: "MANUAL",
        records,
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  const stats = useMemo(() => {
    const counts = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      SICK: 0,
      PERMISSION: 0,
      EXCUSED: 0,
      NOT_SET: 0,
    };

    students.forEach((student) => {
      const status = attendanceData[student.id];
      if (status) {
        counts[status]++;
      } else {
        counts.NOT_SET++;
      }
    });

    return counts;
  }, [students, attendanceData]);

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Edit3 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Absensi Manual</h2>
                <p className="mt-1 text-cyan-100">
                  Input absensi siswa secara manual
                </p>
              </div>
            </div>
            <Button
              onClick={handleSaveAttendance}
              disabled={isSaving || !selectedClassId}
              className="bg-white text-cyan-600 hover:bg-white/90 shadow-lg"
            >
              {isSaving ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-cyan-600" />
                Kelas
              </label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setAttendanceData({});
                }}
              >
                <option value="">Pilih Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.academicYear}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-sky-600" />
                Tanggal
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && (
        <>
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
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{stats.NOT_SET}</div>
                  <p className="text-xs text-muted-foreground">Belum Set</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-cyan-100 p-2">
                  <Users className="h-5 w-5 text-cyan-600" />
                </div>
                <CardTitle>Daftar Siswa ({students.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-gray-100 p-6">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <p className="font-medium">Tidak ada siswa di kelas ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border bg-white">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">NIS</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nama Siswa</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status Saat Ini</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student.id} className="border-b transition-colors hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              {student.nis || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{student.user.name}</td>
                          <td className="px-4 py-3">
                            {attendanceData[student.id] ? (
                              getStatusBadge(attendanceData[student.id]!)
                            ) : (
                              <span className="text-xs text-muted-foreground">Belum diisi</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              <button
                                className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 transition-all hover:bg-green-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                              >
                                Hadir
                              </button>
                              <button
                                className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 transition-all hover:bg-yellow-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                              >
                                Terlambat
                              </button>
                              <button
                                className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 transition-all hover:bg-red-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                              >
                                Alpa
                              </button>
                              <button
                                className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 transition-all hover:bg-blue-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.SICK)}
                              >
                                Sakit
                              </button>
                              <button
                                className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 transition-all hover:bg-purple-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.PERMISSION)}
                              >
                                Izin
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedClassId && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-cyan-100 p-2">
                <Edit3 className="h-5 w-5 text-cyan-600" />
              </div>
              <CardTitle>Daftar Siswa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gray-100 p-6">
                  <Edit3 className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Pilih kelas untuk mulai absensi manual</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { AttendanceStatus } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Absensi Manual</h2>
          <p className="text-muted-foreground">Input absensi siswa secara manual</p>
        </div>
        <Button onClick={handleSaveAttendance} disabled={isSaving || !selectedClassId}>
          {isSaving ? "Menyimpan..." : "Simpan Absensi"}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
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
              <label className="mb-2 block text-sm font-medium">Tanggal</label>
              <input
                type="date"
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.PRESENT}</div>
                  <p className="text-xs text-muted-foreground">Hadir</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.LATE}</div>
                  <p className="text-xs text-muted-foreground">Terlambat</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.ABSENT}</div>
                  <p className="text-xs text-muted-foreground">Alpa</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.SICK}</div>
                  <p className="text-xs text-muted-foreground">Sakit</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.PERMISSION}</div>
                  <p className="text-xs text-muted-foreground">Izin</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.NOT_SET}</div>
                  <p className="text-xs text-muted-foreground">Belum Set</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Siswa ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="mb-4 text-4xl">👥</div>
                  <p>Tidak ada siswa di kelas ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-medium">No</th>
                        <th className="py-3 text-left font-medium">NIS</th>
                        <th className="py-3 text-left font-medium">Nama Siswa</th>
                        <th className="py-3 text-left font-medium">Status Saat Ini</th>
                        <th className="py-3 text-left font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3">{student.nis || "-"}</td>
                          <td className="py-3">{student.user.name}</td>
                          <td className="py-3">
                            {attendanceData[student.id] ? (
                              getStatusBadge(attendanceData[student.id]!)
                            ) : (
                              <span className="text-xs text-muted-foreground">Belum diisi</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <button
                                className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                              >
                                Hadir
                              </button>
                              <button
                                className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                              >
                                Terlambat
                              </button>
                              <button
                                className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                              >
                                Alpa
                              </button>
                              <button
                                className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                                onClick={() => handleStatusChange(student.id, AttendanceStatus.SICK)}
                              >
                                Sakit
                              </button>
                              <button
                                className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 hover:bg-purple-200"
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
        <Card>
          <CardHeader>
            <CardTitle>Daftar Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">✍️</div>
              <p>Pilih kelas untuk mulai absensi manual</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

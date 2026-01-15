"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Clock, UserCheck, UserX, Calendar, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { api } from "~/lib/trpc-provider";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function TeacherAttendancePage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Manual override dialog
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideAttendanceId, setOverrideAttendanceId] = useState<string>("");
  const [overrideStatus, setOverrideStatus] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const utils = api.useUtils();

  // Fetch data
  const { data, isLoading } = api.teacherAttendance.getAll.useQuery({
    page,
    limit: 10,
    teacherId: selectedTeacher,
    status: selectedStatus as any,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  const { data: stats, isLoading: statsLoading } = api.teacherAttendance.getStats.useQuery({
    teacherId: selectedTeacher,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  const { data: teachers } = api.teacher.getAll.useQuery();

  // Manual override mutation
  const overrideMutation = api.teacherAttendance.manualOverride.useMutation({
    onSuccess: () => {
      utils.teacherAttendance.getAll.invalidate();
      utils.teacherAttendance.getStats.invalidate();
      setIsOverrideDialogOpen(false);
      setOverrideReason("");
      toast({
        title: "Berhasil!",
        description: "Status kehadiran berhasil diubah",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const attendances = data?.attendances ?? [];
  const pagination = data?.pagination;

  const openOverrideDialog = (attendanceId: string, currentStatus: string) => {
    setOverrideAttendanceId(attendanceId);
    setOverrideStatus(currentStatus);
    setOverrideReason("");
    setIsOverrideDialogOpen(true);
  };

  const handleOverride = () => {
    if (!overrideReason.trim()) {
      toast({
        title: "Error",
        description: "Alasan harus diisi!",
        variant: "destructive",
      });
      return;
    }

    overrideMutation.mutate({
      attendanceId: overrideAttendanceId,
      status: overrideStatus as any,
      reason: overrideReason,
      overrideBy: "admin", // TODO: Get from auth session
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; icon: any }> = {
      PRESENT: { variant: "default", label: "Hadir", icon: CheckCircle },
      LATE: { variant: "secondary", label: "Terlambat", icon: Clock },
      ABSENT: { variant: "destructive", label: "Tidak Hadir", icon: UserX },
      SICK: { variant: "outline", label: "Sakit", icon: AlertCircle },
      LEAVE: { variant: "outline", label: "Izin", icon: FileText },
      EXCUSED: { variant: "default", label: "Dispensasi", icon: UserCheck },
      NO_SCHEDULE: { variant: "outline", label: "Tidak Ada Jadwal", icon: Calendar },
    };

    const config = statusMap[status] || statusMap.ABSENT;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading || statsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Toaster />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Absensi Guru</h2>
        <p className="text-muted-foreground">
          Kelola dan monitor kehadiran guru
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {stats?.attendanceRate ?? 0}%
              </div>
              <p className="text-sm text-muted-foreground">Tingkat Kehadiran</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats?.present ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Hadir Tepat Waktu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats?.late ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Terlambat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {stats?.absent ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Tidak Hadir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Guru</Label>
              <Select
                value={selectedTeacher ?? "all"}
                onValueChange={(value) => {
                  setSelectedTeacher(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Guru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Guru</SelectItem>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus ?? "all"}
                onValueChange={(value) => {
                  setSelectedStatus(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PRESENT">Hadir</SelectItem>
                  <SelectItem value="LATE">Terlambat</SelectItem>
                  <SelectItem value="ABSENT">Tidak Hadir</SelectItem>
                  <SelectItem value="SICK">Sakit</SelectItem>
                  <SelectItem value="LEAVE">Izin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Dari</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Sampai</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Override Dialog */}
      <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Kehadiran</DialogTitle>
            <DialogDescription>
              Manual override untuk mengubah status kehadiran guru
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status Baru</Label>
              <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Hadir</SelectItem>
                  <SelectItem value="LATE">Terlambat</SelectItem>
                  <SelectItem value="ABSENT">Tidak Hadir</SelectItem>
                  <SelectItem value="SICK">Sakit</SelectItem>
                  <SelectItem value="LEAVE">Izin/Cuti</SelectItem>
                  <SelectItem value="EXCUSED">Dispensasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alasan Override</Label>
              <Input
                placeholder="Alasan perubahan status..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOverrideDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleOverride}
              disabled={overrideMutation.isPending}
            >
              {overrideMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Kehadiran ({pagination?.total ?? 0})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Tidak ada data kehadiran
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nama Guru</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          {format(new Date(attendance.date), "dd MMM yyyy", {
                            locale: localeId,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {attendance.teacher.user.image ? (
                                <img
                                  src={attendance.teacher.user.image}
                                  alt={attendance.teacher.user.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                attendance.teacher.user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {attendance.teacher.user.name}
                              </p>
                              {attendance.teacher.user.email && (
                                <p className="text-xs text-muted-foreground">
                                  {attendance.teacher.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {attendance.checkInTime ? (
                            <div>
                              <p className="font-medium">
                                {format(new Date(attendance.checkInTime), "HH:mm")}
                              </p>
                              {attendance.isLate && (
                                <p className="text-xs text-red-600">
                                  +{attendance.lateMinutes} menit
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attendance.checkOutTime ? (
                            <div>
                              <p className="font-medium">
                                {format(new Date(attendance.checkOutTime), "HH:mm")}
                              </p>
                              {attendance.isEarlyDeparture && (
                                <p className="text-xs text-orange-600">
                                  -{attendance.earlyMinutes} menit lebih awal
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                        <TableCell>
                          {attendance.isManualOverride && (
                            <Badge variant="outline" className="text-xs">
                              Manual Override
                            </Badge>
                          )}
                          {attendance.earlyDepartureRequest && (
                            <Badge variant="outline" className="text-xs">
                              {attendance.earlyDepartureRequest.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openOverrideDialog(attendance.id, attendance.status)
                            }
                          >
                            Override
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(page - 1) * 10 + 1} -{" "}
                    {Math.min(page * 10, pagination.total)} dari {pagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

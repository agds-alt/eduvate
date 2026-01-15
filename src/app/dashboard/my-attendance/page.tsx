"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Home,
} from "lucide-react";
import { api } from "~/lib/trpc-provider";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function MyAttendancePage() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState("");

  // Early departure request dialog
  const [isEarlyRequestDialogOpen, setIsEarlyRequestDialogOpen] = useState(false);
  const [plannedCheckOutTime, setPlannedCheckOutTime] = useState("");
  const [earlyReason, setEarlyReason] = useState("");

  // TODO: Get from auth session
  const teacherId = "teacher-id-from-session";

  const utils = api.useUtils();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance
  const { data: todayAttendance, isLoading } =
    api.teacherAttendance.getTodayAttendance.useQuery({
      teacherId,
    });

  // Fetch monthly stats
  const { data: monthlyStats } = api.teacherAttendance.getStats.useQuery({
    teacherId,
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    dateTo: new Date(),
  });

  // Check-in mutation
  const checkInMutation = api.teacherAttendance.checkIn.useMutation({
    onSuccess: (data) => {
      utils.teacherAttendance.getTodayAttendance.invalidate();
      utils.teacherAttendance.getStats.invalidate();
      setNotes("");
      toast({
        title: data.isLate ? "⚠️ Check-in Terlambat" : "✅ Check-in Berhasil",
        description: data.message,
        variant: data.isLate ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal Check-in",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check-out mutation
  const checkOutMutation = api.teacherAttendance.checkOut.useMutation({
    onSuccess: (data) => {
      utils.teacherAttendance.getTodayAttendance.invalidate();
      utils.teacherAttendance.getStats.invalidate();
      setNotes("");
      toast({
        title: data.isEarlyDeparture
          ? "⚠️ Check-out Lebih Awal"
          : "✅ Check-out Berhasil",
        description: data.message,
        variant: data.isEarlyDeparture ? "default" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal Check-out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Early departure request mutation
  const earlyDepartureMutation =
    api.teacherAttendance.requestEarlyDeparture.useMutation({
      onSuccess: (data) => {
        utils.teacherAttendance.getTodayAttendance.invalidate();
        setIsEarlyRequestDialogOpen(false);
        setEarlyReason("");
        setPlannedCheckOutTime("");
        toast({
          title: "✅ Permintaan Terkirim",
          description: data.message,
        });
      },
      onError: (error) => {
        toast({
          title: "Gagal",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleCheckIn = () => {
    checkInMutation.mutate({ teacherId, notes });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({ teacherId, notes });
  };

  const handleEarlyRequest = () => {
    if (!plannedCheckOutTime || !earlyReason.trim()) {
      toast({
        title: "Error",
        description: "Semua field harus diisi!",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = plannedCheckOutTime.split(":");
    const plannedTime = new Date();
    plannedTime.setHours(parseInt(hours || "0"), parseInt(minutes || "0"), 0, 0);

    earlyDepartureMutation.mutate({
      teacherId,
      plannedCheckOutTime: plannedTime,
      reason: earlyReason,
    });
  };

  const hasCheckedIn = todayAttendance?.checkInTime != null;
  const hasCheckedOut = todayAttendance?.checkOutTime != null;
  const school = todayAttendance?.teacher.school;

  if (isLoading) {
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
        <h2 className="text-3xl font-bold">Absensi Saya</h2>
        <p className="text-muted-foreground">Check-in dan check-out harian</p>
      </div>

      {/* Current Time Display */}
      <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="mx-auto mb-4 h-16 w-16 text-primary" />
            <div className="text-5xl font-bold">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <p className="mt-2 text-muted-foreground">
              {format(currentTime, "EEEE, dd MMMM yyyy", { locale: localeId })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Check-in/out Buttons */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Check-in Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasCheckedIn ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Sudah Check-in</span>
                  </div>
                  <p className="mt-2 text-sm text-green-600">
                    Waktu:{" "}
                    {todayAttendance.checkInTime && format(new Date(todayAttendance.checkInTime), "HH:mm:ss")}
                  </p>
                  {todayAttendance.isLate && (
                    <p className="mt-1 text-sm text-red-600">
                      Terlambat {todayAttendance.lateMinutes} menit
                    </p>
                  )}
                </div>
                {todayAttendance.notes && (
                  <div>
                    <Label className="text-xs">Catatan:</Label>
                    <p className="text-sm text-muted-foreground">
                      {todayAttendance.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 text-sm">
                  <p className="font-semibold text-blue-900">
                    Jam Check-in: {school?.teacherCheckInTime}
                  </p>
                  <p className="text-blue-700">
                    Toleransi: {school?.gracePeriodMinutes} menit
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Input
                    placeholder="Tambahkan catatan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {checkInMutation.isPending ? "Memproses..." : "Check-in Sekarang"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-out Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Check-out
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasCheckedOut ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Sudah Check-out</span>
                  </div>
                  <p className="mt-2 text-sm text-green-600">
                    Waktu:{" "}
                    {todayAttendance.checkOutTime && format(new Date(todayAttendance.checkOutTime), "HH:mm:ss")}
                  </p>
                  {todayAttendance.isEarlyDeparture && (
                    <p className="mt-1 text-sm text-orange-600">
                      Pulang {todayAttendance.earlyMinutes} menit lebih awal
                    </p>
                  )}
                </div>
              </div>
            ) : !hasCheckedIn ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <AlertCircle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Check-in terlebih dahulu sebelum check-out
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 text-sm">
                  <p className="font-semibold text-blue-900">
                    Jam Check-out: {school?.teacherCheckOutTime}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEarlyRequestDialogOpen(true)}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Request Pulang Awal
                </Button>
                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Input
                    placeholder="Tambahkan catatan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCheckOut}
                  disabled={checkOutMutation.isPending}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {checkOutMutation.isPending
                    ? "Memproses..."
                    : "Check-out Sekarang"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Early Departure Request Dialog */}
      <Dialog
        open={isEarlyRequestDialogOpen}
        onOpenChange={setIsEarlyRequestDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permintaan Pulang Awal</DialogTitle>
            <DialogDescription>
              Ajukan permintaan untuk pulang sebelum jam {school?.teacherCheckOutTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Jam Pulang yang Direncanakan <span className="text-red-500">*</span>
              </Label>
              <Input
                type="time"
                value={plannedCheckOutTime}
                onChange={(e) => setPlannedCheckOutTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Alasan <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Alasan permintaan pulang awal..."
                value={earlyReason}
                onChange={(e) => setEarlyReason(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p>
                ⚠️ Permintaan ini akan dikirim ke kepala sekolah untuk persetujuan
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEarlyRequestDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleEarlyRequest}
              disabled={earlyDepartureMutation.isPending}
            >
              {earlyDepartureMutation.isPending ? "Mengirim..." : "Kirim Permintaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {monthlyStats?.attendanceRate ?? 0}%
                </div>
                <p className="text-sm text-muted-foreground">Kehadiran Bulan Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats?.present ?? 0}</div>
                <p className="text-sm text-muted-foreground">Hadir Tepat Waktu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats?.late ?? 0}</div>
                <p className="text-sm text-muted-foreground">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {monthlyStats?.punctualityRate ?? 0}%
                </div>
                <p className="text-sm text-muted-foreground">Tingkat Ketepatan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

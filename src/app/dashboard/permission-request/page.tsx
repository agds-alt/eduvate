"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { FileText, Plus, Clock, CheckCircle2, XCircle, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "~/hooks/use-toast";

type PermissionType = "SICK" | "PERMISSION" | "FAMILY_EVENT" | "OTHER";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

const permissionTypeLabels: Record<PermissionType, string> = {
  SICK: "Sakit",
  PERMISSION: "Izin Umum",
  FAMILY_EVENT: "Acara Keluarga",
  OTHER: "Lainnya",
};

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const statusColors: Record<RequestStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function PermissionRequestPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "ALL">("ALL");

  const [formData, setFormData] = useState({
    type: "PERMISSION" as PermissionType,
    startDate: "",
    endDate: "",
    reason: "",
    attachmentUrl: "",
    notes: "",
  });

  const { data: studentsData } = api.student.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: requestsData, isLoading } = api.permissionRequest.getAll.useQuery({
    page: 1,
    limit: 50,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    studentId: selectedStudentId || undefined,
  });

  const { data: stats } = api.permissionRequest.getStats.useQuery();

  const createMutation = api.permissionRequest.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.permissionRequest.getAll.invalidate();
      void utils.permissionRequest.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const utils = api.useUtils();

  const students = studentsData?.students || [];
  const requests = requestsData?.requests || [];

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      type: "PERMISSION",
      startDate: "",
      endDate: "",
      reason: "",
      attachmentUrl: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    if (!selectedStudentId) {
      toast({
        title: "Peringatan",
        description: "Silakan pilih siswa terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "Peringatan",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      studentId: selectedStudentId,
      type: formData.type,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      reason: formData.reason,
      attachmentUrl: formData.attachmentUrl || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Pengajuan Izin</h2>
              <p className="mt-1 text-blue-100">
                Ajukan dan kelola permohonan izin siswa
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengajuan</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold">{stats?.approved || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold">{stats?.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Pengajuan Izin</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajukan Izin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="filterStudent">Filter Siswa</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua siswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua siswa</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nis ? `${student.nis} - ` : ""}
                      {student.user.name}
                      {student.currentClass ? ` (${student.currentClass.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterStatus">Filter Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as RequestStatus | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Memuat data...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-muted-foreground">Belum ada pengajuan izin</p>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{request.student.user.name}</span>
                          {request.student.currentClass && (
                            <span className="text-sm text-muted-foreground">
                              ({request.student.currentClass.name})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{permissionTypeLabels[request.type as PermissionType]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(request.startDate), "d MMM yyyy", { locale: id })} -{" "}
                              {format(new Date(request.endDate), "d MMM yyyy", { locale: id })}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm">{request.reason}</p>

                        {request.notes && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Catatan:</strong> {request.notes}
                          </p>
                        )}

                        {request.rejectionReason && (
                          <p className="text-sm text-red-600">
                            <strong>Alasan Penolakan:</strong> {request.rejectionReason}
                          </p>
                        )}
                      </div>

                      <div className="ml-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[request.status as RequestStatus]}`}
                        >
                          {statusLabels[request.status as RequestStatus]}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajukan Izin</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk mengajukan permohonan izin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">
                Siswa <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nis ? `${student.nis} - ` : ""}
                      {student.user.name}
                      {student.currentClass ? ` (${student.currentClass.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Jenis Izin <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as PermissionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SICK">Sakit</SelectItem>
                  <SelectItem value="PERMISSION">Izin Umum</SelectItem>
                  <SelectItem value="FAMILY_EVENT">Acara Keluarga</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Alasan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Jelaskan alasan pengajuan izin..."
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentUrl">Lampiran (URL)</Label>
              <Input
                id="attachmentUrl"
                placeholder="https://example.com/surat-dokter.pdf"
                value={formData.attachmentUrl}
                onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Opsional: Link ke surat dokter, undangan, atau dokumen pendukung lainnya
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan (opsional)..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Mengirim..." : "Ajukan Izin"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

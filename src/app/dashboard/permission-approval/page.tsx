"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { CheckCircle2, XCircle, Calendar, User, FileText, Clock, Mail, Phone } from "lucide-react";
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

export default function PermissionApprovalPage() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "ALL">("PENDING");
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    requestId: "",
    action: "" as "approve" | "reject",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  const { data: requestsData, isLoading } = api.permissionRequest.getAll.useQuery({
    page: 1,
    limit: 50,
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
  });

  const { data: stats } = api.permissionRequest.getStats.useQuery();

  const utils = api.useUtils();

  const approveMutation = api.permissionRequest.approve.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeApprovalDialog();
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

  const rejectMutation = api.permissionRequest.reject.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeApprovalDialog();
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

  const requests = requestsData?.requests || [];

  const openApprovalDialog = (requestId: string, action: "approve" | "reject") => {
    setApprovalDialog({ open: true, requestId, action });
  };

  const closeApprovalDialog = () => {
    setApprovalDialog({ open: false, requestId: "", action: "approve" });
    setRejectionReason("");
    setApprovalNotes("");
  };

  const handleApproval = () => {
    if (approvalDialog.action === "approve") {
      approveMutation.mutate({
        id: approvalDialog.requestId,
        notes: approvalNotes || undefined,
      });
    } else {
      if (!rejectionReason.trim()) {
        toast({
          title: "Peringatan",
          description: "Mohon isi alasan penolakan",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({
        id: approvalDialog.requestId,
        rejectionReason: rejectionReason,
      });
    }
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Konfirmasi Izin</h2>
              <p className="mt-1 text-purple-100">
                Setujui atau tolak permohonan izin siswa
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
                <p className="text-sm text-muted-foreground">Menunggu Konfirmasi</p>
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
            <div className="w-64">
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as RequestStatus | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Menunggu Konfirmasi</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Memuat data...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Tidak ada pengajuan izin dengan status ini
              </p>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="text-lg font-semibold">{request.student.user.name}</span>
                            {request.student.currentClass && (
                              <Badge variant="outline">
                                {request.student.currentClass.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {request.student.user.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span>{request.student.user.email}</span>
                              </div>
                            )}
                            {request.student.user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{request.student.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Badge
                          variant={
                            request.status === "PENDING"
                              ? "secondary"
                              : request.status === "APPROVED"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {request.status === "PENDING"
                            ? "Menunggu"
                            : request.status === "APPROVED"
                              ? "Disetujui"
                              : "Ditolak"}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="grid gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Jenis Izin:</span>
                            <span>{permissionTypeLabels[request.type as PermissionType]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Periode:</span>
                            <span>
                              {format(new Date(request.startDate), "d MMM yyyy", { locale: id })} -{" "}
                              {format(new Date(request.endDate), "d MMM yyyy", { locale: id })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Diajukan:</span>
                            <span>
                              {format(new Date(request.submittedAt), "d MMM yyyy HH:mm", {
                                locale: id,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Alasan:</span>
                            <p className="mt-1 text-muted-foreground">{request.reason}</p>
                          </div>

                          {request.attachmentUrl && (
                            <div className="text-sm">
                              <span className="font-medium">Lampiran:</span>
                              <a
                                href={request.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block text-blue-600 hover:underline"
                              >
                                Lihat dokumen
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes/Rejection Reason */}
                      {request.notes && (
                        <div className="rounded-lg bg-blue-50 p-3 text-sm">
                          <strong>Catatan:</strong> {request.notes}
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-900">
                          <strong>Alasan Penolakan:</strong> {request.rejectionReason}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {request.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() => openApprovalDialog(request.id, "approve")}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Setujui
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => openApprovalDialog(request.id, "reject")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Tolak
                          </Button>
                        </div>
                      )}

                      {request.status !== "PENDING" && request.approvedAt && (
                        <div className="text-sm text-muted-foreground">
                          {request.status === "APPROVED" ? "Disetujui" : "Ditolak"} pada{" "}
                          {format(new Date(request.approvedAt), "d MMMM yyyy HH:mm", { locale: id })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval/Rejection Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={closeApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === "approve" ? "Setujui Pengajuan Izin" : "Tolak Pengajuan Izin"}
            </DialogTitle>
            <DialogDescription>
              {approvalDialog.action === "approve"
                ? "Apakah Anda yakin ingin menyetujui pengajuan izin ini?"
                : "Silakan berikan alasan penolakan pengajuan izin ini"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {approvalDialog.action === "approve" ? (
              <div className="space-y-2">
                <Label htmlFor="approvalNotes">Catatan (Opsional)</Label>
                <Textarea
                  id="approvalNotes"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Jelaskan alasan mengapa pengajuan ini ditolak..."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeApprovalDialog}>
              Batal
            </Button>
            <Button
              variant={approvalDialog.action === "approve" ? "default" : "destructive"}
              onClick={handleApproval}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending || rejectMutation.isPending
                ? "Memproses..."
                : approvalDialog.action === "approve"
                  ? "Setujui"
                  : "Tolak"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

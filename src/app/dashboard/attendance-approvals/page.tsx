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
import { Clock, CheckCircle, XCircle, AlertCircle, Home, User } from "lucide-react";
import { api } from "~/lib/trpc-provider";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function AttendanceApprovalsPage() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  // Approval dialog
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalDecision, setApprovalDecision] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");

  const utils = api.useUtils();

  // TODO: Get from auth session
  const userId = "admin-id-from-session";

  // Fetch early departure requests
  const { data: requests, isLoading } =
    api.teacherAttendance.getEarlyDepartureRequests.useQuery({
      status: selectedStatus as any,
    });

  // Approval mutation
  const approveMutation = api.teacherAttendance.approveEarlyDeparture.useMutation({
    onSuccess: (data) => {
      utils.teacherAttendance.getEarlyDepartureRequests.invalidate();
      utils.teacherAttendance.getAll.invalidate();
      setIsApprovalDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
      toast({
        title: "Berhasil!",
        description: data.message,
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

  const openApprovalDialog = (request: any, decision: "approve" | "reject") => {
    setSelectedRequest(request);
    setApprovalDecision(decision);
    setRejectionReason("");
    setIsApprovalDialogOpen(true);
  };

  const handleApproval = () => {
    if (approvalDecision === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Alasan penolakan harus diisi!",
        variant: "destructive",
      });
      return;
    }

    approveMutation.mutate({
      requestId: selectedRequest.id,
      approved: approvalDecision === "approve",
      approvedBy: userId,
      rejectionReason: approvalDecision === "reject" ? rejectionReason : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; icon: any }> = {
      PENDING: { variant: "secondary", label: "Menunggu", icon: Clock },
      APPROVED: { variant: "default", label: "Disetujui", icon: CheckCircle },
      REJECTED: { variant: "destructive", label: "Ditolak", icon: XCircle },
    };

    const config = statusMap[status] || statusMap.PENDING;
    const Icon = config?.icon;

    return (
      <Badge variant={config?.variant} className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config?.label}
      </Badge>
    );
  };

  const pendingCount = requests?.filter((r) => r.status === "PENDING").length ?? 0;
  const approvedCount = requests?.filter((r) => r.status === "APPROVED").length ?? 0;
  const rejectedCount = requests?.filter((r) => r.status === "REJECTED").length ?? 0;

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
        <h2 className="text-3xl font-bold">Persetujuan Absensi</h2>
        <p className="text-muted-foreground">
          Kelola permintaan izin pulang awal dari guru
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </div>
                <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {approvedCount}
                </div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {rejectedCount}
                </div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Filter Status</Label>
              <Select
                value={selectedStatus ?? "all"}
                onValueChange={(value) =>
                  setSelectedStatus(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDecision === "approve" ? "Setujui" : "Tolak"} Permintaan
            </DialogTitle>
            <DialogDescription>
              {approvalDecision === "approve"
                ? "Apakah Anda yakin ingin menyetujui permintaan ini?"
                : "Berikan alasan penolakan permintaan ini"}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Details */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">
                    {selectedRequest.attendance.teacher.user.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    Rencana pulang:{" "}
                    {format(
                      new Date(selectedRequest.plannedCheckOutTime),
                      "HH:mm"
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    {selectedRequest.reason}
                  </span>
                </div>
              </div>

              {/* Rejection Reason Input */}
              {approvalDecision === "reject" && (
                <div className="space-y-2">
                  <Label>
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Jelaskan alasan penolakan..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleApproval}
              disabled={approveMutation.isPending}
              variant={approvalDecision === "approve" ? "default" : "destructive"}
            >
              {approveMutation.isPending
                ? "Memproses..."
                : approvalDecision === "approve"
                ? "Setujui"
                : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan ({requests?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Home className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p>Belum ada permintaan izin pulang awal</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Guru</TableHead>
                    <TableHead>Rencana Pulang</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {format(new Date(request.createdAt), "dd MMM yyyy", {
                          locale: localeId,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {request.attendance.teacher.user.image ? (
                              <img
                                src={request.attendance.teacher.user.image}
                                alt={request.attendance.teacher.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              request.attendance.teacher.user.name
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {request.attendance.teacher.user.name}
                            </p>
                            {request.attendance.teacher.user.email && (
                              <p className="text-xs text-muted-foreground">
                                {request.attendance.teacher.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {format(
                          new Date(request.plannedCheckOutTime),
                          "HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        {request.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openApprovalDialog(request, "approve")
                              }
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Setujui
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openApprovalDialog(request, "reject")}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {request.status === "APPROVED"
                              ? `Disetujui oleh ${request.approvedBy}`
                              : `Ditolak: ${request.rejectionReason}`}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

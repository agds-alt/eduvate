"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PaymentStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Download,
  Eye,
} from "lucide-react";

export default function TuitionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Fetch finance records
  const { data: records = [], isLoading, refetch } = api.finance.getAll.useQuery({
    type: "SPP",
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  // Fetch statistics
  const { data: stats } = api.finance.getStats.useQuery({});

  // Process payment mutation
  const processPaymentMutation = api.finance.processPayment.useMutation({
    onSuccess: () => {
      toast.success("Pembayaran berhasil diproses");
      setSelectedRecord(null);
      setPaymentAmount("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Gagal memproses pembayaran: ${error.message}`);
    },
  });

  // Filter records by search term
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.student.user.name.toLowerCase().includes(searchLower) ||
        record.student.nis?.toLowerCase().includes(searchLower) ||
        record.type.toLowerCase().includes(searchLower)
      );
    });
  }, [records, searchTerm]);

  // Calculate statistics from records
  const localStats = useMemo(() => {
    const total = records.reduce((sum, r) => sum + r.amount, 0);
    const paid = records.reduce((sum, r) => sum + r.paidAmount, 0);
    const unpaid = total - paid;
    const overdue = records
      .filter((r) => r.status === "OVERDUE")
      .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

    return { total, paid, unpaid, overdue };
  }, [records]);

  const getStatusBadge = (status: PaymentStatus) => {
    const styles = {
      PAID: "bg-green-100 text-green-800 border-green-200",
      UNPAID: "bg-gray-100 text-gray-800 border-gray-200",
      PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
      OVERDUE: "bg-red-100 text-red-800 border-red-200",
    };

    const labels = {
      PAID: "Lunas",
      UNPAID: "Belum Dibayar",
      PARTIAL: "Sebagian",
      OVERDUE: "Terlambat",
    };

    const icons = {
      PAID: <CheckCircle className="mr-1 h-3 w-3" />,
      UNPAID: <Clock className="mr-1 h-3 w-3" />,
      PARTIAL: <DollarSign className="mr-1 h-3 w-3" />,
      OVERDUE: <AlertCircle className="mr-1 h-3 w-3" />,
    };

    return (
      <span
        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}
      >
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleProcessPayment = async () => {
    if (!selectedRecord || !paymentAmount) {
      toast.error("Masukkan jumlah pembayaran");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Jumlah pembayaran tidak valid");
      return;
    }

    const remaining = selectedRecord.amount - selectedRecord.paidAmount;
    if (amount > remaining) {
      toast.error("Jumlah pembayaran melebihi sisa tagihan");
      return;
    }

    await processPaymentMutation.mutateAsync({
      id: selectedRecord.id,
      amount,
      paidDate: new Date(),
    });
  };

  const handleExport = () => {
    const headers = ["Tanggal", "NIS", "Nama Siswa", "Jenis", "Total", "Terbayar", "Sisa", "Status", "Jatuh Tempo"];
    const rows = filteredRecords.map((record) => [
      format(new Date(record.createdAt), "dd/MM/yyyy"),
      record.student.nis || "-",
      record.student.user.name,
      record.type,
      record.amount,
      record.paidAmount,
      record.amount - record.paidAmount,
      record.status,
      format(new Date(record.dueDate), "dd/MM/yyyy"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `tagihan-spp-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">SPP / Tagihan Siswa</h2>
                <p className="mt-1 text-emerald-100">
                  Kelola pembayaran SPP dan tagihan siswa
                </p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={filteredRecords.length === 0}
              className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
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

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tagihan
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {formatCurrency(localStats.total)}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-4">
                <DollarSign className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sudah Dibayar
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(localStats.paid)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Belum Dibayar
                </p>
                <p className="mt-2 text-2xl font-bold text-yellow-600">
                  {formatCurrency(localStats.unpaid)}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-red-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Terlambat
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(localStats.overdue)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari siswa, NIS, atau jenis tagihan..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "ALL")}
              >
                <option value="ALL">Semua Status</option>
                <option value="UNPAID">Belum Dibayar</option>
                <option value="PARTIAL">Sebagian</option>
                <option value="PAID">Lunas</option>
                <option value="OVERDUE">Terlambat</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan SPP ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">💰</div>
              <p>Tidak ada data tagihan SPP</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Tanggal</th>
                    <th className="py-3 text-left font-medium">NIS</th>
                    <th className="py-3 text-left font-medium">Nama Siswa</th>
                    <th className="py-3 text-left font-medium">Jenis</th>
                    <th className="py-3 text-right font-medium">Total</th>
                    <th className="py-3 text-right font-medium">Terbayar</th>
                    <th className="py-3 text-right font-medium">Sisa</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Jatuh Tempo</th>
                    <th className="py-3 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const remaining = record.amount - record.paidAmount;
                    const isOverdue = new Date(record.dueDate) < new Date() && remaining > 0;

                    return (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 text-sm">
                          {format(new Date(record.createdAt), "dd/MM/yyyy")}
                        </td>
                        <td className="py-3">{record.student.nis || "-"}</td>
                        <td className="py-3">{record.student.user.name}</td>
                        <td className="py-3 text-sm">{record.type}</td>
                        <td className="py-3 text-right">{formatCurrency(record.amount)}</td>
                        <td className="py-3 text-right text-green-600">
                          {formatCurrency(record.paidAmount)}
                        </td>
                        <td className="py-3 text-right font-medium">{formatCurrency(remaining)}</td>
                        <td className="py-3">{getStatusBadge(record.status)}</td>
                        <td className="py-3 text-sm">
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {format(new Date(record.dueDate), "dd MMM yyyy", { locale: id })}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          {record.status !== "PAID" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRecord(record);
                                setPaymentAmount(remaining.toString());
                              }}
                            >
                              Bayar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Proses Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Siswa</p>
                  <p className="font-medium">{selectedRecord.student.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tagihan</p>
                  <p className="font-medium">{formatCurrency(selectedRecord.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sudah Dibayar</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(selectedRecord.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sisa Tagihan</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(selectedRecord.amount - selectedRecord.paidAmount)}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Jumlah Pembayaran</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Masukkan jumlah pembayaran"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleProcessPayment} disabled={processPaymentMutation.isPending}>
                    {processPaymentMutation.isPending ? "Memproses..." : "Proses Pembayaran"}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                    Batal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

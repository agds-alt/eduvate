"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import { PaymentStatus } from "@prisma/client";
import { Search, Download, Clock, AlertCircle } from "lucide-react";

export default function OtherPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Fetch all non-SPP finance records
  const { data: records = [], isLoading } = api.finance.getAll.useQuery({});

  // Get unique payment types
  const { data: types = [] } = api.finance.getTypes.useQuery();

  // Filter records (exclude SPP)
  const otherPayments = useMemo(() => {
    return records.filter((r) => r.type !== "SPP");
  }, [records]);

  // Filter by type and search
  const filteredRecords = useMemo(() => {
    return otherPayments.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        record.student.user.name.toLowerCase().includes(searchLower) ||
        record.student.nis?.toLowerCase().includes(searchLower) ||
        record.type.toLowerCase().includes(searchLower);

      const matchesType = typeFilter === "ALL" || record.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [otherPayments, searchTerm, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueTypes = new Set(otherPayments.map((r) => r.type)).size;
    const totalAmount = otherPayments.reduce((sum, r) => sum + r.paidAmount, 0);

    // This month
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const thisMonth = otherPayments.filter((r) => {
      const date = new Date(r.createdAt);
      return date >= monthStart && date <= monthEnd;
    }).length;

    const pending = otherPayments.filter((r) =>
      r.status === "UNPAID" || r.status === "PARTIAL"
    ).length;

    return { uniqueTypes, totalAmount, thisMonth, pending };
  }, [otherPayments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

    return (
      <span className={`rounded-md border px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleExport = () => {
    const headers = ["Tanggal", "NIS", "Nama Siswa", "Jenis", "Total", "Terbayar", "Status"];
    const rows = filteredRecords.map((record) => [
      format(new Date(record.createdAt), "dd/MM/yyyy"),
      record.student.nis || "-",
      record.student.user.name,
      record.type,
      record.amount,
      record.paidAmount,
      record.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `pembayaran-lainnya-${format(new Date(), "yyyy-MM-dd")}.csv`);
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
                <Search className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Pembayaran Lainnya</h2>
                <p className="mt-1 text-emerald-100">
                  Kelola pembayaran selain SPP
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
                  Jenis Pembayaran
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {stats.uniqueTypes}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-4">
                <Search className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Transaksi
                </p>
                <p className="mt-2 text-xl font-bold text-green-600">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <Download className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bulan Ini
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <AlertCircle className="h-7 w-7 text-yellow-600" />
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
                placeholder="Cari siswa, NIS, atau jenis pembayaran..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Semua Jenis</option>
                {types.filter(t => t !== "SPP").map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran Lainnya ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">💳</div>
              <p>Belum ada data pembayaran lainnya</p>
              <p className="mt-2 text-sm">Seperti: Seragam, Buku, Kegiatan, Ujian, dll</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Tanggal</th>
                    <th className="py-3 text-left font-medium">NIS</th>
                    <th className="py-3 text-left font-medium">Nama Siswa</th>
                    <th className="py-3 text-left font-medium">Jenis Pembayaran</th>
                    <th className="py-3 text-right font-medium">Total</th>
                    <th className="py-3 text-right font-medium">Terbayar</th>
                    <th className="py-3 text-right font-medium">Sisa</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 text-sm">
                        {format(new Date(record.createdAt), "dd/MM/yyyy")}
                      </td>
                      <td className="py-3">{record.student.nis || "-"}</td>
                      <td className="py-3">{record.student.user.name}</td>
                      <td className="py-3">
                        <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {record.type}
                        </span>
                      </td>
                      <td className="py-3 text-right">{formatCurrency(record.amount)}</td>
                      <td className="py-3 text-right text-green-600">
                        {formatCurrency(record.paidAmount)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(record.amount - record.paidAmount)}
                      </td>
                      <td className="py-3">{getStatusBadge(record.status)}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {record.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

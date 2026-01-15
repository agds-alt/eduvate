"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { id } from "date-fns/locale";
import { Download, TrendingUp, DollarSign } from "lucide-react";

type PeriodType = "bulanan" | "semester" | "tahunan";

export default function FinanceReportPage() {
  const currentDate = new Date();
  const [period, setPeriod] = useState<PeriodType>("bulanan");
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    if (period === "bulanan") {
      return {
        startDate: startOfMonth(new Date(selectedYear, selectedMonth - 1)),
        endDate: endOfMonth(new Date(selectedYear, selectedMonth - 1)),
      };
    } else if (period === "tahunan") {
      return {
        startDate: startOfYear(new Date(selectedYear, 0)),
        endDate: endOfYear(new Date(selectedYear, 0)),
      };
    } else {
      // Semester 1 (Jan-Jun) or Semester 2 (Jul-Dec)
      const isSemester1 = selectedMonth <= 6;
      return {
        startDate: new Date(selectedYear, isSemester1 ? 0 : 6, 1),
        endDate: new Date(selectedYear, isSemester1 ? 5 : 11, 31),
      };
    }
  }, [period, selectedMonth, selectedYear]);

  // Fetch finance records
  const { data: records = [], isLoading } = api.finance.getAll.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Get payment types
  const { data: types = [] } = api.finance.getTypes.useQuery();

  // Filter records by type
  const filteredRecords = useMemo(() => {
    if (typeFilter === "ALL") return records;
    return records.filter((r) => r.type === typeFilter);
  }, [records, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = filteredRecords.reduce((sum, r) => sum + r.paidAmount, 0);
    const totalBilling = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalPending = totalBilling - totalIncome;
    const collectionRate = totalBilling > 0 ? ((totalIncome / totalBilling) * 100).toFixed(1) : "0";

    return {
      totalIncome,
      totalBilling,
      totalPending,
      collectionRate,
    };
  }, [filteredRecords]);

  // Breakdown by payment type
  const breakdownByType = useMemo(() => {
    const breakdown: Record<
      string,
      { total: number; paid: number; pending: number; count: number }
    > = {};

    filteredRecords.forEach((record) => {
      if (!breakdown[record.type]) {
        breakdown[record.type] = { total: 0, paid: 0, pending: 0, count: 0 };
      }
      breakdown[record.type]!.total += record.amount;
      breakdown[record.type]!.paid += record.paidAmount;
      breakdown[record.type]!.pending += record.amount - record.paidAmount;
      breakdown[record.type]!.count += 1;
    });

    return Object.entries(breakdown)
      .map(([type, data]) => ({
        type,
        ...data,
        collectionRate: data.total > 0 ? ((data.paid / data.total) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.paid - a.paid);
  }, [filteredRecords]);

  // Breakdown by status
  const breakdownByStatus = useMemo(() => {
    const breakdown = {
      PAID: { count: 0, amount: 0 },
      UNPAID: { count: 0, amount: 0 },
      PARTIAL: { count: 0, amount: 0 },
      OVERDUE: { count: 0, amount: 0 },
    };

    filteredRecords.forEach((record) => {
      if (breakdown[record.status]) {
        breakdown[record.status].count += 1;
        breakdown[record.status].amount += record.amount;
      }
    });

    return breakdown;
  }, [filteredRecords]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    const headers = [
      "Tanggal",
      "NIS",
      "Nama Siswa",
      "Jenis Pembayaran",
      "Total Tagihan",
      "Terbayar",
      "Sisa",
      "Status",
      "Jatuh Tempo",
    ];

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
    link.setAttribute(
      "download",
      `rekap-keuangan-${format(dateRange.startDate, "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rekap Keuangan</h2>
          <p className="text-muted-foreground">Laporan pemasukan dan pengeluaran sekolah</p>
        </div>
        <Button onClick={handleExport} disabled={filteredRecords.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Laporan
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">Semua Kategori</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Periode</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
              >
                <option value="bulanan">Bulanan</option>
                <option value="semester">Semester</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
            {period === "bulanan" && (
              <div>
                <label className="mb-2 block text-sm font-medium">Bulan</label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-4 py-2"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </div>
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.totalBilling)}
              </div>
              <p className="text-sm text-muted-foreground">Total Tagihan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(stats.totalPending)}
              </div>
              <p className="text-sm text-muted-foreground">Piutang</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.collectionRate}%</div>
              <p className="text-sm text-muted-foreground">Tingkat Penagihan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Jenis Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">⏳</div>
                <p>Memuat data...</p>
              </div>
            ) : breakdownByType.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">📊</div>
                <p>Tidak ada data untuk periode ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {breakdownByType.map((item) => (
                  <div key={item.type} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">{item.count} transaksi</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(item.paid)}</p>
                        <p className="text-xs text-muted-foreground">
                          dari {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${item.collectionRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Tingkat Penagihan: {item.collectionRate}%
                      </span>
                      <span className="text-yellow-600 font-medium">
                        Pending: {formatCurrency(item.pending)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Lunas</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.PAID.count} tagihan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(breakdownByStatus.PAID.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sebagian</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.PARTIAL.count} tagihan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600">
                    {formatCurrency(breakdownByStatus.PARTIAL.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Belum Dibayar</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.UNPAID.count} tagihan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-600">
                    {formatCurrency(breakdownByStatus.UNPAID.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <DollarSign className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Terlambat</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.OVERDUE.count} tagihan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">
                    {formatCurrency(breakdownByStatus.OVERDUE.amount)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Laporan Keuangan</CardTitle>
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
              <p>Tidak ada data keuangan untuk periode yang dipilih</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Periode Laporan</p>
                    <p className="mt-1 font-medium">
                      {format(dateRange.startDate, "dd MMM", { locale: id })} -{" "}
                      {format(dateRange.endDate, "dd MMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transaksi</p>
                    <p className="mt-1 text-xl font-bold">{filteredRecords.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kategori</p>
                    <p className="mt-1 font-medium">
                      {typeFilter === "ALL" ? "Semua Kategori" : typeFilter}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Tagihan:</span>
                  <span className="font-medium">{formatCurrency(stats.totalBilling)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Pemasukan:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(stats.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Piutang:</span>
                  <span className="font-medium text-yellow-600">
                    {formatCurrency(stats.totalPending)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold">Tingkat Penagihan:</span>
                  <span className="font-bold text-primary">{stats.collectionRate}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

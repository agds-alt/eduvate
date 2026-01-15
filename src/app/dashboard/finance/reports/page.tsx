"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { id } from "date-fns/locale";
import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function FinanceReportsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Calculate date range
  const dateRange = useMemo(() => {
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth - 1));
    return { startDate, endDate };
  }, [selectedYear, selectedMonth]);

  // Fetch finance stats
  const { data: stats } = api.finance.getStats.useQuery(dateRange);

  // Fetch all records for breakdown
  const { data: records = [] } = api.finance.getAll.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Get payment types
  const { data: types = [] } = api.finance.getTypes.useQuery();

  // Calculate breakdown by type
  const breakdownByType = useMemo(() => {
    const breakdown: Record<string, { total: number; paid: number; unpaid: number; count: number }> = {};

    records.forEach((record) => {
      if (!breakdown[record.type]) {
        breakdown[record.type] = { total: 0, paid: 0, unpaid: 0, count: 0 };
      }
      breakdown[record.type]!.total += record.amount;
      breakdown[record.type]!.paid += record.paidAmount;
      breakdown[record.type]!.unpaid += record.amount - record.paidAmount;
      breakdown[record.type]!.count += 1;
    });

    return Object.entries(breakdown).map(([type, data]) => ({
      type,
      ...data,
    }));
  }, [records]);

  // Calculate by status
  const breakdownByStatus = useMemo(() => {
    const breakdown = {
      PAID: { count: 0, amount: 0 },
      UNPAID: { count: 0, amount: 0 },
      PARTIAL: { count: 0, amount: 0 },
      OVERDUE: { count: 0, amount: 0 },
    };

    records.forEach((record) => {
      if (breakdown[record.status]) {
        breakdown[record.status].count += 1;
        breakdown[record.status].amount += record.amount;
      }
    });

    return breakdown;
  }, [records]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    const headers = ["Jenis Pembayaran", "Jumlah Transaksi", "Total Tagihan", "Sudah Dibayar", "Belum Dibayar"];
    const rows = breakdownByType.map((item) => [
      item.type,
      item.count,
      item.total,
      item.paid,
      item.unpaid,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan-keuangan-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = stats?.totalIncome || 0;
  const totalPending = stats?.totalPending || 0;
  const balance = totalIncome;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Laporan Keuangan</h2>
          <p className="text-muted-foreground">Laporan pemasukan dan pengeluaran sekolah</p>
        </div>
        <Button onClick={handleExport} disabled={breakdownByType.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(dateRange.startDate, "dd MMM", { locale: id })} -{" "}
                {format(dateRange.endDate, "dd MMM yyyy", { locale: id })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
              <div className="text-3xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="mt-1 text-xs text-muted-foreground">Belum dibayar / Sebagian</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(balance)}</div>
              <p className="text-sm text-muted-foreground">Saldo Diterima</p>
              <p className="mt-1 text-xs text-muted-foreground">Total yang sudah dibayar</p>
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
            {breakdownByType.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">📊</div>
                <p>Belum ada data untuk periode ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {breakdownByType.map((item) => (
                  <div key={item.type} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
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
                    <div className="mt-2">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(item.paid / item.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Lunas</p>
                    <p className="text-sm text-muted-foreground">{breakdownByStatus.PAID.count} tagihan</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{formatCurrency(breakdownByStatus.PAID.amount)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="font-medium">Sebagian</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.PARTIAL.count} tagihan
                    </p>
                  </div>
                </div>
                <p className="font-bold text-yellow-600">
                  {formatCurrency(breakdownByStatus.PARTIAL.amount)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <div>
                    <p className="font-medium">Belum Dibayar</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.UNPAID.count} tagihan
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-600">{formatCurrency(breakdownByStatus.UNPAID.amount)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-medium">Terlambat</p>
                    <p className="text-sm text-muted-foreground">
                      {breakdownByStatus.OVERDUE.count} tagihan
                    </p>
                  </div>
                </div>
                <p className="font-bold text-red-600">
                  {formatCurrency(breakdownByStatus.OVERDUE.amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Transaksi:</span>
              <span className="font-medium">{records.length} transaksi</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Tagihan:</span>
              <span className="font-medium">
                {formatCurrency(records.reduce((sum, r) => sum + r.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Sudah Dibayar:</span>
              <span className="font-medium text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Belum Dibayar:</span>
              <span className="font-medium text-yellow-600">{formatCurrency(totalPending)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-semibold">Persentase Pembayaran:</span>
              <span className="font-bold text-primary">
                {records.length > 0
                  ? ((totalIncome / records.reduce((sum, r) => sum + r.amount, 0)) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

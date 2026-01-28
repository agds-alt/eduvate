"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Wallet, Users, CheckCircle, Clock, Filter, ClipboardList } from "lucide-react";

export default function PayrollPage() {
  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Penggajian</h2>
                <p className="mt-1 text-emerald-100">
                  Kelola gaji guru dan staff
                </p>
              </div>
            </div>
            <Button className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg">
              <Wallet className="mr-2 h-4 w-4" />
              Proses Gaji
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2">
              <Filter className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle>Filter Periode</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Bulan</label>
              <select className="w-full rounded-lg border border-input bg-background px-4 py-2">
                <option value="">Pilih Bulan</option>
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
              <select className="w-full rounded-lg border border-input bg-background px-4 py-2">
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Karyawan
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">0</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-4">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Gaji
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600">Rp 0</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <Wallet className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sudah Dibayar
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <CheckCircle className="h-7 w-7 text-blue-600" />
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
                <p className="mt-2 text-3xl font-bold text-yellow-600">0</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll List */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle>Daftar Penggajian</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gray-100 p-6">
                <Wallet className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <p className="font-medium">Belum ada data penggajian</p>
            <p className="mt-2 text-sm">Pilih bulan dan tahun untuk melihat data gaji</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

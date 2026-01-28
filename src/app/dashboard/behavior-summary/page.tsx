"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import {
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  Award,
  AlertCircle,
  Search,
  Filter,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";

type DateFilter = "all" | "thisMonth" | "lastMonth" | "custom";

export default function BehaviorSummaryPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("thisMonth");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const { data: studentsData } = api.student.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const getDateRange = () => {
    const now = new Date();

    switch (dateFilter) {
      case "thisMonth":
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
        };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
      case "custom":
        if (customStartDate && customEndDate) {
          return {
            startDate: new Date(customStartDate),
            endDate: new Date(customEndDate),
          };
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const dateRange = getDateRange();

  const { data: summary, isLoading } = api.behaviorRecord.getStudentSummary.useQuery(
    {
      studentId: selectedStudentId,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    },
    {
      enabled: !!selectedStudentId,
    }
  );

  const { data: studentDetails } = api.student.getById.useQuery(
    { id: selectedStudentId },
    { enabled: !!selectedStudentId }
  );

  const students = studentsData?.students || [];

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
              <h2 className="text-3xl font-bold">Rekap Sikap Siswa</h2>
              <p className="mt-1 text-blue-100">
                Lihat rekap catatan sikap, prestasi, dan pelanggaran per siswa
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student">
                Pilih Siswa <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa untuk melihat rekap..." />
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
              <Label htmlFor="dateFilter">Periode</Label>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                  <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Akhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedStudentId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-semibold">Pilih Siswa</p>
            <p className="text-sm text-muted-foreground">
              Pilih siswa dari dropdown di atas untuk melihat rekap sikap
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Memuat data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Student Info */}
          {studentDetails && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                    {studentDetails.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-2xl font-bold">{studentDetails.user.name}</h3>
                      {studentDetails.currentClass && (
                        <Badge variant="outline" className="text-sm">
                          {studentDetails.currentClass.name}
                        </Badge>
                      )}
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                      {studentDetails.nis && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>NIS: {studentDetails.nis}</span>
                        </div>
                      )}
                      {studentDetails.nisn && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>NISN: {studentDetails.nisn}</span>
                        </div>
                      )}
                      {dateRange && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Periode: {format(dateRange.startDate, "d MMM", { locale: id })} - {format(dateRange.endDate, "d MMM yyyy", { locale: id })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Catatan</p>
                    <p className="text-2xl font-bold">{summary?.totalRecords || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sikap Positif</p>
                    <p className="text-2xl font-bold text-green-600">{summary?.positiveCount || 0}</p>
                  </div>
                  <Award className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pelanggaran</p>
                    <p className="text-2xl font-bold text-red-600">{summary?.negativeCount || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={summary && summary.totalPoints >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Poin</p>
                    <p className={`text-2xl font-bold ${(summary?.totalPoints || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {summary?.totalPoints || 0}
                    </p>
                  </div>
                  {(summary?.totalPoints || 0) >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records History */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              {!summary || summary.records.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Belum ada catatan untuk periode yang dipilih
                </p>
              ) : (
                <div className="space-y-4">
                  {summary.records.map((record) => (
                    <Card
                      key={record.id}
                      className={`border-l-4 ${
                        record.category.type === "POSITIVE"
                          ? "border-l-green-500"
                          : "border-l-red-500"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                {format(new Date(record.date), "EEEE, d MMMM yyyy", { locale: id })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  record.category.type === "POSITIVE" ? "default" : "destructive"
                                }
                                className={record.category.type === "POSITIVE" ? "bg-green-500" : ""}
                              >
                                {record.category.name}
                              </Badge>
                              <Badge variant="outline">
                                {record.points > 0 ? `+${record.points}` : record.points} poin
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm">{record.description}</p>

                          {record.notes && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Catatan:</strong> {record.notes}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Download, Award, TrendingUp } from "lucide-react";

export default function AcademicReportPage() {
  const currentYear = new Date().getFullYear();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [academicYear, setAcademicYear] = useState(`${currentYear}/${currentYear + 1}`);

  // Fetch classes
  const { data: classes = [] } = api.class.getAll.useQuery();

  // Fetch subjects
  const { data: subjects = [] } = api.subject.getAll.useQuery();

  // Fetch exams
  const { data: exams = [] } = api.exam.getAll.useQuery({});

  // Fetch exam results
  const { data: results = [], isLoading } = api.examResult.getAll.useQuery({
    classId: selectedClassId || undefined,
    subjectId: selectedSubjectId || undefined,
    examId: selectedExamId || undefined,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (results.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        totalStudents: 0,
        passed: 0,
        failed: 0,
      };
    }

    const scores = results.map((r) => r.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = (totalScore / results.length).toFixed(1);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Passing grade is typically 75
    const passingGrade = 75;
    const passed = results.filter((r) => r.score >= passingGrade).length;
    const failed = results.length - passed;
    const passRate = ((passed / results.length) * 100).toFixed(1);

    return {
      averageScore: parseFloat(averageScore),
      highestScore,
      lowestScore,
      passRate: parseFloat(passRate),
      totalStudents: results.length,
      passed,
      failed,
    };
  }, [results]);

  // Group by subject for breakdown
  const subjectSummary = useMemo(() => {
    const subjectMap = new Map<
      string,
      {
        subjectName: string;
        count: number;
        totalScore: number;
        average: number;
        highest: number;
        lowest: number;
      }
    >();

    results.forEach((result) => {
      const subjectName = result.exam.subject.name;
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          subjectName,
          count: 0,
          totalScore: 0,
          average: 0,
          highest: 0,
          lowest: 100,
        });
      }

      const data = subjectMap.get(subjectName)!;
      data.count++;
      data.totalScore += result.score;
      data.highest = Math.max(data.highest, result.score);
      data.lowest = Math.min(data.lowest, result.score);
    });

    return Array.from(subjectMap.values())
      .map((data) => ({
        ...data,
        average: (data.totalScore / data.count).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
  }, [results]);

  // Group by class for comparison
  const classSummary = useMemo(() => {
    const classMap = new Map<
      string,
      {
        className: string;
        count: number;
        totalScore: number;
        average: number;
      }
    >();

    results.forEach((result) => {
      const className = result.class?.name || "Tidak ada kelas";
      if (!classMap.has(className)) {
        classMap.set(className, {
          className,
          count: 0,
          totalScore: 0,
          average: 0,
        });
      }

      const data = classMap.get(className)!;
      data.count++;
      data.totalScore += result.score;
    });

    return Array.from(classMap.values())
      .map((data) => ({
        ...data,
        average: parseFloat((data.totalScore / data.count).toFixed(1)),
      }))
      .sort((a, b) => b.average - a.average);
  }, [results]);

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    const distribution = {
      A: 0, // 90-100
      B: 0, // 80-89
      C: 0, // 70-79
      D: 0, // 60-69
      E: 0, // 0-59
    };

    results.forEach((result) => {
      if (result.score >= 90) distribution.A++;
      else if (result.score >= 80) distribution.B++;
      else if (result.score >= 70) distribution.C++;
      else if (result.score >= 60) distribution.D++;
      else distribution.E++;
    });

    return distribution;
  }, [results]);

  const handleExport = () => {
    const headers = [
      "Tanggal Ujian",
      "NIS",
      "Nama Siswa",
      "Kelas",
      "Mata Pelajaran",
      "Jenis Ujian",
      "Nilai",
      "Keterangan",
    ];

    const rows = results.map((result) => [
      format(new Date(result.exam.examDate), "dd/MM/yyyy"),
      result.student.nis || "-",
      result.student.user.name,
      result.class?.name || "-",
      result.exam.subject.name,
      result.exam.name,
      result.score,
      result.score >= 75 ? "Lulus" : "Tidak Lulus",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `rekap-akademik-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Rekap Akademik</h2>
                <p className="mt-1 text-orange-100">
                  Laporan prestasi dan nilai akademik
                </p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={results.length === 0}
              className="bg-white text-orange-600 hover:bg-white/90 shadow-lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Laporan
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Kelas</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.academicYear}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Mata Pelajaran</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">Semua Mapel</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Ujian</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">Semua Ujian</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun Ajaran</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2025/2026">2025/2026</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rata-rata Nilai
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.averageScore}</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nilai Tertinggi
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.highestScore}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Award className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nilai Terendah
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.lowestScore}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <Award className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tingkat Kelulusan
                </p>
                <p className="mt-2 text-3xl font-bold text-purple-600">{stats.passRate}%</p>
              </div>
              <div className="rounded-full bg-purple-100 p-4">
                <Award className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">⏳</div>
                <p>Memuat data...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">📊</div>
                <p>Tidak ada data untuk filter yang dipilih</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">A (90-100)</p>
                      <p className="text-sm text-muted-foreground">Sangat Baik</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{gradeDistribution.A}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((gradeDistribution.A / stats.totalStudents) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">B (80-89)</p>
                      <p className="text-sm text-muted-foreground">Baik</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{gradeDistribution.B}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((gradeDistribution.B / stats.totalStudents) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">C (70-79)</p>
                      <p className="text-sm text-muted-foreground">Cukup</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{gradeDistribution.C}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((gradeDistribution.C / stats.totalStudents) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">D (60-69)</p>
                      <p className="text-sm text-muted-foreground">Kurang</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{gradeDistribution.D}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((gradeDistribution.D / stats.totalStudents) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <Award className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">E (0-59)</p>
                      <p className="text-sm text-muted-foreground">Sangat Kurang</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{gradeDistribution.E}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({((gradeDistribution.E / stats.totalStudents) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClassId ? "Rata-rata per Mata Pelajaran" : "Perbandingan Antar Kelas"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="mb-4 text-4xl">📈</div>
                <p>Tidak ada data untuk ditampilkan</p>
              </div>
            ) : selectedClassId ? (
              <div className="space-y-4">
                {subjectSummary.map((subject) => (
                  <div key={subject.subjectName} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{subject.subjectName}</span>
                      <div className="flex items-center gap-1 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">{subject.average}</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${subject.average}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>Tertinggi: {subject.highest}</span>
                      <span>Terendah: {subject.lowest}</span>
                      <span>Siswa: {subject.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {classSummary.map((cls) => (
                  <div key={cls.className} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{cls.className}</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">{cls.average}</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${cls.average}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Total Siswa: {cls.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Rekap Akademik</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">⏳</div>
              <p>Memuat data...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">📚</div>
              <p>Pilih filter untuk melihat rekap akademik</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Total Siswa</p>
                    <p className="text-xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lulus</p>
                    <p className="text-xl font-bold text-green-600">{stats.passed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tidak Lulus</p>
                    <p className="text-xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tingkat Kelulusan</p>
                    <p className="text-xl font-bold text-primary">{stats.passRate}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Hasil Ujian:</span>
                  <span className="font-medium">{results.length} data</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Rata-rata Nilai:</span>
                  <span className="font-medium text-blue-600">{stats.averageScore}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Nilai Tertinggi:</span>
                  <span className="font-medium text-green-600">{stats.highestScore}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Nilai Terendah:</span>
                  <span className="font-medium text-yellow-600">{stats.lowestScore}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold">Tahun Ajaran:</span>
                  <span className="font-bold text-primary">{academicYear}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

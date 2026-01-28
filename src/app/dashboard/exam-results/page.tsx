"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc-provider";
import { Award, Plus, TrendingUp, CheckCircle2, XCircle, Users, Pencil, Trash2, Filter } from "lucide-react";

export default function ExamResultsPage() {
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    examId: "",
    studentId: "",
    score: 0,
    grade: "",
    notes: "",
  });

  // Fetch data
  const utils = api.useUtils();
  const { data: stats, isLoading: statsLoading } = api.examResult.getStats.useQuery();
  const { data: results, isLoading: resultsLoading } = api.examResult.getAll.useQuery({
    examId: selectedExam || undefined,
    classId: selectedClass || undefined,
  });
  const { data: exams } = api.exam.getAll.useQuery({});
  const { data: classes } = api.class.getAll.useQuery({});
  const { data: students } = api.student.getAll.useQuery({});

  // Create mutation
  const createResult = api.examResult.create.useMutation({
    onSuccess: () => {
      void utils.examResult.getAll.invalidate();
      void utils.examResult.getStats.invalidate();
      setIsModalOpen(false);
      setFormData({
        examId: "",
        studentId: "",
        score: 0,
        grade: "",
        notes: "",
      });
      alert("Nilai berhasil disimpan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const isLoading = statsLoading || resultsLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createResult.mutate(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" ? parseFloat(value) : value,
    }));
  };

  // Calculate pass/fail statistics
  const passCount = results?.filter((r) => r.score >= 75).length ?? 0;
  const failCount = results?.filter((r) => r.score < 75).length ?? 0;

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Hasil Ujian</h2>
                <p className="mt-1 text-amber-100">
                  Lihat dan kelola hasil ujian siswa
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-amber-600 shadow-lg transition-all hover:bg-white/90"
            >
              <Plus className="h-5 w-5" />
              Input Nilai
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Filter Section with Gradient Background */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4 text-amber-600" />
                Filter Ujian
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Ujian</option>
                {exams?.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.subject.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-orange-600" />
                Filter Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Semua Kelas</option>
                {classes?.classes?.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-amber-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ujian Dinilai
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : stats?.totalResults ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Total hasil</p>
              </div>
              <div className="rounded-full bg-amber-100 p-4">
                <Award className="h-7 w-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rata-rata Nilai
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : stats?.avgScore ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Nilai rerata</p>
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
                  Lulus (≥75)
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : passCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Siswa berhasil</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <CheckCircle2 className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-red-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tidak Lulus (&lt;75)
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : failCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Perlu remedial</p>
              </div>
              <div className="rounded-full bg-red-100 p-4">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle>Daftar Hasil Ujian</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
              <p>Memuat data...</p>
            </div>
          ) : results && results.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nama Siswa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ujian</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Kelas</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nilai</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Grade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const isPassed = result.score >= 75;

                    return (
                      <tr key={result.id} className="border-b transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-amber-100 p-1.5">
                              <Users className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <span className="font-medium">{result.student.user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{result.exam.title}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {result.exam.subject.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{result.exam.class.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                isPassed ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              <span
                                className={`text-lg font-bold ${
                                  isPassed ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {result.score}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {result.grade ? (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isPassed ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Lulus
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                              <XCircle className="h-3 w-3" />
                              Tidak Lulus
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100">
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                            <button className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-all hover:bg-red-100">
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg bg-white py-12 text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gray-100 p-6">
                  <Award className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Belum ada hasil ujian</p>
              <p className="mt-2 text-sm">Input nilai untuk memulai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Result Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Input Nilai Ujian</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-2xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Ujian <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="examId"
                      value={formData.examId}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="">Pilih Ujian</option>
                      {exams?.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title} - {exam.subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Siswa <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="">Pilih Siswa</option>
                      {students?.students?.map((student: any) => (
                        <option key={student.id} value={student.id}>
                          {student.user.name} - {student.nis}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Nilai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="score"
                      value={formData.score}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="0-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Grade (Opsional)</label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="">Pilih Grade</option>
                      <option value="A">A (90-100)</option>
                      <option value="B">B (80-89)</option>
                      <option value="C">C (70-79)</option>
                      <option value="D">D (60-69)</option>
                      <option value="E">E (&lt;60)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Catatan (Opsional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createResult.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {createResult.isPending ? "Menyimpan..." : "Simpan Nilai"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

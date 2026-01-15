"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc-provider";

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
  const { data: classes } = api.class.getAll.useQuery();
  const { data: students } = api.student.getAll.useQuery();

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Hasil Ujian</h2>
          <p className="text-muted-foreground">Lihat dan kelola hasil ujian siswa</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Input Nilai
        </button>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Filter Ujian</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
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
              <label className="mb-2 block text-sm font-medium">Filter Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">Semua Kelas</option>
                {classes?.map((cls) => (
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {isLoading ? "..." : stats?.totalResults ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Ujian Dinilai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {isLoading ? "..." : stats?.avgScore ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {isLoading ? "..." : passCount}
              </div>
              <p className="text-sm text-muted-foreground">Lulus (≥75)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {isLoading ? "..." : failCount}
              </div>
              <p className="text-sm text-muted-foreground">Tidak Lulus (&lt;75)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Hasil Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Memuat data...</p>
            </div>
          ) : results && results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Nama Siswa</th>
                    <th className="px-4 py-3 text-left">Ujian</th>
                    <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left">Kelas</th>
                    <th className="px-4 py-3 text-left">Nilai</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const isPassed = result.score >= 75;

                    return (
                      <tr key={result.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{result.student.user.name}</td>
                        <td className="px-4 py-3">{result.exam.title}</td>
                        <td className="px-4 py-3">{result.exam.subject.name}</td>
                        <td className="px-4 py-3">{result.exam.class.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              isPassed ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {result.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {result.grade ? (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                              {result.grade}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isPassed ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              Lulus
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                              Tidak Lulus
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button className="mr-3 text-sm text-blue-600 hover:underline">
                            Edit
                          </button>
                          <button className="text-sm text-red-600 hover:underline">Hapus</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <div className="mb-4 text-4xl">📊</div>
              <p>Belum ada hasil ujian</p>
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
                      {students?.map((student) => (
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

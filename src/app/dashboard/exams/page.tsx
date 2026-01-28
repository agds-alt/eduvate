"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc-provider";
import { FileText, Plus, Clock, CheckCircle2, Calendar, AlertCircle, Pencil, Trash2 } from "lucide-react";

export default function ExamsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "UTS",
    subjectId: "",
    classId: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    duration: 90,
  });

  // Fetch data
  const utils = api.useUtils();
  const { data: stats, isLoading: statsLoading } = api.exam.getStats.useQuery();
  const { data: exams, isLoading: examsLoading } = api.exam.getAll.useQuery({});
  const { data: classes } = api.class.getAll.useQuery({});
  const { data: subjects } = api.subject.getAll.useQuery({});
  const { data: teachers } = api.teacher.getAll.useQuery({});

  // Create mutation
  const createExam = api.exam.create.useMutation({
    onSuccess: () => {
      void utils.exam.getAll.invalidate();
      void utils.exam.getStats.invalidate();
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        type: "UTS",
        subjectId: "",
        classId: "",
        teacherId: "",
        startDate: "",
        endDate: "",
        duration: 90,
      });
      alert("Ujian berhasil dibuat!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const isLoading = statsLoading || examsLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExam.mutate({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) : value,
    }));
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Manajemen Ujian</h2>
                <p className="mt-1 text-red-100">
                  Kelola jadwal dan pelaksanaan ujian
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-red-600 shadow-lg transition-all hover:bg-white/90"
            >
              <Plus className="h-5 w-5" />
              Buat Ujian
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-red-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Ujian
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : stats?.totalExams ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Semua ujian</p>
              </div>
              <div className="rounded-full bg-red-100 p-4">
                <FileText className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sedang Berlangsung
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : stats?.ongoingExams ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Ujian aktif</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Selesai
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : stats?.completedExams ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Telah dilaksanakan</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Akan Datang
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {isLoading ? "..." : stats?.upcomingExams ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Dijadwalkan</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <Calendar className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-100 p-2">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle>Daftar Ujian</CardTitle>
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
          ) : exams && exams.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Judul</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Jenis</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Kelas</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => {
                    const now = new Date();
                    const isUpcoming = new Date(exam.startDate) > now;
                    const isCompleted = new Date(exam.endDate) < now;
                    const isOngoing = !isUpcoming && !isCompleted;

                    return (
                      <tr key={exam.id} className="border-b transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-red-100 p-1.5">
                              <FileText className="h-3.5 w-3.5 text-red-600" />
                            </div>
                            <span className="font-medium">{exam.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {exam.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{exam.subject.name}</td>
                        <td className="px-4 py-3 text-sm">
                          {exam.class.name} {exam.class.section}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(exam.startDate).toLocaleDateString("id-ID")}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isOngoing && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                              <Clock className="h-3 w-3" />
                              Berlangsung
                            </span>
                          )}
                          {isCompleted && (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Selesai
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                              <AlertCircle className="h-3 w-3" />
                              Akan Datang
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100">
                              <Pencil className="h-3 w-3" />
                              Detail
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
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <p className="font-medium">Belum ada data ujian</p>
              <p className="mt-2 text-sm">Buat ujian baru untuk memulai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Buat Ujian Baru</h3>
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
                      Judul Ujian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="contoh: Ujian Tengah Semester Matematika"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="Deskripsi ujian (opsional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Jenis Ujian <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      >
                        <option value="UTS">UTS (Ujian Tengah Semester)</option>
                        <option value="UAS">UAS (Ujian Akhir Semester)</option>
                        <option value="Ulangan Harian">Ulangan Harian</option>
                        <option value="Kuis">Kuis</option>
                        <option value="Ujian Praktik">Ujian Praktik</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Durasi (menit) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Kelas <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      >
                        <option value="">Pilih Kelas</option>
                        {classes?.classes?.map((cls: any) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} {cls.section}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Mata Pelajaran <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      >
                        <option value="">Pilih Mata Pelajaran</option>
                        {subjects?.subjects?.map((subject: any) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Pengawas <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="">Pilih Guru Pengawas</option>
                      {teachers?.teachers?.map((teacher: any) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Tanggal Mulai <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Tanggal Selesai <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      />
                    </div>
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
                    disabled={createExam.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {createExam.isPending ? "Menyimpan..." : "Buat Ujian"}
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

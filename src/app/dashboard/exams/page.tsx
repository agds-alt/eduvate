"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc-provider";

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
  const { data: classes } = api.class.getAll.useQuery();
  const { data: subjects } = api.subject.getAll.useQuery();
  const { data: teachers } = api.teacher.getAll.useQuery();

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Manajemen Ujian</h2>
          <p className="text-muted-foreground">Kelola jadwal dan pelaksanaan ujian</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Buat Ujian
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {isLoading ? "..." : stats?.totalExams ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Ujian</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {isLoading ? "..." : stats?.ongoingExams ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Sedang Berlangsung</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {isLoading ? "..." : stats?.completedExams ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {isLoading ? "..." : stats?.upcomingExams ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Akan Datang</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Memuat data...</p>
            </div>
          ) : exams && exams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">Judul</th>
                    <th className="px-4 py-3 text-left">Jenis</th>
                    <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left">Kelas</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => {
                    const now = new Date();
                    const isUpcoming = new Date(exam.startDate) > now;
                    const isCompleted = new Date(exam.endDate) < now;
                    const isOngoing = !isUpcoming && !isCompleted;

                    return (
                      <tr key={exam.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{exam.title}</td>
                        <td className="px-4 py-3">{exam.type}</td>
                        <td className="px-4 py-3">{exam.subject.name}</td>
                        <td className="px-4 py-3">
                          {exam.class.name} {exam.class.section}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(exam.startDate).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          {isOngoing && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                              Berlangsung
                            </span>
                          )}
                          {isCompleted && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              Selesai
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                              Akan Datang
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button className="mr-3 text-sm text-blue-600 hover:underline">
                            Detail
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
              <div className="mb-4 text-4xl">📝</div>
              <p>Belum ada data ujian</p>
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
                        {classes?.map((cls) => (
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
                        {subjects?.map((subject) => (
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
                      {teachers?.map((teacher) => (
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

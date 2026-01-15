"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

type ClassForm = {
  name: string;
  grade: number;
  section: string;
  academicYear: string;
  capacity: number;
};

export default function ClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClassForm>({
    name: "",
    grade: 1,
    section: "",
    academicYear: "2024/2025",
    capacity: 30,
  });

  const utils = api.useUtils();
  const { data, isLoading } = api.class.getAll.useQuery({
    page,
    limit: 12,
    search: search || undefined,
    grade: gradeFilter,
  });

  const createMutation = api.class.create.useMutation({
    onSuccess: () => {
      utils.class.getAll.invalidate();
      closeModal();
      alert("Kelas berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = api.class.update.useMutation({
    onSuccess: () => {
      utils.class.getAll.invalidate();
      closeModal();
      alert("Data kelas berhasil diupdate!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = api.class.delete.useMutation({
    onSuccess: () => {
      utils.class.getAll.invalidate();
      alert("Kelas berhasil dihapus!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const classes = data?.classes ?? [];
  const pagination = data?.pagination;

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      grade: 1,
      section: "",
      academicYear: "2024/2025",
      capacity: 30,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (classItem: any) => {
    setIsEditing(true);
    setEditingId(classItem.id);
    setFormData({
      name: classItem.name,
      grade: classItem.grade,
      section: classItem.section || "",
      academicYear: classItem.academicYear,
      capacity: classItem.capacity,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      grade: 1,
      section: "",
      academicYear: "2024/2025",
      capacity: 30,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama kelas harus diisi!");
      return;
    }

    if (!formData.academicYear) {
      alert("Tahun ajaran harus diisi!");
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        grade: formData.grade,
        section: formData.section || undefined,
        academicYear: formData.academicYear,
        capacity: formData.capacity,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        grade: formData.grade,
        section: formData.section || undefined,
        academicYear: formData.academicYear,
        capacity: formData.capacity,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kelas "${name}"? Siswa di kelas ini harus dipindahkan terlebih dahulu.`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading classes...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Data Kelas</h2>
          <p className="text-muted-foreground">
            Kelola data kelas dan rombongan belajar
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Tambah Kelas
        </button>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">
              {isEditing ? "Edit Data Kelas" : "Tambah Kelas Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="Contoh: 7A, X IPA 1"
                  required
                />
              </div>

              {/* Grade */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tingkat <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <option key={grade} value={grade}>
                      Kelas {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Rombel/Jurusan
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="Contoh: A, IPA, IPS"
                />
              </div>

              {/* Academic Year */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  required
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2023/2024">2023/2024</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kapasitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="30"
                  min="1"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Menyimpan..."
                    : isEditing
                    ? "Update"
                    : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Cari Kelas
              </label>
              <input
                type="text"
                placeholder="Nama kelas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Grade Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Filter Tingkat
              </label>
              <select
                value={gradeFilter ?? ""}
                onChange={(e) => {
                  setGradeFilter(
                    e.target.value ? parseInt(e.target.value) : undefined
                  );
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="">Semua Tingkat</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={grade}>
                    Kelas {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Tahun Ajaran
              </label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none">
                <option value="">Semua Tahun</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2022/2023">2022/2023</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Tidak ada data kelas
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((classItem) => (
              <Card
                key={classItem.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{classItem.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tingkat {classItem.grade}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {classItem.academicYear}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Homeroom Teacher */}
                    <div>
                      <p className="text-xs font-medium text-gray-600">
                        Wali Kelas
                      </p>
                      <p className="text-sm font-semibold">
                        {classItem.teachers[0]?.teacher.user.name ?? (
                          <span className="text-gray-400">Belum ada</span>
                        )}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 border-t pt-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {classItem._count.students}
                        </div>
                        <p className="text-xs text-gray-600">Siswa</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {classItem._count.teachers}
                        </div>
                        <p className="text-xs text-gray-600">Guru</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {classItem._count.subjects}
                        </div>
                        <p className="text-xs text-gray-600">Mapel</p>
                      </div>
                    </div>

                    {/* Capacity Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Kapasitas</span>
                        <span className="font-semibold">
                          {classItem._count.students} / {classItem.capacity}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            (classItem._count.students / classItem.capacity) *
                              100 >=
                            90
                              ? "bg-red-500"
                              : (classItem._count.students /
                                  classItem.capacity) *
                                  100 >=
                                75
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (classItem._count.students / classItem.capacity) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => openEditModal(classItem)}
                        className="flex-1 rounded bg-yellow-500 px-3 py-2 text-xs text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id, classItem.name)}
                        disabled={deleteMutation.isPending}
                        className="rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleteMutation.isPending ? "..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan {(page - 1) * 12 + 1} -{" "}
                {Math.min(page * 12, pagination.total)} dari {pagination.total}{" "}
                kelas
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        (p >= page - 1 && p <= page + 1)
                    )
                    .map((p, i, arr) => (
                      <div key={p} className="contents">
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span
                            className="px-2 py-2 text-sm"
                          >
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium ${
                            page === p
                              ? "bg-primary text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {pagination?.total ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Kelas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {classes.reduce((sum, c) => sum + c._count.students, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Siswa</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {classes.filter((c) => c.teachers.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Punya Wali Kelas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {classes.reduce(
                  (sum, c) => sum + Math.round((c._count.students / c.capacity) * 100),
                  0
                ) / (classes.length || 1)}
                %
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Kapasitas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

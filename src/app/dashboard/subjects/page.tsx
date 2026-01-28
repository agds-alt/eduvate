"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";
import { BookOpen, Plus, Search, Pencil, Trash2, GraduationCap, FileText, Award } from "lucide-react";

type SubjectForm = {
  name: string;
  code: string;
  description: string;
  subjectGroup: "Umum" | "Pilihan" | "";
};

export default function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectForm>({
    name: "",
    code: "",
    description: "",
    subjectGroup: "",
  });

  const utils = api.useUtils();
  const { data, isLoading } = api.subject.getAll.useQuery({
    page,
    limit: 20,
    search: search || undefined,
  });

  const createMutation = api.subject.create.useMutation({
    onSuccess: () => {
      utils.subject.getAll.invalidate();
      closeModal();
      alert("Mata pelajaran berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = api.subject.update.useMutation({
    onSuccess: () => {
      utils.subject.getAll.invalidate();
      closeModal();
      alert("Mata pelajaran berhasil diupdate!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = api.subject.delete.useMutation({
    onSuccess: () => {
      utils.subject.getAll.invalidate();
      alert("Mata pelajaran berhasil dihapus!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const subjects = data?.subjects ?? [];
  const pagination = data?.pagination;

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", code: "", description: "", subjectGroup: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: any) => {
    setIsEditing(true);
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      subjectGroup: subject.subjectGroup || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", code: "", description: "", subjectGroup: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama mata pelajaran harus diisi!");
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        subjectGroup: formData.subjectGroup || undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        subjectGroup: formData.subjectGroup || undefined,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus mata pelajaran "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading subjects...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Mata Pelajaran</h2>
                <p className="mt-1 text-emerald-100">
                  Kelola mata pelajaran dan kurikulum sekolah
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-600 shadow-lg transition-all hover:bg-white/90"
            >
              <Plus className="h-5 w-5" />
              Tambah Mata Pelajaran
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Mata Pelajaran
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {pagination?.total ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Semua mapel</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-4">
                <BookOpen className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Ujian
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {subjects.reduce((sum, s) => sum + s._count.exams, 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Dari semua mapel</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Penilaian
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {subjects.reduce((sum, s) => sum + s._count.grades, 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Nilai tersimpan</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <Award className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">
              {isEditing ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="Contoh: Matematika"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kode Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="Contoh: MTK"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  placeholder="Deskripsi mata pelajaran..."
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kelompok Mata Pelajaran
                </label>
                <select
                  value={formData.subjectGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectGroup: e.target.value as "Umum" | "Pilihan" | "" })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                >
                  <option value="">Pilih Kelompok</option>
                  <option value="Umum">Umum</option>
                  <option value="Pilihan">Pilihan</option>
                </select>
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

      {/* Search Card with Gradient Background */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Cari Mata Pelajaran
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nama atau kode mata pelajaran..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset to first page on search
                  }}
                  className="w-full rounded-lg border border-input bg-background px-12 py-2 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-end justify-end gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {subjects.filter((s) => s._count.classes > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">Mapel Aktif</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {subjects.reduce((sum, s) => sum + s._count.classes, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Kelas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Tidak ada data mata pelajaran
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className="group overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {subject.name}
                      </CardTitle>
                      {subject.code && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {subject.code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Description */}
                    {subject.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {subject.description}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <GraduationCap className="h-4 w-4 text-emerald-600" />
                          <div className="text-lg font-bold text-emerald-600">
                            {subject._count.classes}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Kelas</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div className="text-lg font-bold text-blue-600">
                            {subject._count.exams}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Ujian</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Award className="h-4 w-4 text-green-600" />
                          <div className="text-lg font-bold text-green-600">
                            {subject._count.grades}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Nilai</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id, subject.name)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
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
                Menampilkan {(page - 1) * 20 + 1} -{" "}
                {Math.min(page * 20, pagination.total)} dari {pagination.total}{" "}
                mata pelajaran
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
                          <span className="px-2 py-2 text-sm">...</span>
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

      {/* Subject Categories Summary */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-emerald-100 p-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-sm">Mata Pelajaran Aktif</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {subjects.filter((s) => s._count.classes > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Sedang diajarkan di kelas
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-sm">Total Ujian</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {subjects.reduce((sum, s) => sum + s._count.exams, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Ujian dari semua mapel
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-sm">Total Penilaian</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {subjects.reduce((sum, s) => sum + s._count.grades, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Nilai dari semua mapel
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

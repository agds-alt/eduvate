"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

type SubjectForm = {
  name: string;
  code: string;
  description: string;
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
    setFormData({ name: "", code: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: any) => {
    setIsEditing(true);
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", code: "", description: "" });
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
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
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
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Mata Pelajaran</h2>
          <p className="text-muted-foreground">
            Kelola mata pelajaran dan kurikulum sekolah
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Tambah Mata Pelajaran
        </button>
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

      {/* Search Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Cari Mata Pelajaran
              </label>
              <input
                type="text"
                placeholder="Nama atau kode mata pelajaran..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex items-end justify-end space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {pagination?.total ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Total Mapel</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
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
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      {subject.code && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Kode: {subject.code}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Description */}
                    {subject.description && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {subject.description}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 border-t pt-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {subject._count.classes}
                        </div>
                        <p className="text-xs text-gray-600">Kelas</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {subject._count.exams}
                        </div>
                        <p className="text-xs text-gray-600">Ujian</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {subject._count.grades}
                        </div>
                        <p className="text-xs text-gray-600">Nilai</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="flex-1 rounded bg-yellow-500 px-3 py-2 text-xs text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id, subject.name)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 rounded bg-red-500 px-3 py-2 text-xs text-white hover:bg-red-600 disabled:opacity-50"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mata Pelajaran Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {subjects.filter((s) => s._count.classes > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Sedang diajarkan di kelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Ujian</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Penilaian</CardTitle>
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

"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

type ParentForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  nik: string;
  occupation: string;
};

export default function ParentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ParentForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    nik: "",
    occupation: "",
  });

  const utils = api.useUtils();
  const { data, isLoading } = api.parent.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
  });

  const createMutation = api.parent.create.useMutation({
    onSuccess: () => {
      utils.parent.getAll.invalidate();
      closeModal();
      alert("Wali siswa berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = api.parent.update.useMutation({
    onSuccess: () => {
      utils.parent.getAll.invalidate();
      closeModal();
      alert("Data wali siswa berhasil diupdate!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = api.parent.delete.useMutation({
    onSuccess: () => {
      utils.parent.getAll.invalidate();
      alert("Wali siswa berhasil dihapus!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const parents = data?.parents ?? [];
  const pagination = data?.pagination;

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      nik: "",
      occupation: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (parent: any) => {
    setIsEditing(true);
    setEditingId(parent.id);
    setFormData({
      name: parent.user.name,
      email: parent.user.email || "",
      phone: parent.user.phone || "",
      address: parent.user.address || "",
      password: "", // Don't populate password for edit
      nik: parent.user.nik || "",
      occupation: parent.occupation || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      nik: "",
      occupation: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama harus diisi!");
      return;
    }

    if (!isEditing && !formData.password) {
      alert("Password harus diisi untuk wali baru!");
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        nik: formData.nik || undefined,
        occupation: formData.occupation || undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        password: formData.password,
        nik: formData.nik || undefined,
        occupation: formData.occupation || undefined,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus wali "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading parents...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Data Wali Siswa</h2>
          <p className="text-muted-foreground">Kelola data orang tua/wali siswa</p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Tambah Wali
        </button>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">
              {isEditing ? "Edit Data Wali" : "Tambah Wali Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="Nama lengkap wali"
                    required
                  />
                </div>

                {/* NIK */}
                <div>
                  <label className="mb-2 block text-sm font-medium">NIK</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData({ ...formData, nik: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="Nomor Induk Kependudukan"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="Contoh: PNS, Wiraswasta"
                  />
                </div>

                {/* Password - only for new parent */}
                {!isEditing && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                      placeholder="Minimal 6 karakter"
                      required={!isEditing}
                    />
                  </div>
                )}

                {/* Address - full width */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="Alamat lengkap"
                    rows={2}
                  />
                </div>
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
                Cari Wali Siswa
              </label>
              <input
                type="text"
                placeholder="Nama wali siswa..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
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
                <p className="text-xs text-muted-foreground">Total Wali</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Wali Siswa ({pagination?.total ?? 0} wali)</CardTitle>
        </CardHeader>
        <CardContent>
          {parents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">👨‍👩‍👧</div>
              <p>Belum ada data wali siswa</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Kontak
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Pekerjaan
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Jumlah Anak
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.map((parent, index) => (
                      <tr
                        key={parent.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm">
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{parent.user.name}</p>
                            {parent.user.nik && (
                              <p className="text-xs text-gray-500">
                                NIK: {parent.user.nik}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            {parent.user.phone && (
                              <p className="text-xs">{parent.user.phone}</p>
                            )}
                            {parent.user.email && (
                              <p className="text-xs text-gray-500">
                                {parent.user.email}
                              </p>
                            )}
                            {!parent.user.phone && !parent.user.email && (
                              <p className="text-gray-400">-</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {parent.occupation ? (
                            <span className="text-sm">{parent.occupation}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                            {parent._count.students} anak
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(parent)}
                              className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(parent.id, parent.user.name)}
                              disabled={deleteMutation.isPending}
                              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              {deleteMutation.isPending ? "..." : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan {(page - 1) * 10 + 1} -{" "}
                    {Math.min(page * 10, pagination.total)} dari{" "}
                    {pagination.total} wali
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
        </CardContent>
      </Card>
    </div>
  );
}

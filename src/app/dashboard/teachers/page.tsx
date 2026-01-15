"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

type TeacherForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  nik: string;
  employeeId: string;
  nip: string;
  position: string;
  subjects: string[];
};

export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeacherForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    nik: "",
    employeeId: "",
    nip: "",
    position: "",
    subjects: [],
  });

  const utils = api.useUtils();
  const { data, isLoading } = api.teacher.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
    position: positionFilter,
  });

  const createMutation = api.teacher.create.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      closeModal();
      alert("Guru berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = api.teacher.update.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      closeModal();
      alert("Data guru berhasil diupdate!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = api.teacher.delete.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      alert("Guru berhasil dihapus!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const teachers = data?.teachers ?? [];
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
      employeeId: "",
      nip: "",
      position: "",
      subjects: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: any) => {
    setIsEditing(true);
    setEditingId(teacher.id);
    setFormData({
      name: teacher.user.name,
      email: teacher.user.email || "",
      phone: teacher.user.phone || "",
      address: teacher.user.address || "",
      password: "", // Don't populate password for edit
      nik: teacher.user.nik || "",
      employeeId: teacher.employeeId || "",
      nip: teacher.nip || "",
      position: teacher.position || "",
      subjects: teacher.subjects || [],
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
      employeeId: "",
      nip: "",
      position: "",
      subjects: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama harus diisi!");
      return;
    }

    if (!isEditing && !formData.password) {
      alert("Password harus diisi untuk guru baru!");
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
        employeeId: formData.employeeId || undefined,
        nip: formData.nip || undefined,
        position: formData.position || undefined,
        subjects: formData.subjects.length > 0 ? formData.subjects : undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        password: formData.password,
        nik: formData.nik || undefined,
        employeeId: formData.employeeId || undefined,
        nip: formData.nip || undefined,
        position: formData.position || undefined,
        subjects: formData.subjects,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus guru "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading teachers...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Data Guru/Staff</h2>
          <p className="text-muted-foreground">
            Kelola data guru dan tenaga pendidik
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Tambah Guru
        </button>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">
              {isEditing ? "Edit Data Guru" : "Tambah Guru Baru"}
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
                    placeholder="Nama lengkap guru"
                    required
                  />
                </div>

                {/* NIP */}
                <div>
                  <label className="mb-2 block text-sm font-medium">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nip: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="Nomor Induk Pegawai"
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    ID Pegawai
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="ID internal pegawai"
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

                {/* Position */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Jabatan
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                  >
                    <option value="">Pilih Jabatan</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                    <option value="Guru">Guru</option>
                    <option value="Guru Wali Kelas">Guru Wali Kelas</option>
                    <option value="Staff TU">Staff TU</option>
                    <option value="Bendahara">Bendahara</option>
                  </select>
                </div>

                {/* Password - only for new teacher */}
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

      {/* Filters Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Cari Guru
              </label>
              <input
                type="text"
                placeholder="Nama, NIP, Email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Position Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Filter Jabatan
              </label>
              <select
                value={positionFilter ?? ""}
                onChange={(e) => {
                  setPositionFilter(e.target.value || undefined);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="">Semua Jabatan</option>
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                <option value="Guru">Guru</option>
                <option value="Guru Wali Kelas">Guru Wali Kelas</option>
                <option value="Staff TU">Staff TU</option>
                <option value="Bendahara">Bendahara</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Mata Pelajaran</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none">
                <option value="">Semua Mapel</option>
                {/* TODO: Load subjects dynamically */}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Guru ({pagination?.total ?? 0} guru)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Tidak ada data guru
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Foto
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Nama
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        NIP / ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Jabatan
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Kontak
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Kelas
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, index) => (
                      <tr
                        key={teacher.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm">
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {teacher.user.image ? (
                              <img
                                src={teacher.user.image}
                                alt={teacher.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              teacher.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{teacher.user.name}</p>
                            {teacher.user.email && (
                              <p className="text-xs text-gray-500">
                                {teacher.user.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            {teacher.nip && (
                              <p className="font-medium">NIP: {teacher.nip}</p>
                            )}
                            {teacher.employeeId && (
                              <p className="text-xs text-gray-500">
                                ID: {teacher.employeeId}
                              </p>
                            )}
                            {!teacher.nip && !teacher.employeeId && (
                              <p className="text-gray-400">-</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {teacher.position ? (
                            <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                              {teacher.position}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            {teacher.user.phone && (
                              <p className="text-xs">{teacher.user.phone}</p>
                            )}
                            {teacher.user.email && (
                              <p className="text-xs text-gray-500">
                                {teacher.user.email}
                              </p>
                            )}
                            {!teacher.user.phone && !teacher.user.email && (
                              <p className="text-gray-400">-</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {teacher.classes.length > 0 ? (
                            <div>
                              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                {teacher.classes.length} kelas
                              </span>
                              {teacher.classes.some((c) => c.isHomeroom) && (
                                <span className="ml-1 text-xs text-green-600">
                                  (Wali Kelas)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Belum ada kelas</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(teacher)}
                              className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(teacher.id, teacher.user.name)}
                              disabled={deleteMutation.isPending}
                              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                              title="Hapus"
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
                    {pagination.total} guru
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
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {pagination?.total ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Guru</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {
                  teachers.filter((t) => t.classes.some((c) => c.isHomeroom))
                    .length
                }
              </div>
              <p className="text-sm text-muted-foreground">Wali Kelas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {teachers.filter((t) => t.classes.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Mengajar Kelas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {teachers.reduce((sum, t) => sum + t._count.classes, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Kelas Diajar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

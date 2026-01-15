"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

type StudentForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  nik: string;
  nis: string;
  nisn: string;
  enrollmentYear: string;
  currentClassId: string;
};

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    nik: "",
    nis: "",
    nisn: "",
    enrollmentYear: "",
    currentClassId: "",
  });

  const utils = api.useUtils();
  const { data, isLoading } = api.student.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
    classId: classFilter,
  });

  const { data: classesData } = api.class.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const createMutation = api.student.create.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
      closeModal();
      alert("Siswa berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = api.student.update.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
      closeModal();
      alert("Siswa berhasil diupdate!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = api.student.delete.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
      alert("Siswa berhasil dihapus!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const students = data?.students ?? [];
  const pagination = data?.pagination;
  const classes = classesData?.classes ?? [];

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
      nis: "",
      nisn: "",
      enrollmentYear: new Date().getFullYear().toString(),
      currentClassId: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setIsEditing(true);
    setEditingId(student.id);
    setFormData({
      name: student.user.name,
      email: student.user.email || "",
      phone: student.user.phone || "",
      address: student.user.address || "",
      password: "",
      nik: student.user.nik || "",
      nis: student.nis || "",
      nisn: student.nisn || "",
      enrollmentYear: student.enrollmentYear?.toString() || "",
      currentClassId: student.currentClassId || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama siswa harus diisi!");
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
        nis: formData.nis || undefined,
        nisn: formData.nisn || undefined,
        enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear) : undefined,
        currentClassId: formData.currentClassId || null,
      });
    } else {
      if (!formData.password) {
        alert("Password harus diisi!");
        return;
      }
      createMutation.mutate({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        password: formData.password,
        nik: formData.nik || undefined,
        nis: formData.nis || undefined,
        nisn: formData.nisn || undefined,
        enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear) : undefined,
        currentClassId: formData.currentClassId || undefined,
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus siswa "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Data Siswa</h2>
          <p className="text-muted-foreground">
            Kelola data siswa dan informasi akademik
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Tambah Siswa
        </button>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">
              {isEditing ? "Edit Siswa" : "Tambah Siswa Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">NIS</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">NISN</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">NIK</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      required={!isEditing}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium">Tahun Masuk</label>
                  <input
                    type="number"
                    value={formData.enrollmentYear}
                    onChange={(e) => setFormData({ ...formData, enrollmentYear: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Kelas</label>
                  <select
                    value={formData.currentClassId}
                    onChange={(e) => setFormData({ ...formData, currentClassId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.academicYear}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
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
                Cari Siswa
              </label>
              <input
                type="text"
                placeholder="Nama, NIS, NISN..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Class Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Filter Kelas
              </label>
              <select
                value={classFilter ?? ""}
                onChange={(e) => {
                  setClassFilter(e.target.value || undefined);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              >
                <option value="">Semua Kelas</option>
                {/* TODO: Load classes dynamically */}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none">
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Siswa ({pagination?.total ?? 0} siswa)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Tidak ada data siswa
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
                        NIS / NISN
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Kelas
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Kontak
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr
                        key={student.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm">
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {student.user.image ? (
                              <img
                                src={student.user.image}
                                alt={student.user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              student.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{student.user.name}</p>
                            {student.user.email && (
                              <p className="text-xs text-gray-500">
                                {student.user.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            {student.nis && (
                              <p className="font-medium">NIS: {student.nis}</p>
                            )}
                            {student.nisn && (
                              <p className="text-xs text-gray-500">
                                NISN: {student.nisn}
                              </p>
                            )}
                            {!student.nis && !student.nisn && (
                              <p className="text-gray-400">-</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {student.currentClass ? (
                            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                              {student.currentClass.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">Belum ada kelas</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            {student.user.phone && (
                              <p className="text-xs">{student.user.phone}</p>
                            )}
                            {student.parents.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Ortu: {student.parents[0]?.parent.user.name}
                              </p>
                            )}
                            {!student.user.phone &&
                              student.parents.length === 0 && (
                                <p className="text-gray-400">-</p>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              student.isAlumni
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {student.isAlumni ? "Alumni" : "Aktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(student.id, student.user.name)}
                              disabled={deleteMutation.isPending}
                              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                              title="Hapus"
                            >
                              Hapus
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
                    {pagination.total} siswa
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
              <p className="text-sm text-muted-foreground">Total Siswa</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {students.filter((s) => !s.isAlumni).length}
              </div>
              <p className="text-sm text-muted-foreground">Siswa Aktif</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {students.filter((s) => s.isAlumni).length}
              </div>
              <p className="text-sm text-muted-foreground">Alumni</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {students.filter((s) => s.currentClass).length}
              </div>
              <p className="text-sm text-muted-foreground">Punya Kelas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

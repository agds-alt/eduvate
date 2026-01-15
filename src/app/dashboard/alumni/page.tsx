"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc-provider";

export default function AlumniPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nis: "",
    nisn: "",
    graduationYear: new Date().getFullYear(),
  });

  // Fetch alumni data
  const utils = api.useUtils();
  const { data: stats, isLoading: statsLoading } = api.alumni.getStats.useQuery();
  const { data: alumni, isLoading: alumniLoading } = api.alumni.getAll.useQuery();
  const { data: graduationYears } = api.alumni.getGraduationYears.useQuery();

  // Create mutation
  const createAlumni = api.alumni.createDirect.useMutation({
    onSuccess: () => {
      // Refresh data
      void utils.alumni.getAll.invalidate();
      void utils.alumni.getStats.invalidate();
      void utils.alumni.getGraduationYears.invalidate();
      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        nis: "",
        nisn: "",
        graduationYear: new Date().getFullYear(),
      });
      alert("Alumni berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const isLoading = statsLoading || alumniLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAlumni.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "graduationYear" ? parseInt(value) : value,
    }));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Data Alumni</h2>
          <p className="text-muted-foreground">Kelola data alumni sekolah</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          + Tambah Alumni
        </button>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun Kelulusan</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Tahun</option>
                {graduationYears?.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                <option value="">Semua Status</option>
                <option value="kuliah">Kuliah</option>
                <option value="kerja">Bekerja</option>
                <option value="wirausaha">Wirausaha</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Cari</label>
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {isLoading ? "..." : stats?.totalAlumni ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Alumni</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {isLoading ? "..." : stats?.thisYearAlumni ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Tahun Ini</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {isLoading ? "..." : stats?.continuingEducation ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Melanjutkan Kuliah</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {isLoading ? "..." : stats?.working ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Bekerja</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alumni List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Memuat data...</p>
            </div>
          ) : alumni && alumni.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nama</th>
                    <th className="text-left py-3 px-4">NIS</th>
                    <th className="text-left py-3 px-4">Tahun Kelulusan</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Telepon</th>
                    <th className="text-left py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.user.name}</td>
                      <td className="py-3 px-4">{item.nis || "-"}</td>
                      <td className="py-3 px-4">{item.graduationYear || "-"}</td>
                      <td className="py-3 px-4">{item.user.email || "-"}</td>
                      <td className="py-3 px-4">{item.user.phone || "-"}</td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:underline text-sm mr-3">
                          Detail
                        </button>
                        <button className="text-red-600 hover:underline text-sm">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">🎓</div>
              <p>Belum ada data alumni</p>
              <p className="text-sm mt-2">Tambahkan alumni untuk memulai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Alumni Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Tambah Alumni</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        NIS <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nis"
                        value={formData.nis}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        placeholder="20220001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        NISN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nisn"
                        value={formData.nisn}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        placeholder="0025000001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tahun Kelulusan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="alumni@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nomor Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="08123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alamat</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createAlumni.isPending}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {createAlumni.isPending ? "Menyimpan..." : "Simpan"}
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

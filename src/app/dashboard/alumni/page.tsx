"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/hooks/use-toast";
import { useState } from "react";
import {
  Award, Plus, Search, Edit, Trash2, Mail, Phone, MapPin,
  GraduationCap, ChevronLeft, ChevronRight, MoreVertical, Briefcase,
  BookOpen, TrendingUp, Calendar
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type AlumniFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  nis: string;
  nisn: string;
  graduationYear: number;
};

export default function AlumniPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [formData, setFormData] = useState<AlumniFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    nis: "",
    nisn: "",
    graduationYear: new Date().getFullYear(),
  });

  // Fetch data
  const utils = api.useUtils();
  const { data: stats, isLoading: statsLoading } = api.alumni.getStats.useQuery();
  const { data: alumni, isLoading: alumniLoading } = api.alumni.getAll.useQuery();
  const { data: graduationYears } = api.alumni.getGraduationYears.useQuery();

  // Mutations
  const createAlumni = api.alumni.createDirect.useMutation({
    onSuccess: () => {
      void utils.alumni.getAll.invalidate();
      void utils.alumni.getStats.invalidate();
      void utils.alumni.getGraduationYears.invalidate();
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Berhasil!",
        description: "Alumni berhasil ditambahkan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = statsLoading || alumniLoading;

  // Filter alumni
  const filteredAlumni = alumni?.filter((item) => {
    const matchesSearch = item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear || item.graduationYear?.toString() === selectedYear;
    return matchesSearch && matchesYear;
  }) ?? [];

  // Pagination
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlumni = filteredAlumni.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      nis: "",
      nisn: "",
      graduationYear: new Date().getFullYear(),
    });
    setEditingAlumni(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAlumni.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "graduationYear" ? parseInt(value) : value,
    }));
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus alumni ${name}?`)) {
      toast({
        title: "Info",
        description: "Fitur hapus akan segera tersedia.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Data Alumni</h1>
                <p className="mt-2 text-amber-100">Kelola data alumni dan jejak kesuksesan mereka</p>
              </div>
            </div>
            <Button onClick={openAddModal} size="lg" className="bg-white text-orange-600 hover:bg-white/90">
              <Plus className="mr-2 h-5 w-5" />
              Tambah Alumni
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white"></div>
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="overflow-hidden border-l-4 border-l-amber-500 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alumni</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalAlumni ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Semua alumni</p>
                </div>
                <div className="rounded-full bg-amber-100 p-4">
                  <Award className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tahun Ini</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.thisYearAlumni ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Alumni baru</p>
                </div>
                <div className="rounded-full bg-blue-100 p-4">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Melanjutkan Kuliah</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.continuingEducation ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pendidikan tinggi</p>
                </div>
                <div className="rounded-full bg-green-100 p-4">
                  <BookOpen className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bekerja</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.working ?? 0}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Sudah bekerja</p>
                </div>
                <div className="rounded-full bg-purple-100 p-4">
                  <Briefcase className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {graduationYears?.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <TrendingUp className="mr-2 h-4 w-4" />
                Filter Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedAlumni.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {paginatedAlumni.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={item.user.image ?? undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-semibold text-white">
                          {getInitials(item.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold leading-tight">{item.user.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {item.graduationYear && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              <GraduationCap className="mr-1 h-3 w-3" />
                              {item.graduationYear}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id, item.user.name)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4">
                    {item.nis && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-muted-foreground min-w-[60px]">NIS:</span>
                        <span className="text-foreground">{item.nis}</span>
                      </div>
                    )}
                    {item.user.email && (
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span className="break-all text-muted-foreground">{item.user.email}</span>
                      </div>
                    )}
                    {item.user.phone && (
                      <div className="flex items-start gap-2 text-sm">
                        <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{item.user.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAlumni.length)} dari {filteredAlumni.length} alumni
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <Award className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Belum ada data alumni</h3>
            <p className="mb-6 text-muted-foreground">
              Tambahkan alumni untuk memulai mengelola data alumni sekolah
            </p>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Alumni
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAlumni ? "Edit Alumni" : "Tambah Alumni"}</DialogTitle>
            <DialogDescription>
              {editingAlumni ? "Perbarui informasi alumni" : "Tambahkan alumni baru ke dalam sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nis">
                    NIS <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nis"
                    name="nis"
                    value={formData.nis}
                    onChange={handleInputChange}
                    placeholder="20220001"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nisn">
                    NISN <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nisn"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleInputChange}
                    placeholder="0025000001"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="graduationYear">
                  Tahun Kelulusan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.graduationYear.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, graduationYear: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alumni@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="08123456789"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createAlumni.isPending}>
                {createAlumni.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

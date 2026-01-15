"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/hooks/use-toast";
import { useState } from "react";
import {
  Users,
  UserCheck,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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

  const { toast } = useToast();
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
      toast({
        title: "Berhasil!",
        description: "Guru berhasil ditambahkan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.teacher.update.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      closeModal();
      toast({
        title: "Berhasil!",
        description: "Data guru berhasil diupdate.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.teacher.delete.useMutation({
    onSuccess: () => {
      utils.teacher.getAll.invalidate();
      toast({
        title: "Berhasil!",
        description: "Guru berhasil dihapus.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
      password: "",
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
      toast({
        title: "Error",
        description: "Nama harus diisi!",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !formData.password) {
      toast({
        title: "Error",
        description: "Password harus diisi untuk guru baru!",
        variant: "destructive",
      });
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      "Kepala Sekolah": "bg-purple-100 text-purple-800 border-purple-200",
      "Wakil Kepala Sekolah": "bg-indigo-100 text-indigo-800 border-indigo-200",
      Guru: "bg-blue-100 text-blue-800 border-blue-200",
      "Guru Wali Kelas": "bg-green-100 text-green-800 border-green-200",
      "Staff TU": "bg-orange-100 text-orange-800 border-orange-200",
      Bendahara: "bg-pink-100 text-pink-800 border-pink-200",
    };
    return colors[position] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Data Guru & Staff</h1>
                <p className="mt-2 text-blue-100">
                  Kelola data tenaga pendidik dan staff sekolah
                </p>
              </div>
            </div>
            <Button
              onClick={openAddModal}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-white/90"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Guru
            </Button>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white"></div>
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Guru
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {pagination?.total ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tenaga pendidik
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-4">
                    <Users className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Wali Kelas
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {
                        teachers.filter((t) =>
                          t.classes.some((c) => c.isHomeroom)
                        ).length
                      }
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Guru pembimbing
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-4">
                    <UserCheck className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mengajar Aktif
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {teachers.filter((t) => t.classes.length > 0).length}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Guru mengajar
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-4">
                    <GraduationCap className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-orange-500 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Kelas
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {teachers.reduce((sum, t) => sum + t._count.classes, 0)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Kelas diajar
                    </p>
                  </div>
                  <div className="rounded-full bg-orange-100 p-4">
                    <BookOpen className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Cari Guru
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Nama, NIP, Email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Jabatan
              </Label>
              <Select
                value={positionFilter ?? "all"}
                onValueChange={(value) => {
                  setPositionFilter(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Semua Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jabatan</SelectItem>
                  <SelectItem value="Kepala Sekolah">Kepala Sekolah</SelectItem>
                  <SelectItem value="Wakil Kepala Sekolah">
                    Wakil Kepala Sekolah
                  </SelectItem>
                  <SelectItem value="Guru">Guru</SelectItem>
                  <SelectItem value="Guru Wali Kelas">Guru Wali Kelas</SelectItem>
                  <SelectItem value="Staff TU">Staff TU</SelectItem>
                  <SelectItem value="Bendahara">Bendahara</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setPositionFilter(undefined);
                  setPage(1);
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Tidak ada data guru</h3>
            <p className="mt-2 text-muted-foreground">
              Mulai tambahkan data guru dengan klik tombol "Tambah Guru"
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <CardContent className="p-6">
                  {/* Header with Avatar and Actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={teacher.user.image ?? undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-semibold text-white">
                          {getInitials(teacher.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold leading-tight">
                          {teacher.user.name}
                        </h3>
                        {teacher.position && (
                          <Badge
                            variant="outline"
                            className={`mt-1.5 ${getPositionColor(teacher.position)}`}
                          >
                            <Award className="mr-1 h-3 w-3" />
                            {teacher.position}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditModal(teacher)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleDelete(teacher.id, teacher.user.name)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Info Section */}
                  <div className="mt-4 space-y-2 border-t pt-4">
                    {/* NIP/ID */}
                    {(teacher.nip || teacher.employeeId) && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {teacher.nip && `NIP: ${teacher.nip}`}
                          {teacher.nip && teacher.employeeId && " • "}
                          {teacher.employeeId && `ID: ${teacher.employeeId}`}
                        </span>
                      </div>
                    )}

                    {/* Email */}
                    {teacher.user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">
                          {teacher.user.email}
                        </span>
                      </div>
                    )}

                    {/* Phone */}
                    {teacher.user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {teacher.user.phone}
                        </span>
                      </div>
                    )}

                    {/* Classes */}
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {teacher.classes.length > 0
                          ? `${teacher.classes.length} kelas`
                          : "Belum ada kelas"}
                      </span>
                      {teacher.classes.some((c) => c.isHomeroom) && (
                        <Badge
                          variant="secondary"
                          className="ml-auto bg-green-100 text-green-700"
                        >
                          Wali Kelas
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {(page - 1) * 10 + 1} -{" "}
                  {Math.min(page * 10, pagination.total)} dari{" "}
                  {pagination.total} guru
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-1">
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
                            <span className="flex items-center px-2 text-sm text-muted-foreground">
                              ...
                            </span>
                          )}
                          <Button
                            variant={page === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(p)}
                            className="min-w-[2.5rem]"
                          >
                            {p}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Data Guru" : "Tambah Guru Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Perbarui informasi data guru"
                : "Lengkapi form untuk menambahkan guru baru"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nama lengkap guru"
                  required
                />
              </div>

              {/* NIP */}
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  type="text"
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  placeholder="Nomor Induk Pegawai"
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId">ID Pegawai</Label>
                <Input
                  id="employeeId"
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  placeholder="ID internal pegawai"
                />
              </div>

              {/* NIK */}
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  type="text"
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value })
                  }
                  placeholder="Nomor Induk Kependudukan"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position">Jabatan</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) =>
                    setFormData({ ...formData, position: value })
                  }
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Pilih Jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kepala Sekolah">
                      Kepala Sekolah
                    </SelectItem>
                    <SelectItem value="Wakil Kepala Sekolah">
                      Wakil Kepala Sekolah
                    </SelectItem>
                    <SelectItem value="Guru">Guru</SelectItem>
                    <SelectItem value="Guru Wali Kelas">
                      Guru Wali Kelas
                    </SelectItem>
                    <SelectItem value="Staff TU">Staff TU</SelectItem>
                    <SelectItem value="Bendahara">Bendahara</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password - only for new teacher */}
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Minimal 6 karakter"
                    required={!isEditing}
                  />
                </div>
              )}

              {/* Address - full width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Alamat lengkap"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Menyimpan..."
                  : isEditing
                  ? "Update"
                  : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

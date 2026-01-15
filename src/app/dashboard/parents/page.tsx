"use client";

import { api } from "~/lib/trpc-provider";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
  UsersRound,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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

  const { toast } = useToast();
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
      toast({
        title: "Berhasil!",
        description: "Wali siswa berhasil ditambahkan.",
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

  const updateMutation = api.parent.update.useMutation({
    onSuccess: () => {
      utils.parent.getAll.invalidate();
      closeModal();
      toast({
        title: "Berhasil!",
        description: "Data wali siswa berhasil diupdate.",
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

  const deleteMutation = api.parent.delete.useMutation({
    onSuccess: () => {
      utils.parent.getAll.invalidate();
      toast({
        title: "Berhasil!",
        description: "Wali siswa berhasil dihapus.",
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
      password: "",
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
        description: "Password harus diisi untuk wali baru!",
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <UsersRound className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Data Wali Siswa</h1>
                <p className="mt-2 text-purple-100">
                  Kelola data orang tua dan wali siswa
                </p>
              </div>
            </div>
            <Button
              onClick={openAddModal}
              size="lg"
              className="bg-white text-pink-600 hover:bg-white/90"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Wali
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white"></div>
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Wali
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {pagination?.total ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Orang tua/wali
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-4">
                <UsersRound className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-pink-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Siswa
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {parents.reduce((sum, p) => sum + p._count.students, 0)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Anak terdaftar
                </p>
              </div>
              <div className="rounded-full bg-pink-100 p-4">
                <Users className="h-7 w-7 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-rose-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bekerja
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {parents.filter((p) => p.occupation).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Punya pekerjaan
                </p>
              </div>
              <div className="rounded-full bg-rose-100 p-4">
                <Briefcase className="h-7 w-7 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Cari Wali Siswa
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Nama, email, telepon..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parents Grid */}
      {parents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersRound className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Tidak ada data wali</h3>
            <p className="mt-2 text-muted-foreground">
              Mulai tambahkan data wali dengan klik tombol "Tambah Wali"
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {parents.map((parent) => (
              <Card
                key={parent.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={parent.user.image ?? undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-semibold text-white">
                          {getInitials(parent.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold leading-tight">
                          {parent.user.name}
                        </h3>
                        {parent.occupation && (
                          <Badge
                            variant="outline"
                            className="mt-1.5 bg-purple-100 text-purple-800 border-purple-200"
                          >
                            <Briefcase className="mr-1 h-3 w-3" />
                            {parent.occupation}
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
                          onClick={() => openEditModal(parent)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleDelete(parent.id, parent.user.name)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4">
                    {parent.user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">
                          {parent.user.email}
                        </span>
                      </div>
                    )}

                    {parent.user.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {parent.user.phone}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {parent._count.students} anak terdaftar
                      </span>
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-blue-100 text-blue-700"
                      >
                        {parent._count.students} Siswa
                      </Badge>
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
                  {pagination.total} wali
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
              {isEditing ? "Edit Data Wali" : "Tambah Wali Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Perbarui informasi data wali siswa"
                : "Lengkapi form untuk menambahkan wali baru"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="Nama lengkap wali"
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="occupation">Pekerjaan</Label>
                <Input
                  id="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  placeholder="Contoh: PNS, Wiraswasta"
                />
              </div>

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
              <Button type="button" variant="outline" onClick={closeModal}>
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

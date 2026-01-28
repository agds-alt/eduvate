"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";
import {
  Plus,
  Users,
  Calendar,
  MapPin,
  User,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Activity,
} from "lucide-react";
import { useToast } from "~/hooks/use-toast";

export default function ExtracurricularPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExtracurricular, setSelectedExtracurricular] = useState<string>("");
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    coachId: "",
    schedule: "",
    location: "",
    maxCapacity: "",
  });

  const [memberFormData, setMemberFormData] = useState({
    studentId: "",
    notes: "",
  });

  const { data: extracurriculars, isLoading } = api.extracurricular.getAll.useQuery({});
  const { data: stats } = api.extracurricular.getStats.useQuery();
  const { data: teachers } = api.teacher.getAll.useQuery({ page: 1, limit: 100 });
  const { data: studentsData } = api.student.getAll.useQuery({ page: 1, limit: 100 });

  const { data: selectedEkskul } = api.extracurricular.getById.useQuery(
    { id: selectedExtracurricular },
    { enabled: !!selectedExtracurricular }
  );

  const utils = api.useUtils();

  const createMutation = api.extracurricular.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.extracurricular.getAll.invalidate();
      void utils.extracurricular.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.extracurricular.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.extracurricular.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.extracurricular.delete.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.extracurricular.getAll.invalidate();
      void utils.extracurricular.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = api.extracurricular.update.useMutation({
    onSuccess: () => {
      void utils.extracurricular.getAll.invalidate();
      void utils.extracurricular.getStats.invalidate();
    },
  });

  const addMemberMutation = api.extracurricular.addMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      setIsMemberDialogOpen(false);
      setMemberFormData({ studentId: "", notes: "" });
      void utils.extracurricular.getById.invalidate();
      void utils.extracurricular.getAll.invalidate();
      void utils.extracurricular.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = api.extracurricular.removeMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.extracurricular.getById.invalidate();
      void utils.extracurricular.getAll.invalidate();
      void utils.extracurricular.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const students = studentsData?.students || [];

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      coachId: "",
      schedule: "",
      location: "",
      maxCapacity: "",
    });
  };

  const handleEdit = (ekskul: any) => {
    setEditingId(ekskul.id);
    setFormData({
      name: ekskul.name,
      description: ekskul.description || "",
      category: ekskul.category,
      coachId: ekskul.coachId || "",
      schedule: ekskul.schedule || "",
      location: ekskul.location || "",
      maxCapacity: ekskul.maxCapacity?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Peringatan",
        description: "Nama dan kategori tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      coachId: formData.coachId || undefined,
      schedule: formData.schedule || undefined,
      location: formData.location || undefined,
      maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus ekstrakurikuler ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  const handleAddMember = () => {
    if (!memberFormData.studentId) {
      toast({
        title: "Peringatan",
        description: "Pilih siswa terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    addMemberMutation.mutate({
      extracurricularId: selectedExtracurricular,
      studentId: memberFormData.studentId,
      notes: memberFormData.notes || undefined,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Apakah Anda yakin ingin mengeluarkan siswa ini?")) {
      removeMemberMutation.mutate({ id: memberId });
    }
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Ekstrakurikuler</h2>
              <p className="mt-1 text-cyan-100">
                Kelola ekstrakurikuler dan anggota siswa
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ekstrakurikuler</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Anggota</p>
                <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kategori</p>
                <p className="text-2xl font-bold">{stats?.categories || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Ekstrakurikuler</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Ekstrakurikuler
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Memuat data...</p>
          ) : !extracurriculars || extracurriculars.length === 0 ? (
            <p className="text-center text-muted-foreground">Belum ada ekstrakurikuler</p>
          ) : (
            <div className="space-y-4">
              {extracurriculars.map((ekskul) => (
                <Card key={ekskul.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{ekskul.name}</h3>
                          <Badge variant="outline">{ekskul.category}</Badge>
                          {!ekskul.isActive && (
                            <Badge variant="secondary">Tidak Aktif</Badge>
                          )}
                        </div>

                        {ekskul.description && (
                          <p className="text-sm text-muted-foreground">
                            {ekskul.description}
                          </p>
                        )}

                        <div className="grid gap-2 text-sm md:grid-cols-2">
                          {ekskul.coach && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Pembina: {ekskul.coach.user.name}</span>
                            </div>
                          )}
                          {ekskul.schedule && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{ekskul.schedule}</span>
                            </div>
                          )}
                          {ekskul.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{ekskul.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {ekskul.memberCount} anggota
                              {ekskul.maxCapacity && ` / ${ekskul.maxCapacity} kuota`}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedExtracurricular(ekskul.id);
                              setIsMemberDialogOpen(true);
                            }}
                          >
                            <UserPlus className="mr-1 h-4 w-4" />
                            Kelola Anggota
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ekskul.isActive}
                          onCheckedChange={() => toggleActive(ekskul.id, ekskul.isActive)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(ekskul)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(ekskul.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler"}
            </DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk {editingId ? "memperbarui" : "menambah"}{" "}
              ekstrakurikuler
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Ekstrakurikuler <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Basket"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  placeholder="Contoh: Olahraga"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi ekstrakurikuler..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coachId">Pembina</Label>
                <Select
                  value={formData.coachId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, coachId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pembina..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada</SelectItem>
                    {teachers?.teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Kuota Maksimal</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  placeholder="Contoh: 30"
                  value={formData.maxCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, maxCapacity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schedule">Jadwal</Label>
                <Input
                  id="schedule"
                  placeholder="Contoh: Rabu, 15:00-17:00"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  placeholder="Contoh: Lapangan Basket"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Member Management Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kelola Anggota Ekstrakurikuler</DialogTitle>
            <DialogDescription>
              {selectedEkskul?.name} - {selectedEkskul?.members.length || 0} anggota
              {selectedEkskul?.maxCapacity && ` / ${selectedEkskul.maxCapacity} kuota`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Member Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tambah Anggota Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Pilih Siswa</Label>
                    <Select
                      value={memberFormData.studentId}
                      onValueChange={(value) =>
                        setMemberFormData({ ...memberFormData, studentId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih siswa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.nis ? `${student.nis} - ` : ""}
                            {student.user.name}
                            {student.currentClass
                              ? ` (${student.currentClass.name})`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Input
                      id="notes"
                      placeholder="Catatan opsional..."
                      value={memberFormData.notes}
                      onChange={(e) =>
                        setMemberFormData({ ...memberFormData, notes: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddMember}
                  disabled={addMemberMutation.isPending}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {addMemberMutation.isPending
                    ? "Menambahkan..."
                    : "Tambah Anggota"}
                </Button>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daftar Anggota</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedEkskul || selectedEkskul.members.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Belum ada anggota
                  </p>
                ) : (
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {selectedEkskul.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-sm font-bold text-white">
                            {member.student.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {member.student.user.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {member.student.currentClass && (
                                <Badge variant="outline" className="text-xs">
                                  {member.student.currentClass.name}
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  member.status === "ACTIVE" ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {member.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <UserMinus className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

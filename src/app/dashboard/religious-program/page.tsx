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
  BookOpen,
} from "lucide-react";
import { useToast } from "~/hooks/use-toast";

const PROGRAM_TYPES = [
  { value: "DAILY", label: "Harian" },
  { value: "WEEKLY", label: "Mingguan" },
  { value: "MONTHLY", label: "Bulanan" },
  { value: "EVENT", label: "Event" },
];

const GRADES = ["7", "8", "9", "10", "11", "12"];

export default function ReligiousProgramPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "DAILY" as "DAILY" | "WEEKLY" | "MONTHLY" | "EVENT",
    instructorId: "",
    schedule: "",
    location: "",
    targetGrades: [] as string[],
  });

  const [participantFormData, setParticipantFormData] = useState({
    studentId: "",
    progress: "",
    notes: "",
  });

  const { data: programs, isLoading } = api.religiousProgram.getAll.useQuery({});
  const { data: stats } = api.religiousProgram.getStats.useQuery();
  const { data: teachers } = api.teacher.getAll.useQuery({ page: 1, limit: 100 });
  const { data: studentsData } = api.student.getAll.useQuery({ page: 1, limit: 100 });

  const { data: selectedProgramData } = api.religiousProgram.getById.useQuery(
    { id: selectedProgram },
    { enabled: !!selectedProgram }
  );

  const utils = api.useUtils();

  const createMutation = api.religiousProgram.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.religiousProgram.getAll.invalidate();
      void utils.religiousProgram.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.religiousProgram.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.religiousProgram.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.religiousProgram.delete.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.religiousProgram.getAll.invalidate();
      void utils.religiousProgram.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = api.religiousProgram.update.useMutation({
    onSuccess: () => {
      void utils.religiousProgram.getAll.invalidate();
      void utils.religiousProgram.getStats.invalidate();
    },
  });

  const addParticipantMutation = api.religiousProgram.addParticipant.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      setIsParticipantDialogOpen(false);
      setParticipantFormData({ studentId: "", progress: "", notes: "" });
      void utils.religiousProgram.getById.invalidate();
      void utils.religiousProgram.getAll.invalidate();
      void utils.religiousProgram.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeParticipantMutation = api.religiousProgram.removeParticipant.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.religiousProgram.getById.invalidate();
      void utils.religiousProgram.getAll.invalidate();
      void utils.religiousProgram.getStats.invalidate();
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
      type: "DAILY",
      instructorId: "",
      schedule: "",
      location: "",
      targetGrades: [],
    });
  };

  const handleEdit = (program: any) => {
    setEditingId(program.id);
    setFormData({
      name: program.name,
      description: program.description || "",
      type: program.type,
      instructorId: program.instructorId || "",
      schedule: program.schedule || "",
      location: program.location || "",
      targetGrades: program.targetGrades,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.type) {
      toast({
        title: "Peringatan",
        description: "Nama dan tipe program tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      instructorId: formData.instructorId || undefined,
      schedule: formData.schedule || undefined,
      location: formData.location || undefined,
      targetGrades: formData.targetGrades.length > 0 ? formData.targetGrades : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus program ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  const handleAddParticipant = () => {
    if (!participantFormData.studentId) {
      toast({
        title: "Peringatan",
        description: "Pilih siswa terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    addParticipantMutation.mutate({
      programId: selectedProgram,
      studentId: participantFormData.studentId,
      progress: participantFormData.progress || undefined,
      notes: participantFormData.notes || undefined,
    });
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (confirm("Apakah Anda yakin ingin mengeluarkan peserta ini?")) {
      removeParticipantMutation.mutate({ id: participantId });
    }
  };

  const toggleGrade = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      targetGrades: prev.targetGrades.includes(grade)
        ? prev.targetGrades.filter((g) => g !== grade)
        : [...prev.targetGrades, grade],
    }));
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Program Keagamaan</h2>
              <p className="mt-1 text-green-100">
                Kelola program keagamaan dan peserta didik
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
                <p className="text-sm text-muted-foreground">Total Program</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-emerald-500" />
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
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Peserta</p>
                <p className="text-2xl font-bold">{stats?.totalParticipants || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Harian</p>
                <p className="text-2xl font-bold">{stats?.daily || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Program Keagamaan</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Memuat data...</p>
          ) : !programs || programs.length === 0 ? (
            <p className="text-center text-muted-foreground">Belum ada program keagamaan</p>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <Card key={program.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{program.name}</h3>
                          <Badge variant="outline">
                            {PROGRAM_TYPES.find((t) => t.value === program.type)?.label}
                          </Badge>
                          {!program.isActive && (
                            <Badge variant="secondary">Tidak Aktif</Badge>
                          )}
                        </div>

                        {program.description && (
                          <p className="text-sm text-muted-foreground">
                            {program.description}
                          </p>
                        )}

                        <div className="grid gap-2 text-sm md:grid-cols-2">
                          {program.instructor && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Ustadz/Ustadzah: {program.instructor.user.name}</span>
                            </div>
                          )}
                          {program.schedule && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{program.schedule}</span>
                            </div>
                          )}
                          {program.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{program.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{program.participantCount} peserta</span>
                          </div>
                        </div>

                        {program.targetGrades.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-sm text-muted-foreground">
                              Target Kelas:
                            </span>
                            {program.targetGrades.map((grade) => (
                              <Badge key={grade} variant="secondary" className="text-xs">
                                Kelas {grade}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProgram(program.id);
                              setIsParticipantDialogOpen(true);
                            }}
                          >
                            <UserPlus className="mr-1 h-4 w-4" />
                            Kelola Peserta
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={program.isActive}
                          onCheckedChange={() => toggleActive(program.id, program.isActive)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(program.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Program" : "Tambah Program Keagamaan"}
            </DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk {editingId ? "memperbarui" : "menambah"}{" "}
              program keagamaan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Program <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Tahfidz Juz 30"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipe Program <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi program..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instructorId">Ustadz/Ustadzah</Label>
                <Select
                  value={formData.instructorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, instructorId: value })
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
                <Label htmlFor="schedule">Jadwal</Label>
                <Input
                  id="schedule"
                  placeholder="Contoh: Senin & Kamis, 07:00-08:00"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                placeholder="Contoh: Musholla Sekolah"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Target Kelas</Label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((grade) => (
                  <Button
                    key={grade}
                    type="button"
                    size="sm"
                    variant={
                      formData.targetGrades.includes(grade) ? "default" : "outline"
                    }
                    onClick={() => toggleGrade(grade)}
                  >
                    Kelas {grade}
                  </Button>
                ))}
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

      {/* Participant Management Dialog */}
      <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Peserta Program</DialogTitle>
            <DialogDescription>
              {selectedProgramData?.name} - {selectedProgramData?.participants.length || 0}{" "}
              peserta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add Participant Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tambah Peserta Baru</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Pilih Siswa</Label>
                  <Select
                    value={participantFormData.studentId}
                    onValueChange={(value) =>
                      setParticipantFormData({ ...participantFormData, studentId: value })
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
                          {student.currentClass ? ` (${student.currentClass.name})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress</Label>
                    <Input
                      id="progress"
                      placeholder="Contoh: Juz 1-3"
                      value={participantFormData.progress}
                      onChange={(e) =>
                        setParticipantFormData({
                          ...participantFormData,
                          progress: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Input
                      id="notes"
                      placeholder="Catatan opsional..."
                      value={participantFormData.notes}
                      onChange={(e) =>
                        setParticipantFormData({
                          ...participantFormData,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddParticipant}
                  disabled={addParticipantMutation.isPending}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {addParticipantMutation.isPending ? "Menambahkan..." : "Tambah Peserta"}
                </Button>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daftar Peserta</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedProgramData || selectedProgramData.participants.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Belum ada peserta
                  </p>
                ) : (
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {selectedProgramData.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-sm font-bold text-white">
                            {participant.student.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {participant.student.user.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {participant.student.currentClass && (
                                <Badge variant="outline" className="text-xs">
                                  {participant.student.currentClass.name}
                                </Badge>
                              )}
                              <Badge
                                variant={
                                  participant.status === "ACTIVE" ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {participant.status}
                              </Badge>
                              {participant.progress && (
                                <span className="text-xs">{participant.progress}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={removeParticipantMutation.isPending}
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

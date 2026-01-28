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
import { api } from "~/trpc/react";
import { BookOpen, Plus, Clock, Users, FileText, Calendar, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "~/hooks/use-toast";

export default function TeachingJournalPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterTeacherId, setFilterTeacherId] = useState<string>("");
  const [filterClassId, setFilterClassId] = useState<string>("");
  const [filterSubjectId, setFilterSubjectId] = useState<string>("");

  const [formData, setFormData] = useState({
    teacherId: "",
    classId: "",
    subjectId: "",
    date: "",
    startTime: "",
    endTime: "",
    topic: "",
    material: "",
    method: "",
    objectives: "",
    activities: "",
    assessment: "",
    homework: "",
    notes: "",
    obstacles: "",
    totalStudents: 0,
    presentStudents: 0,
    absentStudents: 0,
  });

  const { data: teachersData } = api.teacher.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: classesData } = api.class.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: subjectsData } = api.subject.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: journalsData, isLoading } = api.teachingJournal.getAll.useQuery({
    page: 1,
    limit: 50,
    teacherId: filterTeacherId || undefined,
    classId: filterClassId || undefined,
    subjectId: filterSubjectId || undefined,
  });

  const { data: stats } = api.teachingJournal.getStats.useQuery({});

  const createMutation = api.teachingJournal.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.teachingJournal.getAll.invalidate();
      void utils.teachingJournal.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.teachingJournal.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.teachingJournal.getAll.invalidate();
      void utils.teachingJournal.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.teachingJournal.delete.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.teachingJournal.getAll.invalidate();
      void utils.teachingJournal.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const utils = api.useUtils();

  const teachers = teachersData?.teachers || [];
  const classes = classesData?.classes || [];
  const subjects = subjectsData?.subjects || [];
  const journals = journalsData?.journals || [];

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      teacherId: "",
      classId: "",
      subjectId: "",
      date: "",
      startTime: "",
      endTime: "",
      topic: "",
      material: "",
      method: "",
      objectives: "",
      activities: "",
      assessment: "",
      homework: "",
      notes: "",
      obstacles: "",
      totalStudents: 0,
      presentStudents: 0,
      absentStudents: 0,
    });
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (journal: any) => {
    setIsEditing(true);
    setEditingId(journal.id);
    setFormData({
      teacherId: journal.teacherId,
      classId: journal.classId,
      subjectId: journal.subjectId,
      date: format(new Date(journal.date), "yyyy-MM-dd"),
      startTime: journal.startTime,
      endTime: journal.endTime,
      topic: journal.topic,
      material: journal.material,
      method: journal.method || "",
      objectives: journal.objectives,
      activities: journal.activities,
      assessment: journal.assessment || "",
      homework: journal.homework || "",
      notes: journal.notes || "",
      obstacles: journal.obstacles || "",
      totalStudents: journal.totalStudents,
      presentStudents: journal.presentStudents,
      absentStudents: journal.absentStudents,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.teacherId || !formData.classId || !formData.subjectId || !formData.date ||
        !formData.startTime || !formData.endTime || !formData.topic || !formData.material ||
        !formData.objectives || !formData.activities) {
      toast({
        title: "Peringatan",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        topic: formData.topic,
        material: formData.material,
        method: formData.method || undefined,
        objectives: formData.objectives,
        activities: formData.activities,
        assessment: formData.assessment || undefined,
        homework: formData.homework || undefined,
        notes: formData.notes || undefined,
        obstacles: formData.obstacles || undefined,
        totalStudents: formData.totalStudents,
        presentStudents: formData.presentStudents,
        absentStudents: formData.absentStudents,
      });
    } else {
      createMutation.mutate({
        teacherId: formData.teacherId,
        classId: formData.classId,
        subjectId: formData.subjectId,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        topic: formData.topic,
        material: formData.material,
        method: formData.method || undefined,
        objectives: formData.objectives,
        activities: formData.activities,
        assessment: formData.assessment || undefined,
        homework: formData.homework || undefined,
        notes: formData.notes || undefined,
        obstacles: formData.obstacles || undefined,
        totalStudents: formData.totalStudents,
        presentStudents: formData.presentStudents,
        absentStudents: formData.absentStudents,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jurnal ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Jurnal Mengajar</h2>
              <p className="mt-1 text-green-100">
                Kelola jurnal kegiatan belajar mengajar
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
                <p className="text-sm text-muted-foreground">Total Jurnal</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jam</p>
                <p className="text-2xl font-bold">{stats?.totalHours || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kelas</p>
                <p className="text-2xl font-bold">{stats?.classesCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
                <p className="text-2xl font-bold">{stats?.subjectsCount || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Jurnal Mengajar</CardTitle>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jurnal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filterTeacher">Filter Guru</Label>
              <Select value={filterTeacherId} onValueChange={setFilterTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua guru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua guru</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterClass">Filter Kelas</Label>
              <Select value={filterClassId} onValueChange={setFilterClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua kelas</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterSubject">Filter Mata Pelajaran</Label>
              <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua mapel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua mapel</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Journals List */}
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Memuat data...</p>
            ) : journals.length === 0 ? (
              <p className="text-center text-muted-foreground">Belum ada jurnal mengajar</p>
            ) : (
              journals.map((journal) => (
                <Card key={journal.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {format(new Date(journal.date), "EEEE, d MMMM yyyy", { locale: id })}
                            </span>
                            <Badge variant="outline">
                              {journal.startTime} - {journal.endTime}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Guru: {journal.teacher.user.name}</span>
                            <span>•</span>
                            <span>Kelas: {journal.class.name}</span>
                            <span>•</span>
                            <span>Mapel: {journal.subject.name}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(journal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(journal.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="grid gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Topik:</strong> {journal.topic}
                          </div>
                          <div className="text-sm">
                            <strong>Materi:</strong> {journal.material}
                          </div>
                          {journal.method && (
                            <div className="text-sm">
                              <strong>Metode:</strong> {journal.method}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Kehadiran:</strong> {journal.presentStudents} / {journal.totalStudents} siswa hadir
                          </div>
                          {journal.homework && (
                            <div className="text-sm">
                              <strong>PR:</strong> {journal.homework}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {(journal.objectives || journal.activities) && (
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-blue-600">
                            Lihat Detail Lengkap
                          </summary>
                          <div className="mt-3 space-y-2 text-sm">
                            {journal.objectives && (
                              <div>
                                <strong>Tujuan Pembelajaran:</strong>
                                <p className="mt-1 text-muted-foreground">{journal.objectives}</p>
                              </div>
                            )}
                            {journal.activities && (
                              <div>
                                <strong>Kegiatan Pembelajaran:</strong>
                                <p className="mt-1 text-muted-foreground">{journal.activities}</p>
                              </div>
                            )}
                            {journal.assessment && (
                              <div>
                                <strong>Penilaian:</strong>
                                <p className="mt-1 text-muted-foreground">{journal.assessment}</p>
                              </div>
                            )}
                            {journal.obstacles && (
                              <div>
                                <strong>Kendala:</strong>
                                <p className="mt-1 text-red-600">{journal.obstacles}</p>
                              </div>
                            )}
                            {journal.notes && (
                              <div>
                                <strong>Catatan:</strong>
                                <p className="mt-1 text-muted-foreground">{journal.notes}</p>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Jurnal Mengajar" : "Tambah Jurnal Mengajar"}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk {isEditing ? "mengedit" : "membuat"} jurnal mengajar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="teacherId">
                  Guru <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih guru..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">
                  Kelas <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectId">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mapel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">
                  Jam Mulai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">
                  Jam Selesai <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Learning Content */}
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topik Pembelajaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topic"
                placeholder="Contoh: Sistem Persamaan Linear"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">
                Materi yang Diajarkan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="material"
                placeholder="Jelaskan materi yang diajarkan..."
                rows={3}
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Metode Pembelajaran</Label>
              <Input
                id="method"
                placeholder="Contoh: Ceramah, Diskusi, Praktik"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">
                Tujuan Pembelajaran <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="objectives"
                placeholder="Tuliskan tujuan pembelajaran..."
                rows={3}
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">
                Kegiatan Pembelajaran <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="activities"
                placeholder="Deskripsikan kegiatan pembelajaran..."
                rows={3}
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment">Penilaian/Evaluasi</Label>
              <Textarea
                id="assessment"
                placeholder="Cara penilaian atau evaluasi..."
                rows={2}
                value={formData.assessment}
                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homework">Tugas/PR</Label>
              <Textarea
                id="homework"
                placeholder="Tugas yang diberikan..."
                rows={2}
                value={formData.homework}
                onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
              />
            </div>

            {/* Attendance */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalStudents">Total Siswa</Label>
                <Input
                  id="totalStudents"
                  type="number"
                  min="0"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentStudents">Siswa Hadir</Label>
                <Input
                  id="presentStudents"
                  type="number"
                  min="0"
                  value={formData.presentStudents}
                  onChange={(e) => setFormData({ ...formData, presentStudents: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="absentStudents">Siswa Tidak Hadir</Label>
                <Input
                  id="absentStudents"
                  type="number"
                  min="0"
                  value={formData.absentStudents}
                  onChange={(e) => setFormData({ ...formData, absentStudents: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="obstacles">Kendala yang Dihadapi</Label>
              <Textarea
                id="obstacles"
                placeholder="Kendala atau hambatan selama pembelajaran..."
                rows={2}
                value={formData.obstacles}
                onChange={(e) => setFormData({ ...formData, obstacles: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan lain yang perlu dicatat..."
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending
                ? "Menyimpan..."
                : isEditing
                  ? "Update"
                  : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

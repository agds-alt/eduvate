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
import { Plus, Calendar, User, FileText, Award, AlertCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "~/hooks/use-toast";

type BehaviorType = "POSITIVE" | "NEGATIVE";

export default function BehaviorInputPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<BehaviorType | "ALL">("ALL");
  const [filterStudentId, setFilterStudentId] = useState<string>("");

  const [formData, setFormData] = useState({
    studentId: "",
    categoryId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    notes: "",
  });

  const { data: studentsData } = api.student.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: categories} = api.behaviorCategory.getAll.useQuery({
    isActive: true,
  });

  const { data: recordsData, isLoading } = api.behaviorRecord.getAll.useQuery({
    page: 1,
    limit: 50,
    type: filterType === "ALL" ? undefined : filterType,
    studentId: filterStudentId || undefined,
  });

  const { data: stats } = api.behaviorRecord.getStats.useQuery({});

  const createMutation = api.behaviorRecord.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.behaviorRecord.getAll.invalidate();
      void utils.behaviorRecord.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.behaviorRecord.delete.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.behaviorRecord.getAll.invalidate();
      void utils.behaviorRecord.getStats.invalidate();
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

  const students = studentsData?.students || [];
  const records = recordsData?.records || [];

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      studentId: "",
      categoryId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      notes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.categoryId || !formData.date || !formData.description) {
      toast({
        title: "Peringatan",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      studentId: formData.studentId,
      categoryId: formData.categoryId,
      date: new Date(formData.date),
      description: formData.description,
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const selectedCategory = categories?.find((c) => c.id === formData.categoryId);

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Input Sikap & Pelanggaran</h2>
              <p className="mt-1 text-orange-100">
                Catat sikap positif, prestasi, dan pelanggaran siswa
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
                <p className="text-sm text-muted-foreground">Total Catatan</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sikap Positif</p>
                <p className="text-2xl font-bold">{stats?.positive || 0}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pelanggaran</p>
                <p className="text-2xl font-bold">{stats?.negative || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Poin</p>
                <p className={`text-2xl font-bold ${(stats?.totalPoints || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats?.totalPoints || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catatan Sikap & Pelanggaran</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Catatan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex gap-2">
              <Button
                variant={filterType === "ALL" ? "default" : "outline"}
                onClick={() => setFilterType("ALL")}
              >
                Semua
              </Button>
              <Button
                variant={filterType === "POSITIVE" ? "default" : "outline"}
                onClick={() => setFilterType("POSITIVE")}
              >
                Positif
              </Button>
              <Button
                variant={filterType === "NEGATIVE" ? "default" : "outline"}
                onClick={() => setFilterType("NEGATIVE")}
              >
                Pelanggaran
              </Button>
            </div>

            <div className="flex-1">
              <Select value={filterStudentId} onValueChange={setFilterStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter siswa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua siswa</SelectItem>
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
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Memuat data...</p>
            ) : records.length === 0 ? (
              <p className="text-center text-muted-foreground">Belum ada catatan</p>
            ) : (
              records.map((record) => (
                <Card key={record.id} className={`border-l-4 ${record.category.type === "POSITIVE" ? "border-l-green-500" : "border-l-red-500"}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{record.student.user.name}</span>
                          {record.student.currentClass && (
                            <Badge variant="outline">{record.student.currentClass.name}</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(record.date), "d MMMM yyyy", { locale: id })}</span>
                          </div>
                          <Badge
                            variant={record.category.type === "POSITIVE" ? "default" : "destructive"}
                            className={record.category.type === "POSITIVE" ? "bg-green-500" : ""}
                          >
                            {record.category.name}
                          </Badge>
                          <Badge variant="outline">
                            {record.points > 0 ? `+${record.points}` : record.points} poin
                          </Badge>
                        </div>

                        <p className="text-sm">{record.description}</p>

                        {record.notes && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Catatan:</strong> {record.notes}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Catatan Sikap</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk mencatat sikap atau pelanggaran siswa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">
                Siswa <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => setFormData({ ...formData, studentId: value })}
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

            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-sm font-semibold text-green-600">
                    Sikap Positif
                  </div>
                  {categories?.filter((c) => c.type === "POSITIVE").map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} (+{category.points} poin)
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-sm font-semibold text-red-600">
                    Pelanggaran
                  </div>
                  {categories?.filter((c) => c.type === "NEGATIVE").map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.points} poin)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <p className="text-sm text-muted-foreground">
                  Poin: {selectedCategory.points > 0 ? `+${selectedCategory.points}` : selectedCategory.points}
                  {selectedCategory.description && ` • ${selectedCategory.description}`}
                </p>
              )}
            </div>

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
              <Label htmlFor="description">
                Keterangan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Jelaskan kejadian atau pencapaian siswa..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan (opsional)..."
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
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

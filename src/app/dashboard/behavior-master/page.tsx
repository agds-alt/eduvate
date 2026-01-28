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
import { Plus, Edit, Trash2, Award, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "~/hooks/use-toast";

type BehaviorType = "POSITIVE" | "NEGATIVE";

export default function BehaviorMasterPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<BehaviorType | "ALL">("ALL");

  const [formData, setFormData] = useState({
    name: "",
    type: "POSITIVE" as BehaviorType,
    points: 0,
    description: "",
  });

  const { data: categories, isLoading } = api.behaviorCategory.getAll.useQuery({
    type: filterType === "ALL" ? undefined : filterType,
  });

  const { data: stats } = api.behaviorCategory.getStats.useQuery();

  const createMutation = api.behaviorCategory.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.behaviorCategory.getAll.invalidate();
      void utils.behaviorCategory.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.behaviorCategory.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      closeDialog();
      void utils.behaviorCategory.getAll.invalidate();
      void utils.behaviorCategory.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.behaviorCategory.delete.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Berhasil!",
        description: data.message,
      });
      void utils.behaviorCategory.getAll.invalidate();
      void utils.behaviorCategory.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = api.behaviorCategory.update.useMutation({
    onSuccess: () => {
      void utils.behaviorCategory.getAll.invalidate();
      void utils.behaviorCategory.getStats.invalidate();
    },
  });

  const utils = api.useUtils();

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      type: "POSITIVE",
      points: 0,
      description: "",
    });
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: any) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type,
      points: category.points,
      description: category.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.points === 0) {
      toast({
        title: "Peringatan",
        description: "Mohon lengkapi nama dan poin kategori",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        points: formData.points,
        description: formData.description || undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        type: formData.type,
        points: formData.points,
        description: formData.description || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id,
      isActive: !currentStatus,
    });
  };

  const positiveCategories = categories?.filter((c) => c.type === "POSITIVE") || [];
  const negativeCategories = categories?.filter((c) => c.type === "NEGATIVE") || [];

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Master Sikap & Pelanggaran</h2>
              <p className="mt-1 text-purple-100">
                Kelola kategori sikap positif dan pelanggaran siswa
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
                <p className="text-sm text-muted-foreground">Total Kategori</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
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
              <TrendingUp className="h-8 w-8 text-green-500" />
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
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold">{stats?.active || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="mb-6 flex items-center justify-between">
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
            Sikap Positif
          </Button>
          <Button
            variant={filterType === "NEGATIVE" ? "default" : "outline"}
            onClick={() => setFilterType("NEGATIVE")}
          >
            Pelanggaran
          </Button>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Memuat data...</p>
      ) : (
        <div className="space-y-6">
          {/* Positive Categories */}
          {(filterType === "ALL" || filterType === "POSITIVE") && positiveCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Sikap Positif & Prestasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {positiveCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{category.name}</h4>
                          <Badge variant="default" className="bg-green-500">
                            +{category.points} poin
                          </Badge>
                          {!category.isActive && (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${category.id}`} className="text-sm">
                            {category.isActive ? "Aktif" : "Nonaktif"}
                          </Label>
                          <Switch
                            id={`active-${category.id}`}
                            checked={category.isActive}
                            onCheckedChange={() => toggleActive(category.id, category.isActive)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Negative Categories */}
          {(filterType === "ALL" || filterType === "NEGATIVE") && negativeCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Pelanggaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {negativeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{category.name}</h4>
                          <Badge variant="destructive">
                            {category.points} poin
                          </Badge>
                          {!category.isActive && (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${category.id}`} className="text-sm">
                            {category.isActive ? "Aktif" : "Nonaktif"}
                          </Label>
                          <Switch
                            id={`active-${category.id}`}
                            checked={category.isActive}
                            onCheckedChange={() => toggleActive(category.id, category.isActive)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {categories?.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  Belum ada kategori. Klik tombol "Tambah Kategori" untuk membuat kategori baru.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk {isEditing ? "mengedit" : "membuat"} kategori sikap
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="type">
                  Jenis <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as BehaviorType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">Sikap Positif/Prestasi</SelectItem>
                    <SelectItem value="NEGATIVE">Pelanggaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Kategori <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Disiplin, Keterlambatan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">
                Poin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="points"
                type="number"
                placeholder={formData.type === "POSITIVE" ? "Contoh: 10" : "Contoh: -5"}
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                {formData.type === "POSITIVE"
                  ? "Gunakan angka positif untuk sikap positif (misal: 10)"
                  : "Gunakan angka negatif untuk pelanggaran (misal: -5)"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi kategori (opsional)..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

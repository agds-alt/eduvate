"use client";

import { useState } from "react";
import { Megaphone, Pin, Plus, Search, Trash2, Pencil, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { api } from "~/lib/api";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";

type InformationFormData = {
  id?: string;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
};

export default function InformationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<InformationFormData | null>(null);
  const [formData, setFormData] = useState<InformationFormData>({
    title: "",
    content: "",
    category: "",
    isPinned: false,
  });

  const utils = api.useUtils();
  const { data: allInformation, isLoading } = api.information.getAll.useQuery({
    category: selectedCategory || undefined,
  });
  const { data: categories } = api.information.getCategories.useQuery();

  const createMutation = api.information.create.useMutation({
    onSuccess: () => {
      utils.information.getAll.invalidate();
      utils.information.getCategories.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.information.update.useMutation({
    onSuccess: () => {
      utils.information.getAll.invalidate();
      utils.information.getCategories.invalidate();
      setIsEditOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.information.delete.useMutation({
    onSuccess: () => {
      utils.information.getAll.invalidate();
      utils.information.getCategories.invalidate();
      setIsDeleteOpen(false);
      setSelectedInfo(null);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      isPinned: false,
    });
    setSelectedInfo(null);
  };

  const handleCreate = () => {
    if (!formData.title || !formData.content) return;

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      category: formData.category || undefined,
      isPinned: formData.isPinned,
    });
  };

  const handleEdit = () => {
    if (!selectedInfo?.id || !formData.title || !formData.content) return;

    updateMutation.mutate({
      id: selectedInfo.id,
      title: formData.title,
      content: formData.content,
      category: formData.category || undefined,
      isPinned: formData.isPinned,
    });
  };

  const handleDelete = () => {
    if (!selectedInfo?.id) return;
    deleteMutation.mutate({ id: selectedInfo.id });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (info: any) => {
    setSelectedInfo(info);
    setFormData({
      id: info.id,
      title: info.title,
      content: info.content,
      category: info.category || "",
      isPinned: info.isPinned,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (info: any) => {
    setSelectedInfo(info);
    setIsDeleteOpen(true);
  };

  const now = new Date();
  const thisWeekStart = startOfWeek(now, { locale: localeId });
  const thisWeekEnd = endOfWeek(now, { locale: localeId });

  const totalInfo = allInformation?.length || 0;
  const pinnedInfo = allInformation?.filter(i => i.isPinned).length || 0;
  const weekInfo = allInformation?.filter(i =>
    isWithinInterval(new Date(i.publishedAt), { start: thisWeekStart, end: thisWeekEnd })
  ).length || 0;

  const filteredInformation = allInformation?.filter(info =>
    info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    info.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Megaphone className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Informasi & Pengumuman</h2>
                <p className="mt-1 text-orange-100">Kelola informasi dan pengumuman sekolah</p>
              </div>
            </div>
            <Button
              onClick={openCreateModal}
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Buat Pengumuman
            </Button>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-orange-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pengumuman</p>
                <p className="mt-2 text-3xl font-bold">{totalInfo}</p>
                <p className="mt-1 text-xs text-muted-foreground">Semua pengumuman</p>
              </div>
              <div className="rounded-full bg-orange-100 p-4">
                <Megaphone className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dipinned</p>
                <p className="mt-2 text-3xl font-bold">{pinnedInfo}</p>
                <p className="mt-1 text-xs text-muted-foreground">Pengumuman penting</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <Pin className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-yellow-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                <p className="mt-2 text-3xl font-bold">{categories?.length || 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Klasifikasi</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-4">
                <Megaphone className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minggu Ini</p>
                <p className="mt-2 text-3xl font-bold">{weekInfo}</p>
                <p className="mt-1 text-xs text-muted-foreground">Pengumuman terbaru</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Megaphone className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories?.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari pengumuman..."
                  className="w-full rounded-lg border border-input bg-background px-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2">
              <Megaphone className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-base">Daftar Pengumuman</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading...</p>
            </div>
          ) : filteredInformation && filteredInformation.length > 0 ? (
            <div className="space-y-4">
              {filteredInformation.map((info) => (
                <div
                  key={info.id}
                  className={`rounded-lg border p-4 transition-all hover:shadow-md ${
                    info.isPinned ? "border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`rounded-full p-2 ${
                        info.isPinned ? "bg-orange-100" : "bg-amber-100"
                      }`}>
                        {info.isPinned ? (
                          <Pin className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Megaphone className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="font-semibold">{info.title}</h3>
                          {info.isPinned && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              Pinned
                            </span>
                          )}
                        </div>
                        {info.category && (
                          <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            {info.category}
                          </span>
                        )}
                        <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                          {info.content}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <span>
                            Dipublikasi: {format(new Date(info.publishedAt), "dd MMMM yyyy, HH:mm", { locale: localeId })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(info)}
                        className="h-8 w-8 p-0 hover:bg-amber-100"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(info)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-red-100 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📢</div>
              <p>Belum ada pengumuman</p>
              <p className="text-sm mt-2">Buat pengumuman untuk memulai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Pengumuman Baru</DialogTitle>
            <DialogDescription>
              Buat pengumuman atau informasi baru untuk sekolah
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Pengumuman *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Libur Akhir Semester"
              />
            </div>
            <div>
              <Label htmlFor="content">Isi Pengumuman *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tuliskan isi pengumuman..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Akademik, Kegiatan, Penting"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isPinned" className="cursor-pointer">
                Pin pengumuman ini (tampil di atas)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Publikasikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pengumuman</DialogTitle>
            <DialogDescription>
              Ubah detail pengumuman yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Judul Pengumuman *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Libur Akhir Semester"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Isi Pengumuman *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tuliskan isi pengumuman..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Akademik, Kegiatan, Penting"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-isPinned" className="cursor-pointer">
                Pin pengumuman ini (tampil di atas)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengumuman</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedInfo && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedInfo.title}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{selectedInfo.content}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

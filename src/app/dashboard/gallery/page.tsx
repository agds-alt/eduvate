"use client";

import { useState } from "react";
import { Image as ImageIcon, Video, Plus, Search, Trash2, Pencil, Eye } from "lucide-react";
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
import CloudinaryUploadWidget from "~/components/CloudinaryUploadWidget";
import { api } from "~/lib/api";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type GalleryFormData = {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
};

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryFormData | null>(null);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: "",
    description: "",
    imageUrl: "",
    category: "",
  });

  const utils = api.useUtils();
  const { data: allGallery, isLoading } = api.gallery.getAll.useQuery({
    category: selectedCategory || undefined,
  });
  const { data: categories } = api.gallery.getCategories.useQuery();

  const createMutation = api.gallery.create.useMutation({
    onSuccess: () => {
      utils.gallery.getAll.invalidate();
      utils.gallery.getCategories.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.gallery.update.useMutation({
    onSuccess: () => {
      utils.gallery.getAll.invalidate();
      utils.gallery.getCategories.invalidate();
      setIsEditOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.gallery.delete.useMutation({
    onSuccess: () => {
      utils.gallery.getAll.invalidate();
      utils.gallery.getCategories.invalidate();
      setIsDeleteOpen(false);
      setSelectedGallery(null);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
    });
    setSelectedGallery(null);
  };

  const handleCreate = () => {
    if (!formData.title || !formData.imageUrl) return;

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl,
      category: formData.category || undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedGallery?.id || !formData.title || !formData.imageUrl) return;

    updateMutation.mutate({
      id: selectedGallery.id,
      title: formData.title,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl,
      category: formData.category || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedGallery?.id) return;
    deleteMutation.mutate({ id: selectedGallery.id });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedGallery(item);
    setFormData({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      category: item.category || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (item: any) => {
    setSelectedGallery(item);
    setIsDeleteOpen(true);
  };

  const filteredGallery = allGallery?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMedia = filteredGallery?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Galeri Foto & Video</h2>
                <p className="mt-1 text-pink-100">Kelola foto dan video kegiatan sekolah</p>
              </div>
            </div>
            <Button
              onClick={openCreateModal}
              size="lg"
              className="bg-white text-pink-600 hover:bg-white/90 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Upload Media
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="overflow-hidden border-l-4 border-l-pink-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Media</p>
                <p className="mt-2 text-3xl font-bold">{totalMedia}</p>
                <p className="mt-1 text-xs text-muted-foreground">Foto & video</p>
              </div>
              <div className="rounded-full bg-pink-100 p-4">
                <ImageIcon className="h-7 w-7 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                <p className="mt-2 text-3xl font-bold">{categories?.length || 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Klasifikasi media</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <Video className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bulan Ini</p>
                <p className="mt-2 text-3xl font-bold">
                  {allGallery?.filter(g => g.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Media baru</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <ImageIcon className="h-7 w-7 text-green-600" />
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
                  placeholder="Cari media..."
                  className="w-full rounded-lg border border-input bg-background px-12 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-rose-100 p-2">
              <ImageIcon className="h-5 w-5 text-rose-600" />
            </div>
            <CardTitle className="text-base">Galeri Media</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading...</p>
            </div>
          ) : filteredGallery && filteredGallery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => openDeleteModal(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {item.category && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {item.category}
                          </span>
                        )}
                      </span>
                      <span>{format(new Date(item.createdAt), "dd MMM yyyy", { locale: localeId })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📷</div>
              <p>Belum ada media di galeri</p>
              <p className="text-sm mt-2">Upload foto atau video untuk memulai</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media Baru</DialogTitle>
            <DialogDescription>
              Tambahkan foto atau video ke galeri sekolah
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Media *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Upacara Bendera 17 Agustus"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Gambar *</Label>
              <CloudinaryUploadWidget
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                buttonText={formData.imageUrl ? "Ganti Gambar" : "Upload Gambar dari Device"}
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded border"
                  />
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {formData.imageUrl}
                  </p>
                </div>
              )}
              <div className="mt-2">
                <p className="text-xs font-medium mb-1">Atau masukkan URL:</p>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi media..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Kegiatan Sekolah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Mengupload..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Ubah detail media yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Judul Media *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Upacara Bendera 17 Agustus"
              />
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Gambar *</Label>
              <CloudinaryUploadWidget
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
                buttonText="Ganti Gambar"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded border"
                  />
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {formData.imageUrl}
                  </p>
                </div>
              )}
              <div className="mt-2">
                <p className="text-xs font-medium mb-1">Atau masukkan URL:</p>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi media..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Contoh: Kegiatan Sekolah"
              />
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
            <DialogTitle>Hapus Media</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus media ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedGallery && (
            <div className="p-4 bg-muted rounded-lg">
              <img
                src={selectedGallery.imageUrl}
                alt={selectedGallery.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <p className="font-semibold">{selectedGallery.title}</p>
              {selectedGallery.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedGallery.description}</p>
              )}
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

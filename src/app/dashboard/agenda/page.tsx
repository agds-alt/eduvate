"use client";

import { useState } from "react";
import { Calendar, MapPin, Plus, Search, Trash2, Pencil } from "lucide-react";
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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";

type AgendaFormData = {
  id?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
};

export default function AgendaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaFormData | null>(null);
  const [formData, setFormData] = useState<AgendaFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const utils = api.useUtils();
  const { data: allAgendas, isLoading } = api.agenda.getAll.useQuery({});
  const { data: upcomingAgendas } = api.agenda.getUpcoming.useQuery({ limit: 5 });

  const createMutation = api.agenda.create.useMutation({
    onSuccess: () => {
      utils.agenda.getAll.invalidate();
      utils.agenda.getUpcoming.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.agenda.update.useMutation({
    onSuccess: () => {
      utils.agenda.getAll.invalidate();
      utils.agenda.getUpcoming.invalidate();
      setIsEditOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.agenda.delete.useMutation({
    onSuccess: () => {
      utils.agenda.getAll.invalidate();
      utils.agenda.getUpcoming.invalidate();
      setIsDeleteOpen(false);
      setSelectedAgenda(null);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
    });
    setSelectedAgenda(null);
  };

  const handleCreate = () => {
    if (!formData.title || !formData.startDate) return;

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      location: formData.location || undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedAgenda?.id || !formData.title || !formData.startDate) return;

    updateMutation.mutate({
      id: selectedAgenda.id,
      title: formData.title,
      description: formData.description || undefined,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      location: formData.location || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedAgenda?.id) return;
    deleteMutation.mutate({ id: selectedAgenda.id });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (agenda: any) => {
    setSelectedAgenda(agenda);
    setFormData({
      id: agenda.id,
      title: agenda.title,
      description: agenda.description || "",
      startDate: format(new Date(agenda.startDate), "yyyy-MM-dd"),
      endDate: agenda.endDate ? format(new Date(agenda.endDate), "yyyy-MM-dd") : "",
      location: agenda.location || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (agenda: any) => {
    setSelectedAgenda(agenda);
    setIsDeleteOpen(true);
  };

  const now = new Date();
  const thisWeekStart = startOfWeek(now, { locale: localeId });
  const thisWeekEnd = endOfWeek(now, { locale: localeId });
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const totalAgendas = allAgendas?.length || 0;
  const weekAgendas = allAgendas?.filter(a =>
    isWithinInterval(new Date(a.startDate), { start: thisWeekStart, end: thisWeekEnd })
  ).length || 0;
  const monthAgendas = allAgendas?.filter(a =>
    isWithinInterval(new Date(a.startDate), { start: thisMonthStart, end: thisMonthEnd })
  ).length || 0;
  const upcomingCount = upcomingAgendas?.length || 0;

  const filteredAgendas = allAgendas?.filter(agenda =>
    agenda.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agenda.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Agenda Sekolah</h2>
                <p className="mt-1 text-indigo-100">Kelola jadwal kegiatan dan acara sekolah</p>
              </div>
            </div>
            <Button
              onClick={openCreateModal}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Agenda
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
        <Card className="overflow-hidden border-l-4 border-l-indigo-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agenda</p>
                <p className="mt-2 text-3xl font-bold">{totalAgendas}</p>
                <p className="mt-1 text-xs text-muted-foreground">Semua agenda</p>
              </div>
              <div className="rounded-full bg-indigo-100 p-4">
                <Calendar className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minggu Ini</p>
                <p className="mt-2 text-3xl font-bold">{weekAgendas}</p>
                <p className="mt-1 text-xs text-muted-foreground">Kegiatan minggu ini</p>
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
                <p className="text-sm font-medium text-muted-foreground">Bulan Ini</p>
                <p className="mt-2 text-3xl font-bold">{monthAgendas}</p>
                <p className="mt-1 text-xs text-muted-foreground">Kegiatan bulan ini</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <Calendar className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-orange-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Akan Datang</p>
                <p className="mt-2 text-3xl font-bold">{upcomingCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Agenda mendatang</p>
              </div>
              <div className="rounded-full bg-orange-100 p-4">
                <Calendar className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari agenda berdasarkan judul atau deskripsi..."
              className="w-full rounded-lg border border-input bg-background px-12 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Agenda */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-indigo-100 p-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-base">Agenda Akan Datang</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading...</p>
              </div>
            ) : upcomingAgendas && upcomingAgendas.length > 0 ? (
              <div className="space-y-3">
                {upcomingAgendas.map((agenda) => (
                  <div
                    key={agenda.id}
                    className="rounded-lg border p-4 transition-all hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="rounded-full bg-indigo-100 p-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{agenda.title}</h4>
                          {agenda.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {agenda.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(agenda.startDate), "dd MMM yyyy", { locale: localeId })}
                              {agenda.endDate && ` - ${format(new Date(agenda.endDate), "dd MMM yyyy", { locale: localeId })}`}
                            </span>
                            {agenda.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {agenda.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(agenda)}
                          className="h-8 w-8 p-0 hover:bg-indigo-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(agenda)}
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
                <div className="text-4xl mb-4">📅</div>
                <p>Belum ada agenda mendatang</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Agendas List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Semua Agenda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Loading...</p>
              </div>
            ) : filteredAgendas && filteredAgendas.length > 0 ? (
              <div className="max-h-[500px] space-y-3 overflow-y-auto">
                {filteredAgendas.map((agenda) => (
                  <div
                    key={agenda.id}
                    className="rounded-lg border p-3 transition-all hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium">{agenda.title}</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(agenda)}
                          className="h-6 w-6 p-0 hover:bg-purple-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(agenda)}
                          className="h-6 w-6 p-0 text-destructive hover:bg-red-100 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {agenda.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                        {agenda.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(agenda.startDate), "dd MMM yyyy", { locale: localeId })}
                      </div>
                      {agenda.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {agenda.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">📋</div>
                <p>Belum ada agenda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Agenda Baru</DialogTitle>
            <DialogDescription>
              Buat agenda atau acara baru untuk sekolah
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Agenda *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Rapat Orang Tua Siswa"
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi agenda..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Tanggal Mulai *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: Aula Sekolah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agenda</DialogTitle>
            <DialogDescription>
              Ubah detail agenda yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Judul Agenda *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Rapat Orang Tua Siswa"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi agenda..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Tanggal Mulai *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">Tanggal Selesai</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Lokasi</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Contoh: Aula Sekolah"
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
            <DialogTitle>Hapus Agenda</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus agenda ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedAgenda && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedAgenda.title}</p>
              {selectedAgenda.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedAgenda.description}</p>
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

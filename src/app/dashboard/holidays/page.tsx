"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Plus, Trash2, Pencil, PartyPopper } from "lucide-react";
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
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";

type HolidayFormData = {
  id?: string;
  name: string;
  date: string;
  description?: string;
};

export default function HolidaysPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayFormData | null>(null);
  const [formData, setFormData] = useState<HolidayFormData>({
    name: "",
    date: "",
    description: "",
  });

  const utils = api.useUtils();
  const { data: allHolidays, isLoading } = api.holiday.getAll.useQuery({
    year: selectedYear,
    month: selectedMonth,
  });
  const { data: upcomingHolidays } = api.holiday.getUpcoming.useQuery({ limit: 5 });

  const createMutation = api.holiday.create.useMutation({
    onSuccess: () => {
      utils.holiday.getAll.invalidate();
      utils.holiday.getUpcoming.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.holiday.update.useMutation({
    onSuccess: () => {
      utils.holiday.getAll.invalidate();
      utils.holiday.getUpcoming.invalidate();
      setIsEditOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.holiday.delete.useMutation({
    onSuccess: () => {
      utils.holiday.getAll.invalidate();
      utils.holiday.getUpcoming.invalidate();
      setIsDeleteOpen(false);
      setSelectedHoliday(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      description: "",
    });
    setSelectedHoliday(null);
  };

  const handleCreate = () => {
    if (!formData.name || !formData.date) return;

    createMutation.mutate({
      name: formData.name,
      date: new Date(formData.date),
      description: formData.description || undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedHoliday?.id || !formData.name || !formData.date) return;

    updateMutation.mutate({
      id: selectedHoliday.id,
      name: formData.name,
      date: new Date(formData.date),
      description: formData.description || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedHoliday?.id) return;
    deleteMutation.mutate({ id: selectedHoliday.id });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (holiday: any) => {
    setSelectedHoliday(holiday);
    setFormData({
      id: holiday.id,
      name: holiday.name,
      date: format(new Date(holiday.date), "yyyy-MM-dd"),
      description: holiday.description || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (holiday: any) => {
    setSelectedHoliday(holiday);
    setIsDeleteOpen(true);
  };

  const now = new Date();
  const thisYearStart = startOfYear(now);
  const thisYearEnd = endOfYear(now);
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const totalHolidays = allHolidays?.length || 0;
  const yearHolidays = allHolidays?.filter(h =>
    isWithinInterval(new Date(h.date), { start: thisYearStart, end: thisYearEnd })
  ).length || 0;
  const monthHolidays = allHolidays?.filter(h =>
    isWithinInterval(new Date(h.date), { start: thisMonthStart, end: thisMonthEnd })
  ).length || 0;

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <PartyPopper className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Hari Libur</h2>
                <p className="mt-1 text-teal-100">Kelola hari libur dan tanggal merah</p>
              </div>
            </div>
            <Button
              onClick={openCreateModal}
              size="lg"
              className="bg-white text-teal-600 hover:bg-white/90 shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tambah Hari Libur
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
        <Card className="overflow-hidden border-l-4 border-l-teal-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hari Libur</p>
                <p className="mt-2 text-3xl font-bold">{totalHolidays}</p>
                <p className="mt-1 text-xs text-muted-foreground">Semua periode</p>
              </div>
              <div className="rounded-full bg-teal-100 p-4">
                <PartyPopper className="h-7 w-7 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tahun Ini</p>
                <p className="mt-2 text-3xl font-bold">{yearHolidays}</p>
                <p className="mt-1 text-xs text-muted-foreground">Libur tahun {selectedYear}</p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <CalendarIcon className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bulan Ini</p>
                <p className="mt-2 text-3xl font-bold">{monthHolidays}</p>
                <p className="mt-1 text-xs text-muted-foreground">Libur bulan ini</p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <CalendarIcon className="h-7 w-7 text-blue-600" />
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
              <label className="mb-2 block text-sm font-medium">Bulan</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedMonth || ""}
                onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Semua Bulan</option>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tahun</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Holidays */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-teal-100 p-2">
                <PartyPopper className="h-5 w-5 text-teal-600" />
              </div>
              <CardTitle className="text-base">Hari Libur Terdekat</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading...</p>
              </div>
            ) : upcomingHolidays && upcomingHolidays.length > 0 ? (
              <div className="space-y-3">
                {upcomingHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="rounded-lg border p-4 transition-all hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="rounded-full bg-teal-100 p-2">
                          <PartyPopper className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{holiday.name}</h4>
                          {holiday.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {holiday.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(holiday.date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(holiday)}
                          className="h-8 w-8 p-0 hover:bg-teal-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(holiday)}
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
                <div className="text-4xl mb-4">🎉</div>
                <p>Belum ada hari libur terdekat</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Holidays List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-cyan-100 p-2">
                <CalendarIcon className="h-5 w-5 text-cyan-600" />
              </div>
              <CardTitle className="text-base">Semua Hari Libur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Loading...</p>
              </div>
            ) : allHolidays && allHolidays.length > 0 ? (
              <div className="max-h-[500px] space-y-3 overflow-y-auto">
                {allHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="rounded-lg border p-3 transition-all hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{holiday.name}</h4>
                        {holiday.description && (
                          <p className="mb-2 mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {holiday.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(holiday.date), "dd MMMM yyyy", { locale: localeId })}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(holiday)}
                          className="h-6 w-6 p-0 hover:bg-cyan-100"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(holiday)}
                          className="h-6 w-6 p-0 text-destructive hover:bg-red-100 hover:text-destructive"
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
                <p>Belum ada hari libur</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Hari Libur</DialogTitle>
            <DialogDescription>
              Tambahkan hari libur atau tanggal merah baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Hari Libur *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Hari Kemerdekaan RI"
              />
            </div>
            <div>
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi hari libur..."
                rows={3}
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
            <DialogTitle>Edit Hari Libur</DialogTitle>
            <DialogDescription>
              Ubah detail hari libur yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Hari Libur *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Hari Kemerdekaan RI"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Tanggal *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi hari libur..."
                rows={3}
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
            <DialogTitle>Hapus Hari Libur</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus hari libur ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedHoliday && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedHoliday.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedHoliday.date && format(new Date(selectedHoliday.date), "EEEE, dd MMMM yyyy", { locale: localeId })}
              </p>
              {selectedHoliday.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedHoliday.description}</p>
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

"use client";

import { useState } from "react";
import Papa from "papaparse";
import { api } from "~/lib/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { Plus, Pencil, Trash2, Search, Upload, Download, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

type StudentForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  nik: string;
  nis: string;
  nisn: string;
  enrollmentYear: string;
  currentClassId: string;
};

export default function StudentsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  // Import states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<{
    success: string[];
    failed: { row: number; name: string; error: string }[];
  } | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState<StudentForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    nik: "",
    nis: "",
    nisn: "",
    enrollmentYear: new Date().getFullYear().toString(),
    currentClassId: "",
  });

  const utils = api.useUtils();

  const { data, isLoading } = api.student.getAll.useQuery({
    page,
    limit: 10,
    search: search || undefined,
    classId: classFilter,
  });

  const { data: classesData } = api.class.getAll.useQuery({
    page: 1,
    limit: 100,
  });

  const createMutation = api.student.create.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
      closeDialog();
      toast({
        title: "Berhasil!",
        description: "Siswa berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.student.update.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
      closeDialog();
      toast({
        title: "Berhasil!",
        description: "Data siswa berhasil diupdate",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = api.student.delete.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Berhasil!",
        description: "Siswa berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkImportMutation = api.student.bulkImport.useMutation({
    onSuccess: (data) => {
      utils.student.getAll.invalidate();
      setImportResults(data);
      setShowResults(true);

      const successCount = data.success.length;
      const failedCount = data.failed.length;

      toast({
        title: "Import Selesai!",
        description: `${successCount} siswa berhasil, ${failedCount} gagal`,
        variant: successCount > 0 ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Import Gagal!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const students = data?.students ?? [];
  const pagination = data?.pagination;
  const classes = classesData?.classes ?? [];

  const openAddDialog = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      nik: "",
      nis: "",
      nisn: "",
      enrollmentYear: new Date().getFullYear().toString(),
      currentClassId: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: any) => {
    setIsEditing(true);
    setEditingId(student.id);
    setFormData({
      name: student.user.name,
      email: student.user.email || "",
      phone: student.user.phone || "",
      address: student.user.address || "",
      password: "",
      nik: student.user.nik || "",
      nis: student.nis || "",
      nisn: student.nisn || "",
      enrollmentYear: student.enrollmentYear?.toString() || "",
      currentClassId: student.currentClassId || "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama siswa harus diisi!",
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
        nis: formData.nis || undefined,
        nisn: formData.nisn || undefined,
        enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear) : undefined,
        currentClassId: formData.currentClassId || null,
      });
    } else {
      if (!formData.password) {
        toast({
          title: "Error",
          description: "Password harus diisi!",
          variant: "destructive",
        });
        return;
      }
      createMutation.mutate({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        password: formData.password,
        nik: formData.nik || undefined,
        nis: formData.nis || undefined,
        nisn: formData.nisn || undefined,
        enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear) : undefined,
        currentClassId: formData.currentClassId || undefined,
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
        toast({
          title: "File berhasil dibaca!",
          description: `${results.data.length} baris data ditemukan`,
        });
      },
      error: (error) => {
        toast({
          title: "Error parsing file",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleImport = () => {
    if (parsedData.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data untuk diimport",
        variant: "destructive",
      });
      return;
    }

    // Map CSV data to student format
    const students = parsedData.map((row: any) => ({
      name: row.name || row.nama || "",
      email: row.email || "",
      phone: row.phone || row.telepon || row.hp || "",
      address: row.address || row.alamat || "",
      nik: row.nik || "",
      nis: row.nis || "",
      nisn: row.nisn || "",
      birthDate: row.birthDate || row.tanggal_lahir || "",
      gender: row.gender || row.jenis_kelamin || "",
      religion: row.religion || row.agama || "",
      classId: row.classId || row.kelas_id || "",
      parentName: row.parentName || row.nama_orang_tua || "",
      parentPhone: row.parentPhone || row.hp_orang_tua || "",
      parentEmail: row.parentEmail || row.email_orang_tua || "",
    }));

    bulkImportMutation.mutate({ students });
  };

  const openImportDialog = () => {
    setIsImportDialogOpen(true);
    setImportFile(null);
    setParsedData([]);
    setImportResults(null);
    setShowResults(false);
  };

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
    setImportFile(null);
    setParsedData([]);
    setImportResults(null);
    setShowResults(false);
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,address,nik,nis,nisn,birthDate,gender,religion,classId,parentName,parentPhone,parentEmail
John Doe,john@example.com,081234567890,Jl. Contoh No. 1,1234567890123456,12345,12345678,2010-01-15,MALE,Islam,,Jane Doe,081234567891,jane@example.com`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_siswa.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template berhasil diunduh!",
      description: "Silakan isi template dan upload kembali",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-48 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-pulse" />

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 rounded bg-gray-200 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-gray-200 animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />

      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Data Siswa</h1>
                <p className="mt-2 text-green-100">
                  Kelola data siswa dan informasi akademik
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={openImportDialog}
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Upload className="mr-2 h-5 w-5" />
                Import Data
              </Button>
              <Button
                size="lg"
                onClick={openAddDialog}
                className="bg-white text-emerald-600 hover:bg-white/90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Tambah Siswa
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white"></div>
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Siswa" : "Tambah Siswa Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update informasi siswa di bawah ini"
                : "Isi formulir di bawah untuk menambahkan siswa baru"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nis">NIS</Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input
                  id="nisn"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditing}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="enrollmentYear">Tahun Masuk</Label>
                <Input
                  id="enrollmentYear"
                  type="number"
                  value={formData.enrollmentYear}
                  onChange={(e) => setFormData({ ...formData, enrollmentYear: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentClassId">Kelas</Label>
                <Select
                  value={formData.currentClassId}
                  onValueChange={(value) => setFormData({ ...formData, currentClassId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.academicYear}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus siswa <strong>{deleteName}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Data Siswa</DialogTitle>
            <DialogDescription>
              Upload file CSV/Excel untuk import data siswa secara massal
            </DialogDescription>
          </DialogHeader>

          {!showResults ? (
            <div className="space-y-6">
              {/* Download Template */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Download className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Download Template</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Gunakan template CSV untuk memastikan format data yang benar
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                        className="mt-3 border-blue-300 hover:bg-blue-100"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload File CSV</Label>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {importFile && (
                  <p className="text-sm text-muted-foreground">
                    File: {importFile.name} ({parsedData.length} baris)
                  </p>
                )}
              </div>

              {/* Preview Data */}
              {parsedData.length > 0 && (
                <div className="space-y-2">
                  <Label>Preview Data (5 baris pertama)</Label>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>NIS</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telepon</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 5).map((row: any, index) => {
                          const name = row.name || row.nama || "";
                          const nis = row.nis || "";
                          const email = row.email || "";
                          const phone = row.phone || row.telepon || row.hp || "";
                          const isValid = name && nis;

                          return (
                            <TableRow key={index}>
                              <TableCell>{name || "-"}</TableCell>
                              <TableCell>{nis || "-"}</TableCell>
                              <TableCell>{email || "-"}</TableCell>
                              <TableCell>{phone || "-"}</TableCell>
                              <TableCell>
                                {isValid ? (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Invalid
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Menampilkan 5 dari {parsedData.length} baris data
                  </p>
                </div>
              )}

              {/* Info */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-2">Catatan Penting:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Field yang wajib: <strong>name</strong> dan <strong>nis</strong></li>
                        <li>Password default akan diset sebagai: <strong>password123</strong></li>
                        <li>NIS harus unik, duplikasi akan ditolak</li>
                        <li>Format tanggal: YYYY-MM-DD (contoh: 2010-01-15)</li>
                        <li>Gender: MALE atau FEMALE</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Results Display
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {importResults?.success.length ?? 0}
                    </div>
                    <p className="text-sm text-green-700 mt-1">Berhasil</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {importResults?.failed.length ?? 0}
                    </div>
                    <p className="text-sm text-red-700 mt-1">Gagal</p>
                  </CardContent>
                </Card>
              </div>

              {/* Success List */}
              {importResults && importResults.success.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-green-600">Siswa Berhasil Diimport</Label>
                  <Card className="max-h-40 overflow-y-auto">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {importResults.success.map((name, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {name}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Failed List */}
              {importResults && importResults.failed.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-red-600">Siswa Gagal Diimport</Label>
                  <Card className="max-h-60 overflow-y-auto">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {importResults.failed.map((item, index) => (
                          <li key={index} className="text-sm">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-red-900">
                                  Baris {item.row}: {item.name}
                                </p>
                                <p className="text-red-700">{item.error}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!showResults ? (
              <>
                <Button variant="outline" onClick={closeImportDialog}>
                  Batal
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={parsedData.length === 0 || bulkImportMutation.isPending}
                >
                  {bulkImportMutation.isPending ? "Mengimport..." : `Import ${parsedData.length} Siswa`}
                </Button>
              </>
            ) : (
              <Button onClick={closeImportDialog}>
                Tutup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nama, NIS, NISN..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter Kelas</Label>
              <Select
                value={classFilter ?? "all"}
                onValueChange={(value) => {
                  setClassFilter(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Siswa ({pagination?.total ?? 0} siswa)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Tidak ada data siswa
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIS / NISN</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {student.user.image ? (
                                <img
                                  src={student.user.image}
                                  alt={student.user.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                student.user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{student.user.name}</p>
                              {student.user.email && (
                                <p className="text-xs text-muted-foreground">
                                  {student.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {student.nis && <p className="text-sm">NIS: {student.nis}</p>}
                            {student.nisn && (
                              <p className="text-xs text-muted-foreground">
                                NISN: {student.nisn}
                              </p>
                            )}
                            {!student.nis && !student.nisn && (
                              <p className="text-muted-foreground">-</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.currentClass ? (
                            <Badge variant="secondary">
                              {student.currentClass.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Belum ada kelas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {student.user.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.isAlumni ? "outline" : "default"}>
                            {student.isAlumni ? "Alumni" : "Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(student)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(student.id, student.user.name)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, pagination.total)} dari {pagination.total} siswa
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-green-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Siswa
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {pagination?.total ?? 0}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Semua siswa
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-4">
                <GraduationCap className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Siswa Aktif
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {students.filter((s) => !s.isAlumni).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Masih bersekolah
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-4">
                <CheckCircle2 className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Alumni
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {students.filter((s) => s.isAlumni).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sudah lulus
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-4">
                <GraduationCap className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-orange-500 transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Punya Kelas
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {students.filter((s) => s.currentClass).length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sudah terdaftar
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-4">
                <CheckCircle2 className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { QRCodeSVG } from "qrcode.react";
import { CreditCard, Search, Printer, Download } from "lucide-react";
import Image from "next/image";

export default function StudentIDCardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: studentsData } = api.student.getAll.useQuery({
    page: 1,
    limit: 100,
    search: searchTerm || undefined,
  });

  const students = studentsData?.students || [];
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handlePrint = () => {
    if (cardRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Kartu Pelajar - ${selectedStudent?.user.name}</title>
              <style>
                @media print {
                  body { margin: 0; padding: 20px; }
                  @page { size: 85.6mm 53.98mm; margin: 0; }
                }
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
              </style>
            </head>
            <body>
              ${cardRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  // Generate QR code data
  const qrData = selectedStudent
    ? JSON.stringify({
        id: selectedStudent.id,
        nis: selectedStudent.nis || "",
        name: selectedStudent.user.name,
        class: selectedStudent.currentClass?.name || "Belum ada kelas",
      })
    : "";

  return (
    <div>
      {/* Header with Gradient */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <CreditCard className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Kartu Pelajar</h2>
              <p className="mt-1 text-purple-100">
                Cetak kartu identitas siswa dengan QR Code
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white"></div>
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white"></div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Siswa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari nama atau NIS..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student">Pilih Siswa</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
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

            {selectedStudent && (
              <div className="mt-6 space-y-2 rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold">Informasi Siswa</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">NIS:</span>{" "}
                    {selectedStudent.nis || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Nama:</span>{" "}
                    {selectedStudent.user.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Kelas:</span>{" "}
                    {selectedStudent.currentClass?.name || "Belum ada kelas"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedStudent.user.email || "-"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handlePrint}
                disabled={!selectedStudent}
                className="flex-1"
              >
                <Printer className="mr-2 h-4 w-4" />
                Cetak Kartu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ID Card Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Kartu</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <div className="flex justify-center">
                {/* ID Card Container - Credit Card Size (85.6mm x 53.98mm) */}
                <div
                  ref={cardRef}
                  className="relative h-[340px] w-[540px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 shadow-2xl"
                  style={{
                    aspectRatio: "85.6 / 53.98",
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white"></div>
                    <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex h-full flex-col text-white">
                    {/* Header */}
                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-bold">KARTU PELAJAR</h3>
                      <p className="text-xs opacity-90">STUDENT ID CARD</p>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-1 gap-4">
                      {/* Left: Photo */}
                      <div className="flex flex-col items-center">
                        <div className="mb-2 h-24 w-24 overflow-hidden rounded-lg bg-white/20 backdrop-blur">
                          {selectedStudent.user.image ? (
                            <Image
                              src={selectedStudent.user.image}
                              alt={selectedStudent.user.name}
                              width={96}
                              height={96}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl font-bold">
                              {selectedStudent.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="rounded-lg bg-white/20 p-2 backdrop-blur">
                          <QRCodeSVG
                            value={qrData}
                            size={80}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      {/* Right: Info */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs opacity-75">NIS</p>
                          <p className="text-lg font-bold">
                            {selectedStudent.nis || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Nama</p>
                          <p className="font-semibold">
                            {selectedStudent.user.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Kelas</p>
                          <p className="font-medium">
                            {selectedStudent.currentClass?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Tahun Masuk</p>
                          <p className="text-sm">
                            {selectedStudent.enrollmentYear || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto text-center">
                      <div className="h-px bg-white/30"></div>
                      <p className="mt-2 text-xs opacity-75">
                        Valid: {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[340px] items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                  <CreditCard className="mx-auto mb-4 h-12 w-12" />
                  <p>Pilih siswa untuk melihat preview kartu</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Pilih siswa dari dropdown</p>
            <p>2. Preview kartu akan muncul di sebelah kanan</p>
            <p>3. Klik tombol "Cetak Kartu" untuk mencetak</p>
            <p>4. QR Code berisi informasi: ID, NIS, Nama, dan Kelas siswa</p>
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-blue-900">
              <strong>Tips:</strong> Gunakan kertas PVC atau kartu plastik untuk hasil terbaik.
              Ukuran kartu standar: 85.6mm x 53.98mm (Credit Card Size)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

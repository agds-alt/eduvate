"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { UserMenu } from "~/components/layout/user-menu";

const menuItems = [
  {
    title: "Dashboard",
    icon: "📊",
    href: "/dashboard",
  },
  {
    title: "Manajemen Sekolah",
    items: [
      { title: "Profil Sekolah", icon: "🏫", href: "/dashboard/school" },
    ],
  },
  {
    title: "Manajemen Pengguna",
    items: [
      { title: "Data Guru/Staff", icon: "👨‍🏫", href: "/dashboard/teachers" },
      { title: "Data Siswa", icon: "🎓", href: "/dashboard/students" },
      { title: "Data Wali", icon: "👨‍👩‍👧", href: "/dashboard/parents" },
      { title: "Alumni", icon: "🎓", href: "/dashboard/alumni" },
    ],
  },
  {
    title: "Akademik",
    items: [
      { title: "Kelas", icon: "🏛️", href: "/dashboard/classes" },
      { title: "Mata Pelajaran", icon: "📚", href: "/dashboard/subjects" },
      { title: "Ujian", icon: "📝", href: "/dashboard/exams" },
      { title: "Hasil Ujian", icon: "📊", href: "/dashboard/exam-results" },
      { title: "Raport", icon: "📋", href: "/dashboard/report-cards" },
    ],
  },
  {
    title: "Absensi",
    items: [
      { title: "Pengaturan Absensi", icon: "⚙️", href: "/dashboard/attendance/settings" },
      { title: "Absensi Manual", icon: "✍️", href: "/dashboard/attendance/manual" },
      { title: "Scan Absensi", icon: "📱", href: "/dashboard/attendance/scan" },
      { title: "Absensi Biometrik", icon: "👆", href: "/dashboard/attendance/biometric" },
      { title: "Kelola Data Biometrik", icon: "🔐", href: "/dashboard/attendance/biometric-data" },
      { title: "Jadwal Absensi", icon: "📅", href: "/dashboard/attendance/schedule" },
      { title: "Log Harian", icon: "📄", href: "/dashboard/attendance/daily-log" },
      { title: "Log Bulanan", icon: "📊", href: "/dashboard/attendance/monthly-log" },
    ],
  },
  {
    title: "Keuangan",
    items: [
      { title: "SPP / Tagihan Siswa", icon: "💰", href: "/dashboard/finance/tuition" },
      { title: "Pembayaran Lainnya", icon: "💳", href: "/dashboard/finance/other-payments" },
      { title: "Laporan Keuangan", icon: "📈", href: "/dashboard/finance/reports" },
      { title: "Penggajian", icon: "💵", href: "/dashboard/finance/payroll" },
    ],
  },
  {
    title: "Konten",
    items: [
      { title: "Agenda", icon: "📅", href: "/dashboard/agenda" },
      { title: "Galeri", icon: "📷", href: "/dashboard/gallery" },
      { title: "Informasi", icon: "📢", href: "/dashboard/information" },
      { title: "Hari Libur", icon: "🎉", href: "/dashboard/holidays" },
    ],
  },
  {
    title: "Laporan",
    items: [
      { title: "Rekap Absensi", icon: "📊", href: "/dashboard/reports/attendance" },
      { title: "Rekap Akademik", icon: "📚", href: "/dashboard/reports/academic" },
      { title: "Rekap Keuangan", icon: "💰", href: "/dashboard/reports/finance" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
            E
          </div>
          <span className="text-xl font-bold">Eduvate</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
        <div className="space-y-4">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {/* Single Menu Item */}
              {section.href ? (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === section.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.title}</span>
                </Link>
              ) : (
                /* Menu Section with Subitems */
                <div>
                  <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items?.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          pathname === item.href
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 w-full border-t bg-white p-4">
        <UserMenu />
      </div>
    </aside>
  );
}

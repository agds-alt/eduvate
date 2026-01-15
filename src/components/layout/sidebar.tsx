"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { UserMenu } from "~/components/layout/user-menu";
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  UsersRound,
  Award,
  BookOpen,
  Library,
  FileText,
  BarChart3,
  ClipboardList,
  Settings,
  Edit3,
  Scan,
  Fingerprint,
  Lock,
  Calendar,
  FileCheck,
  PieChart,
  Wallet,
  CreditCard,
  TrendingUp,
  Banknote,
  CalendarDays,
  Image,
  Megaphone,
  PartyPopper,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Manajemen Sekolah",
    icon: School,
    items: [
      { title: "Profil Sekolah", icon: School, href: "/dashboard/school" },
    ],
  },
  {
    title: "Manajemen Pengguna",
    icon: Users,
    items: [
      { title: "Data Guru/Staff", icon: Users, href: "/dashboard/teachers" },
      { title: "Data Siswa", icon: GraduationCap, href: "/dashboard/students" },
      { title: "Data Wali", icon: UsersRound, href: "/dashboard/parents" },
      { title: "Alumni", icon: Award, href: "/dashboard/alumni" },
    ],
  },
  {
    title: "Akademik",
    icon: BookOpen,
    items: [
      { title: "Kelas", icon: Library, href: "/dashboard/classes" },
      { title: "Mata Pelajaran", icon: BookOpen, href: "/dashboard/subjects" },
      { title: "Ujian", icon: FileText, href: "/dashboard/exams" },
      { title: "Hasil Ujian", icon: BarChart3, href: "/dashboard/exam-results" },
      { title: "Raport", icon: ClipboardList, href: "/dashboard/report-cards" },
    ],
  },
  {
    title: "Absensi",
    icon: ClipboardList,
    items: [
      { title: "Pengaturan Absensi", icon: Settings, href: "/dashboard/attendance/settings" },
      { title: "Absensi Manual", icon: Edit3, href: "/dashboard/attendance/manual" },
      { title: "Scan Absensi", icon: Scan, href: "/dashboard/attendance/scan" },
      { title: "Absensi Biometrik", icon: Fingerprint, href: "/dashboard/attendance/biometric" },
      { title: "Kelola Data Biometrik", icon: Lock, href: "/dashboard/attendance/biometric-data" },
      { title: "Jadwal Absensi", icon: Calendar, href: "/dashboard/attendance/schedule" },
      { title: "Log Harian", icon: FileCheck, href: "/dashboard/attendance/daily-log" },
      { title: "Log Bulanan", icon: PieChart, href: "/dashboard/attendance/monthly-log" },
    ],
  },
  {
    title: "Keuangan",
    icon: Wallet,
    items: [
      { title: "SPP / Tagihan Siswa", icon: Wallet, href: "/dashboard/finance/tuition" },
      { title: "Pembayaran Lainnya", icon: CreditCard, href: "/dashboard/finance/other-payments" },
      { title: "Laporan Keuangan", icon: TrendingUp, href: "/dashboard/finance/reports" },
      { title: "Penggajian", icon: Banknote, href: "/dashboard/finance/payroll" },
    ],
  },
  {
    title: "Konten",
    icon: Image,
    items: [
      { title: "Agenda", icon: CalendarDays, href: "/dashboard/agenda" },
      { title: "Galeri", icon: Image, href: "/dashboard/gallery" },
      { title: "Informasi", icon: Megaphone, href: "/dashboard/information" },
      { title: "Hari Libur", icon: PartyPopper, href: "/dashboard/holidays" },
    ],
  },
  {
    title: "Laporan",
    icon: BarChart3,
    items: [
      { title: "Rekap Absensi", icon: ClipboardList, href: "/dashboard/reports/attendance" },
      { title: "Rekap Akademik", icon: BookOpen, href: "/dashboard/reports/academic" },
      { title: "Rekap Keuangan", icon: TrendingUp, href: "/dashboard/reports/finance" },
    ],
  },
];

function CollapsibleSection({
  section,
  pathname,
  isOpen,
  onToggle,
}: {
  section: typeof menuItems[number];
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;
  const hasActiveChild = section.items?.some((item) => pathname === item.href);

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-gray-700 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{section.title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform" />
        )}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
          {section.items?.map((item, itemIdx) => {
            const ItemIcon = item.icon;
            return (
              <Link
                key={itemIdx}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  pathname === item.href
                    ? "bg-primary font-medium text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Auto-open sections that contain the current path
    const initial: Record<string, boolean> = {};
    menuItems.forEach((section, idx) => {
      if (section.items) {
        const hasActivePath = section.items.some((item) => pathname === item.href);
        initial[idx.toString()] = hasActivePath;
      }
    });
    return initial;
  });

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [idx.toString()]: !prev[idx.toString()],
    }));
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-gradient-to-b from-white to-gray-50/50">
      {/* Logo */}
      <div className="flex h-16 items-center border-b bg-white px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md">
            E
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Eduvate
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4">
        <div className="space-y-1.5">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {/* Single Menu Item (Dashboard) */}
              {section.href ? (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    pathname === section.href
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {section.icon && <section.icon className="h-4 w-4" />}
                  <span>{section.title}</span>
                </Link>
              ) : (
                /* Collapsible Section */
                <CollapsibleSection
                  section={section}
                  pathname={pathname}
                  isOpen={openSections[idx.toString()] ?? false}
                  onToggle={() => toggleSection(idx)}
                />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 w-full border-t bg-white p-4 shadow-lg">
        <UserMenu />
      </div>
    </aside>
  );
}

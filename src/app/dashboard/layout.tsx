import { Sidebar } from "~/components/layout/sidebar";
import { Toaster } from "~/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Mobile: no left padding, Desktop: left padding for sidebar */}
      <main className="flex-1 overflow-y-auto bg-gray-50 lg:pl-64">
        {/* Mobile-optimized padding with safe area support */}
        <div className="container mx-auto px-4 py-6 safe-top safe-bottom sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

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
      <main className="flex-1 overflow-y-auto bg-gray-50 pl-64">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

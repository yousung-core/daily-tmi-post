import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileNav from "@/components/AdminMobileNav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <AdminMobileNav />
      <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
    </div>
  );
}

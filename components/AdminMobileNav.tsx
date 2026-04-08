"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/admin/submissions", label: "신청 관리", icon: "📋" },
  { href: "/admin/articles", label: "기사 관리", icon: "📰" },
  { href: "/admin/comments", label: "댓글/신고 관리", icon: "🚨" },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <nav className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        로그아웃
      </button>
    </nav>
  );
}

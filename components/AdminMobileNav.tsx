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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? "text-blue-700 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs text-gray-500 hover:text-gray-700"
        >
          <span className="text-lg" aria-hidden="true">🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </nav>
  );
}

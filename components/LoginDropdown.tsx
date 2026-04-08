"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

const providers = [
  {
    id: "google" as const,
    label: "Google로 로그인",
    bg: "bg-white border border-gray-300 hover:bg-gray-50",
    text: "text-gray-700",
    icon: "G",
  },
  {
    id: "kakao" as const,
    label: "카카오 로그인",
    bg: "bg-[#FEE500] hover:bg-[#FDD835]",
    text: "text-[#191919]",
    icon: "K",
  },
  {
    id: "naver" as const,
    label: "네이버 로그인",
    bg: "bg-[#03C75A] hover:bg-[#02b050]",
    text: "text-white",
    icon: "N",
  },
];

export default function LoginDropdown() {
  const { user, profile, isLoading, signInWithOAuth, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-16 h-5 bg-parchment-300/50 rounded animate-pulse" />
    );
  }

  const expandedProps = {
    "aria-expanded": open ? "true" : "false",
  } as const;

  if (user && profile) {
    return (
      <div ref={ref} className="relative">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          {...expandedProps}
          aria-haspopup="true"
          aria-label="사용자 메뉴"
          className="flex items-center gap-1.5 text-xs text-ink-700 hover:text-ink-900 transition-colors min-h-[44px] sm:min-h-0"
        >
          {profile.avatarUrl && !avatarError ? (
            <Image
              src={profile.avatarUrl}
              alt="프로필"
              width={20}
              height={20}
              className="rounded-full"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="w-5 h-5 rounded-full bg-ink-300 flex items-center justify-center text-[10px] text-white">
              {profile.nickname[0] || "?"}
            </span>
          )}
          <span className="hidden md:inline max-w-[80px] truncate">
            {profile.nickname}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-40 max-w-[calc(100vw-2rem)] bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50" role="menu">
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 truncate">
              {profile.nickname}
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              role="menuitem"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        {...expandedProps}
        aria-haspopup="true"
        aria-label="로그인 옵션"
        className="text-xs text-ink-600 hover:text-ink-900 transition-colors min-h-[44px] sm:min-h-0 flex items-center"
      >
        로그인
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-2rem)] bg-white rounded-md shadow-lg border border-gray-200 p-3 z-50 space-y-2" role="menu">
          {providers.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                signInWithOAuth(p.id);
                setOpen(false);
              }}
              role="menuitem"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${p.bg} ${p.text}`}
            >
              <span className="w-5 text-center font-bold">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

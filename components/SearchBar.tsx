"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  variant?: "header" | "banner";
}

export default function SearchBar({ variant = "header" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
    }
  };

  const isBanner = variant === "banner";

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <label className="sr-only" htmlFor={`search-${variant}`}>기사 검색</label>
      <input
        id={`search-${variant}`}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="기사 검색..."
        className={`border border-parchment-400 bg-parchment-50 rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-1 transition-colors ${
          isBanner
            ? "w-44 md:w-56 px-3 py-2.5 text-sm"
            : "w-28 md:w-40 px-2 py-2 text-sm"
        }`}
      />
      <button
        type="submit"
        className={`bg-ink-800 text-parchment-100 hover:bg-accent-crimson transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2 ${
          isBanner
            ? "px-3 py-2.5"
            : "px-2.5 py-2"
        }`}
        aria-label="검색"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}

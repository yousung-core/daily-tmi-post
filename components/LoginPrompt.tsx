"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const providers = [
  {
    id: "google" as const,
    label: "Google",
    bg: "bg-white border border-gray-300 hover:bg-gray-50",
    text: "text-gray-700",
    icon: "G",
  },
  {
    id: "kakao" as const,
    label: "카카오",
    bg: "bg-[#FEE500] hover:bg-[#FDD835]",
    text: "text-[#191919]",
    icon: "K",
  },
  {
    id: "naver" as const,
    label: "네이버",
    bg: "bg-[#03C75A] hover:bg-[#02b050]",
    text: "text-white",
    icon: "N",
  },
];

/** 인라인 로그인 유도 (댓글 폼 대체용) */
export function LoginPromptInline({ message }: { message?: string }) {
  const { signInWithOAuth } = useAuth();

  return (
    <div className="flex flex-col items-center gap-3 py-4 px-4 border border-parchment-300 rounded-md bg-parchment-100/50">
      <p className="text-sm text-ink-600">
        {message || "로그인 후 댓글을 작성할 수 있습니다."}
      </p>
      <div className="flex gap-2">
        {providers.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => signInWithOAuth(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${p.bg} ${p.text}`}
          >
            <span className="font-bold">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 모달형 로그인 유도 (리액션/좋아요 클릭 시) */
export function LoginPromptModal({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  const { signInWithOAuth } = useAuth();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 mx-4 w-full max-w-xs space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-ink-700 text-center font-medium">
          {message || "로그인이 필요합니다"}
        </p>
        <div className="space-y-2">
          {providers.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                signInWithOAuth(p.id);
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${p.bg} ${p.text}`}
            >
              <span className="w-5 text-center font-bold">{p.icon}</span>
              {p.label}로 로그인
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-xs text-ink-400 hover:text-ink-600 py-1 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

/** 로그인 모달 상태를 쉽게 관리하기 위한 훅 */
export function useLoginPrompt() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>();

  const prompt = (msg?: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const close = () => setOpen(false);

  return { open, message, prompt, close };
}

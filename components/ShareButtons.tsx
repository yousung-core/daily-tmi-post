"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description || "");

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}%0A${encodedDescription}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    kakao: "#",
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다!");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleInstagramShare = () => {
    // clipboard API는 비동기이므로, 팝업 차단을 피하기 위해
    // 먼저 window.open을 동기적으로 호출한 뒤 클립보드 복사
    const win = window.open("https://www.instagram.com/", "_blank");
    navigator.clipboard.writeText(url).then(() => {
      toast.success("링크가 복사되었습니다! Instagram에서 붙여넣기 해주세요.", { duration: 4000 });
    }).catch(() => {
      toast.error("링크 복사에 실패했습니다.");
    });
    if (!win) {
      toast("팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.");
    }
  };

  const handleKakaoShare = () => {
    if (typeof window !== "undefined" && window.Kakao?.isInitialized()) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title,
            description: description || "",
            imageUrl: "",
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
          buttons: [
            {
              title: "기사 보기",
              link: {
                mobileWebUrl: url,
                webUrl: url,
              },
            },
          ],
        });
      } catch {
        toast.error("카카오톡 공유 중 오류가 발생했습니다.");
      }
    } else {
      toast("카카오톡 SDK가 로드되지 않아 카카오스토리로 공유합니다.", { duration: 3000 });
      window.open(
        `https://story.kakao.com/share?url=${encodedUrl}`,
        "_blank",
        "width=600,height=400"
      );
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text: description || "",
        url,
      });
    } catch (err) {
      // AbortError는 사용자가 공유 시트를 닫은 경우 — 무시
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("공유에 실패했습니다.");
      }
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "kakao") {
      handleKakaoShare();
    } else {
      window.open(shareLinks[platform], "_blank", "width=600,height=400");
    }
  };

  // SSR과 클라이언트 모두 false로 시작해 hydration 불일치를 방지
  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  useEffect(() => {
    setSupportsNativeShare(!!navigator.share);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-ink-600 font-semibold">공유하기</p>
      <div className="flex flex-nowrap justify-center gap-2 sm:gap-3">
        {/* 모바일: 네이티브 공유 시트 */}
        {supportsNativeShare && (
          <button
            onClick={handleNativeShare}
            className="w-9 h-9 sm:w-11 sm:h-11 bg-ink-600 text-parchment-100 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-600 focus-visible:ring-offset-2"
            title="공유하기"
            aria-label="시스템 공유 시트 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        )}

        {/* Twitter/X */}
        <button
          onClick={() => handleShare("twitter")}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-ink-800 text-parchment-100 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2"
          title="Twitter/X에 공유"
          aria-label="Twitter/X에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare("facebook")}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2"
          title="Facebook에 공유"
          aria-label="Facebook에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* 카카오톡 */}
        <button
          onClick={() => handleShare("kakao")}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FEE500] text-[#191919] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FEE500] focus-visible:ring-offset-2"
          title="카카오톡으로 공유"
          aria-label="카카오톡으로 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.84 1.88 5.34 4.72 6.77-.16.57-.62 2.19-.71 2.53-.11.42.15.42.32.3.13-.09 2.08-1.42 2.94-2 .88.13 1.8.2 2.73.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
        </button>

        {/* Instagram */}
        <button
          onClick={handleInstagramShare}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2A7B] focus-visible:ring-offset-2"
          title="Instagram에 공유"
          aria-label="Instagram에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare("linkedin")}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-[#0A66C2] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2] focus-visible:ring-offset-2"
          title="LinkedIn에 공유"
          aria-label="LinkedIn에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </button>

        {/* 링크 복사 */}
        <button
          onClick={handleCopyLink}
          className="w-9 h-9 sm:w-11 sm:h-11 bg-parchment-300 text-ink-700 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800 focus-visible:ring-offset-2"
          title="링크 복사"
          aria-label="링크 복사"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

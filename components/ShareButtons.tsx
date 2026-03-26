"use client";

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
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    kakao: "#", // 카카오는 SDK 필요
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다!");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleKakaoShare = () => {
    // 카카오 SDK가 로드되지 않은 경우 기본 공유
    if (typeof window !== "undefined" && (window as any).Kakao) {
      const Kakao = (window as any).Kakao;
      if (!Kakao.isInitialized()) {
        // 카카오 앱 키가 필요합니다
        // Kakao.init('YOUR_KAKAO_APP_KEY');
      }
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description: description || "",
          imageUrl: "", // TODO: 공유 이미지 URL
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
    } else {
      // 카카오 SDK 없으면 일반 공유
      window.open(
        `https://story.kakao.com/share?url=${encodedUrl}`,
        "_blank",
        "width=600,height=400"
      );
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "kakao") {
      handleKakaoShare();
    } else {
      window.open(shareLinks[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-ink-600 font-semibold">공유하기</p>
      <div className="flex gap-2">
        {/* Twitter/X */}
        <button
          onClick={() => handleShare("twitter")}
          className="w-10 h-10 bg-ink-800 text-parchment-100 rounded-full flex items-center justify-center hover:bg-accent-crimson transition-colors"
          title="Twitter/X에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare("facebook")}
          className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          title="Facebook에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* 카카오톡 */}
        <button
          onClick={() => handleShare("kakao")}
          className="w-10 h-10 bg-[#FEE500] text-[#191919] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          title="카카오톡으로 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.84 1.88 5.34 4.72 6.77-.16.57-.62 2.19-.71 2.53-.11.42.15.42.32.3.13-.09 2.08-1.42 2.94-2 .88.13 1.8.2 2.73.2 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare("linkedin")}
          className="w-10 h-10 bg-[#0A66C2] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          title="LinkedIn에 공유"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </button>

        {/* 링크 복사 */}
        <button
          onClick={handleCopyLink}
          className="w-10 h-10 bg-parchment-300 text-ink-700 rounded-full flex items-center justify-center hover:bg-parchment-400 transition-colors"
          title="링크 복사"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

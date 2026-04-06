export const IMAGE_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  maxSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"] as const,
};

export function validateImageFile(file: File): string | null {
  if (
    !IMAGE_CONFIG.allowedTypes.includes(
      file.type as (typeof IMAGE_CONFIG.allowedTypes)[number]
    )
  ) {
    return "JPG, PNG, WebP 형식만 업로드 가능합니다.";
  }
  if (file.size > IMAGE_CONFIG.maxSizeBytes) {
    return `이미지 크기는 ${IMAGE_CONFIG.maxSizeMB}MB 이하여야 합니다.`;
  }
  return null;
}


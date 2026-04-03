// ==========================================
// 기사 슬러그 생성
// 형식: {category}-{YYYYMMDD}-{8자리 랜덤}
// 예: finance-20260403-a1b2c3d4
// ==========================================

export function generateSlug(category: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hash = crypto.randomUUID().replace(/-/g, "").substring(0, 8);
  return `${category}-${y}${m}${d}-${hash}`;
}

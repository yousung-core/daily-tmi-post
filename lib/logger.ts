/**
 * 구조화된 에러 로거
 * Vercel Functions 로그에서 필터링하기 쉬운 형식으로 출력합니다.
 */
export function captureError(
  tag: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
  const stack =
    error instanceof Error ? error.stack : undefined;

  const logEntry = {
    level: "error",
    tag,
    message,
    ...(stack && { stack }),
    ...(extra && { extra }),
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(logEntry));
}

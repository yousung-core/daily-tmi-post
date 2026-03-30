import React from "react";

/**
 * **bold** 마크다운을 React 노드로 안전하게 변환합니다.
 * dangerouslySetInnerHTML 없이 렌더링하여 XSS를 방지합니다.
 */
export function parseBoldMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

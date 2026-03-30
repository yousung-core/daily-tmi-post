import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <div className="text-8xl mb-6">📭</div>
      <h1 className="headline text-4xl mb-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-ink-600 mb-2">
        이런! 찾으시는 페이지가 존재하지 않습니다.
      </p>
      <p className="text-ink-500 italic mb-8">
        주소를 다시 확인해주세요.
      </p>
      <Link href="/" className="btn-vintage inline-block">
        홈으로 돌아가기
      </Link>
    </div>
  );
}

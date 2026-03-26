import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <div className="text-8xl mb-6">&#x1F9D9;</div>
      <h1 className="headline text-4xl mb-4">Page Not Found</h1>
      <p className="text-ink-600 mb-2">
        이런! 찾으시는 페이지가 사라졌습니다.
      </p>
      <p className="text-ink-500 italic mb-8">
        Perhaps a vanishing spell went awry?
      </p>
      <Link href="/" className="btn-vintage inline-block">
        Return to Front Page
      </Link>
    </div>
  );
}

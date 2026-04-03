import Link from "next/link";

export default function SubmitSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      {/* 성공 아이콘 */}
      <div className="text-8xl mb-6">📰</div>

      <h1 className="headline text-3xl md:text-4xl mb-4">
        신청이 완료되었습니다!
      </h1>

      <div className="bg-parchment-100 border-2 border-parchment-400 p-6 mb-8">
        <p className="text-ink-700 mb-4">
          기사 신청이 성공적으로 접수되었습니다.
        </p>
        <p className="text-ink-600 text-sm">
          관리자 검토 후 게시 여부가 결정되며,<br />
          결과는 입력하신 이메일로 안내드립니다.
        </p>

        <div className="ornamental-divider my-6">
          <span className="text-lg">&#x2767;</span>
        </div>

        <div className="text-sm text-ink-500">
          <p className="mb-2">
            <strong>예상 검토 기간:</strong> 1~3일
          </p>
          <p>
            <strong>문의:</strong> daily.tmi@example.com
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/submit" className="btn-vintage inline-block">
          다른 기사 신청하기
        </Link>
        <Link href="/" className="btn-vintage inline-block bg-parchment-200">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

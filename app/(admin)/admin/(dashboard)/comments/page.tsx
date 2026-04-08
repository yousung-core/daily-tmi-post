import { Suspense } from "react";
import ReportedCommentsList from "./ReportedCommentsList";

export default function CommentsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      }
    >
      <ReportedCommentsList />
    </Suspense>
  );
}

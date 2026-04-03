import { Suspense } from "react";
import SubmissionsList from "./SubmissionsList";

export default function SubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      }
    >
      <SubmissionsList />
    </Suspense>
  );
}

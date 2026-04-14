import { moderateComment } from "./ai";
import { createSupabaseAdminClient } from "./supabase-admin";
import { captureError } from "./logger";

/**
 * 댓글 AI 모더레이션 (fire-and-forget)
 * 호출자는 await하지 않으며, 실패 시 댓글은 그대로 유지됩니다 (fail-open).
 * snapshotTime: 모더레이션 요청 시점의 타임스탬프. AI 분석 중 댓글이 수정되면
 * updated_at이 변경되므로, 오래된 분석 결과가 수정된 댓글을 덮어쓰지 않습니다.
 */
export function triggerCommentModeration(commentId: string, content: string): void {
  const snapshotTime = new Date().toISOString();

  moderateComment(content)
    .then(async (result) => {
      if (result.is_inappropriate) {
        const supabase = createSupabaseAdminClient();
        const { error } = await supabase
          .from("comments")
          .update({
            is_hidden: true,
            hidden_reason: result.reason,
          })
          .eq("id", commentId)
          .eq("is_deleted", false)
          .lte("updated_at", snapshotTime);

        if (error) {
          captureError("moderation.update", error, { commentId });
        }
      }
    })
    .catch((err) => captureError("moderation.analyze", err, { commentId }));
}

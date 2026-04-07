"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { Comment } from "@/lib/types";
import CommentForm from "./CommentForm";
import CommentLikeButton from "./CommentLikeButton";

interface CommentItemProps {
  comment: Comment;
  articleId: string;
  isReply?: boolean;
  onRefresh: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return dateStr;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export default function CommentItem({
  comment,
  articleId,
  isReply = false,
  onRefresh,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isOwner = user?.id === comment.userId;
  const nickname = comment.userProfile?.nickname || "익명";

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      setEditing(false);
      onRefresh();
    } catch {
      toast.error("수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }
      onRefresh();
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("신고가 접수되었습니다.");
      setShowReport(false);
      setReportReason("");
    } catch {
      toast.error("신고에 실패했습니다.");
    } finally {
      setReporting(false);
    }
  };

  if (comment.isDeleted) {
    return (
      <div className={`${isReply ? "ml-8" : ""} py-3`}>
        <p className="text-sm text-ink-400 italic">삭제된 댓글입니다.</p>
      </div>
    );
  }

  const showAvatar = comment.userProfile?.avatarUrl && !avatarError;

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-parchment-300 pl-4" : ""} py-3`}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-1">
        {showAvatar ? (
          <Image
            src={comment.userProfile!.avatarUrl!}
            alt=""
            width={24}
            height={24}
            className="rounded-full"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="w-6 h-6 rounded-full bg-ink-200 flex items-center justify-center text-[10px] text-ink-600">
            {nickname[0] || "?"}
          </span>
        )}
        <span className="text-sm font-medium text-ink-800">{nickname}</span>
        <span className="text-xs text-ink-400">{timeAgo(comment.createdAt)}</span>
        {comment.createdAt !== comment.updatedAt && (
          <span className="text-xs text-ink-400">(수정됨)</span>
        )}
      </div>

      {/* 본문 */}
      {editing ? (
        <div className="mb-2 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={500}
            rows={2}
            aria-label="댓글 수정"
            className="w-full px-3 py-2 text-sm border border-parchment-400 rounded-md bg-white/80 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={saving}
              className="px-3 py-1 text-xs bg-ink-800 text-parchment-100 rounded-md disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditContent(comment.content);
              }}
              className="px-3 py-1 text-xs text-ink-600"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-700 mb-2 whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center gap-3">
        <CommentLikeButton
          commentId={comment.id}
          initialCount={comment.likeCount}
          initialLiked={comment.isLikedByMe}
        />
        {!isReply && user && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            aria-label="답글 작성"
            className="text-xs text-ink-400 hover:text-ink-600"
          >
            답글
          </button>
        )}
        {isOwner && !editing && (
          <>
            <button
              onClick={() => setEditing(true)}
              aria-label="댓글 수정"
              className="text-xs text-ink-400 hover:text-ink-600"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              aria-label="댓글 삭제"
              className="text-xs text-ink-400 hover:text-red-500 disabled:opacity-50"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </>
        )}
        {user && !isOwner && (
          <button
            onClick={() => setShowReport(!showReport)}
            aria-label="댓글 신고"
            className="text-xs text-ink-400 hover:text-red-500"
          >
            신고
          </button>
        )}
      </div>

      {/* 신고 폼 */}
      {showReport && (
        <div className="mt-2 flex gap-2">
          <input
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="신고 사유"
            maxLength={200}
            aria-label="신고 사유"
            className="flex-1 px-2 py-1 text-xs border border-parchment-400 rounded-md"
          />
          <button
            onClick={handleReport}
            disabled={reporting}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded-md disabled:opacity-50"
          >
            {reporting ? "신고 중..." : "신고"}
          </button>
        </div>
      )}

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="mt-3">
          <CommentForm
            articleId={articleId}
            parentId={comment.id}
            placeholder="답글을 작성해주세요"
            onSuccess={() => {
              setShowReplyForm(false);
              onRefresh();
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              isReply
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

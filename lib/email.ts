import { Resend } from "resend";
import { getResendApiKey, siteUrl } from "./env";
import { captureError } from "./logger";

let _resend: Resend | undefined;

function getResendClient(): Resend {
  if (!_resend) _resend = new Resend(getResendApiKey());
  return _resend;
}

// 개발 시: onboarding@resend.dev (자신의 이메일로만 발송 가능)
// 프로덕션: 도메인 인증 후 변경
const FROM_ADDRESS = "Daily TMI Post <onboarding@resend.dev>";

interface ApprovalEmailParams {
  to: string;
  articleTitle: string;
  articleUrl: string;
}

interface RejectionEmailParams {
  to: string;
  submissionTitle: string;
  adminNote: string;
}

export function sendApprovalEmail(params: ApprovalEmailParams): void {
  try {
    const fullUrl = `${siteUrl}${params.articleUrl}`;

    getResendClient()
      .emails.send({
        from: FROM_ADDRESS,
        to: params.to,
        subject: `[Daily TMI Post] 기사가 승인되었습니다: ${params.articleTitle}`,
        html: buildApprovalHtml(params.articleTitle, fullUrl),
      })
      .catch((err) =>
        captureError("email.sendApproval", err)
      );
  } catch (err) {
    captureError("email.sendApproval.init", err);
  }
}

export function sendRejectionEmail(params: RejectionEmailParams): void {
  try {
    getResendClient()
      .emails.send({
        from: FROM_ADDRESS,
        to: params.to,
        subject: `[Daily TMI Post] 기사 신청 결과 안내`,
        html: buildRejectionHtml(params.submissionTitle, params.adminNote),
      })
      .catch((err) =>
        captureError("email.sendRejection", err)
      );
  } catch (err) {
    captureError("email.sendRejection.init", err);
  }
}

function buildApprovalHtml(title: string, articleUrl: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:560px;margin:40px auto;background:#fffdf7;border:2px solid #8b7355;border-radius:4px;overflow:hidden;">
    <div style="background:#1a1a1a;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#f5f0e8;font-size:22px;letter-spacing:2px;">DAILY TMI POST</h1>
    </div>
    <div style="padding:32px 28px;">
      <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">
        안녕하세요, Daily TMI Post입니다.
      </p>
      <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 24px;">
        신청하신 기사 <strong style="color:#8b6914;">&ldquo;${escapeHtml(title)}&rdquo;</strong>가 승인되어 게시되었습니다!
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${escapeHtml(articleUrl)}"
           style="display:inline-block;padding:14px 32px;background:#1a1a1a;color:#f5f0e8;text-decoration:none;font-size:15px;border-radius:4px;letter-spacing:1px;">
          기사 보러가기 →
        </a>
      </div>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:24px 0 0;">
        소중한 이야기를 공유해주셔서 감사합니다.
      </p>
    </div>
    <div style="border-top:1px solid #ddd;padding:16px 28px;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">© Daily TMI Post</p>
    </div>
  </div>
</body>
</html>`;
}

function buildRejectionHtml(title: string, adminNote: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:560px;margin:40px auto;background:#fffdf7;border:2px solid #8b7355;border-radius:4px;overflow:hidden;">
    <div style="background:#1a1a1a;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#f5f0e8;font-size:22px;letter-spacing:2px;">DAILY TMI POST</h1>
    </div>
    <div style="padding:32px 28px;">
      <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">
        안녕하세요, Daily TMI Post입니다.
      </p>
      <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 24px;">
        신청하신 기사 <strong>&ldquo;${escapeHtml(title)}&rdquo;</strong>에 대해 안내드립니다.
      </p>
      <div style="background:#f9f5ed;border-left:4px solid #8b7355;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#999;font-weight:bold;">편집팀 안내</p>
        <p style="margin:0;color:#333;font-size:15px;line-height:1.6;">
          ${escapeHtml(adminNote)}
        </p>
      </div>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 20px;">
        수정 후 다시 신청해주시면 감사하겠습니다.
      </p>
      <div style="text-align:center;">
        <a href="${escapeHtml(siteUrl)}/submit"
           style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#f5f0e8;text-decoration:none;font-size:14px;border-radius:4px;">
          다시 신청하기
        </a>
      </div>
    </div>
    <div style="border-top:1px solid #ddd;padding:16px 28px;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">© Daily TMI Post</p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

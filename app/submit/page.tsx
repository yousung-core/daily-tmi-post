"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  SubmissionCategory,
  submissionCategoryLabels,
  submissionCategoryIcons,
} from "@/lib/types";
import { getTemplateByCategory } from "@/lib/templates";

const STORAGE_KEY = "daily-tmi-draft";
const MAX_CONTENT_LENGTH = 1000;
const MAX_TITLE_LENGTH = 50;

export default function SubmitPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<SubmissionCategory>("life");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = getTemplateByCategory(selectedCategory);
  const categories = Object.keys(submissionCategoryLabels) as SubmissionCategory[];

  // localStorage에서 임시 저장된 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.category) setSelectedCategory(parsed.category);
        if (parsed.formData) setFormData(parsed.formData);
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 자동 저장
  useEffect(() => {
    if (!isLoaded) return;
    const data = { email, category: selectedCategory, formData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [email, selectedCategory, formData, isLoaded]);

  // 유효성 검사 함수들
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFieldError = (name: string, value: string, required?: boolean) => {
    if (required && !value) return "필수 항목입니다";
    if (name === "email" && value && !isValidEmail(value)) return "올바른 이메일 형식이 아닙니다";
    if (name === "title" && value.length > MAX_TITLE_LENGTH) return `${MAX_TITLE_LENGTH}자 이내로 입력해주세요`;
    if (name === "content" && value.length > MAX_CONTENT_LENGTH) return `${MAX_CONTENT_LENGTH}자 이내로 입력해주세요`;
    return null;
  };

  const handleCategoryChange = (category: SubmissionCategory) => {
    setSelectedCategory(category);
  };

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // 날짜 프리셋 함수들
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const setDatePreset = (preset: 'now' | 'today' | 'yesterday') => {
    const now = new Date();
    let date: Date;

    switch (preset) {
      case 'now':
        date = now;
        break;
      case 'today':
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        break;
      case 'yesterday':
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0);
        break;
    }

    handleFormChange('eventDate', formatDateTimeLocal(date));
    setTouched((prev) => ({ ...prev, eventDate: true }));
  };

  // 필수 필드 목록
  const requiredFields = selectedTemplate?.fields.filter(f => f.required).map(f => f.name) || [];
  const allRequiredFields = ['email', ...requiredFields];

  // 완료율 계산
  const getCompletionRate = () => {
    let completed = 0;
    if (email && isValidEmail(email)) completed++;
    requiredFields.forEach(name => {
      if (formData[name]) completed++;
    });
    return { completed, total: allRequiredFields.length };
  };

  const { completed, total } = getCompletionRate();
  const completionPercent = Math.round((completed / total) * 100);

  // 폼 유효성 검사
  const isFormValid = email && isValidEmail(email) &&
    requiredFields.every(name => formData[name]);

  // 제출 처리
  const handleSubmit = async () => {
    // 모든 필드 touched 처리
    const allTouched: Record<string, boolean> = { email: true };
    selectedTemplate?.fields.forEach(f => {
      allTouched[f.name] = true;
    });
    setTouched(allTouched);

    if (!isFormValid) {
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = allRequiredFields.find(name => {
        if (name === 'email') return !email || !isValidEmail(email);
        return !formData[name];
      });
      if (firstErrorField) {
        const element = document.querySelector(`[data-field="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // TODO: Supabase에 저장
    console.log("Submission:", {
      email,
      category: selectedCategory,
      formData,
    });

    // 임시 저장 데이터 삭제
    localStorage.removeItem(STORAGE_KEY);

    router.push("/submit/success");
  };

  // 임시 저장 데이터 삭제
  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEmail("");
    setFormData({});
    setTouched({});
    setSelectedCategory("life");
  };

  // 입력 스타일 (유효성 상태에 따라)
  const getInputStyle = (name: string, required?: boolean) => {
    const base = "w-full px-4 py-3 border-2 bg-parchment-50 focus:outline-none transition-colors text-base";
    const value = name === 'email' ? email : (formData[name] || '');
    const error = touched[name] && getFieldError(name, value, required);
    const valid = touched[name] && value && !error;

    if (error) return `${base} border-red-400 focus:border-red-500`;
    if (valid) return `${base} border-green-400 focus:border-green-500`;
    return `${base} border-parchment-400 focus:border-accent-gold`;
  };

  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center py-12">
          <p className="text-ink-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-8">
      {/* 헤더 */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="headline text-2xl md:text-4xl mb-2">기사 신청하기</h1>
        <p className="text-ink-600 italic text-sm md:text-base">
          당신의 특별한 순간을 뉴스로 만들어드립니다
        </p>
      </div>

      {/* 진행률 표시 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-ink-600">작성 진행률</span>
          <span className="text-sm font-semibold text-accent-gold">{completed}/{total} 완료</span>
        </div>
        <div className="h-2 bg-parchment-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-gold transition-all duration-300 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* 폼 */}
      <div ref={formRef} className="bg-parchment-100 border-2 border-parchment-400 p-4 md:p-6 space-y-6">

        {/* 신청자 이메일 */}
        <div className="border-b-2 border-parchment-300 pb-6" data-field="email">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-gold text-parchment-100 flex items-center justify-center font-bold text-sm">1</div>
            <h3 className="font-semibold text-lg">신청자 정보</h3>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              이메일 <span className="text-accent-crimson">*</span>
            </label>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getInputStyle('email', true)}
              placeholder="email@example.com"
            />
            {touched.email && getFieldError('email', email, true) && (
              <p className="mt-2 text-sm text-red-600">{getFieldError('email', email, true)}</p>
            )}
            <p className="mt-2 text-xs text-ink-500">검토 결과를 안내받을 이메일을 입력해주세요</p>
          </div>
        </div>

        {/* 기사 정보 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-gold text-parchment-100 flex items-center justify-center font-bold text-sm">2</div>
            <h3 className="font-semibold text-lg">기사 정보</h3>
          </div>

          {/* 카테고리 선택 - 카드형 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              카테고리 <span className="text-accent-crimson">*</span>
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex flex-col items-center justify-center p-2 md:p-3 border-2 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? "border-accent-gold bg-accent-gold/10 shadow-sm"
                      : "border-parchment-300 hover:border-parchment-400 hover:bg-parchment-200"
                  }`}
                >
                  <span className="text-xl md:text-2xl mb-1">{submissionCategoryIcons[cat]}</span>
                  <span className="text-xs font-medium text-center leading-tight">{submissionCategoryLabels[cat]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 템플릿 필드 */}
          <div className="space-y-5">
            {selectedTemplate?.fields.map((field) => {
              const value = formData[field.name] || '';
              const error = touched[field.name] && getFieldError(field.name, value, field.required);

              return (
                <div key={field.name} data-field={field.name}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label} {field.required && <span className="text-accent-crimson">*</span>}
                  </label>

                  {field.type === "text" && (
                    <>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        onBlur={() => handleBlur(field.name)}
                        className={getInputStyle(field.name, field.required)}
                        placeholder={field.placeholder}
                        maxLength={field.name === 'title' ? MAX_TITLE_LENGTH : undefined}
                      />
                      {field.name === 'title' && (
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-ink-500">눈에 띄는 제목을 지어주세요</span>
                          <span className={`text-xs ${value.length > MAX_TITLE_LENGTH ? 'text-red-600' : 'text-ink-500'}`}>
                            {value.length}/{MAX_TITLE_LENGTH}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => handleFormChange(field.name, e.target.value)}
                      onBlur={() => handleBlur(field.name)}
                      className={getInputStyle(field.name, field.required)}
                    />
                  )}

                  {field.type === "datetime-local" && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDatePreset('now')}
                          className="px-4 py-2 text-sm border-2 border-parchment-400 bg-parchment-50 hover:bg-accent-gold hover:text-parchment-100 hover:border-accent-gold transition-colors rounded"
                        >
                          지금
                        </button>
                        <button
                          type="button"
                          onClick={() => setDatePreset('today')}
                          className="px-4 py-2 text-sm border-2 border-parchment-400 bg-parchment-50 hover:bg-accent-gold hover:text-parchment-100 hover:border-accent-gold transition-colors rounded"
                        >
                          오늘
                        </button>
                        <button
                          type="button"
                          onClick={() => setDatePreset('yesterday')}
                          className="px-4 py-2 text-sm border-2 border-parchment-400 bg-parchment-50 hover:bg-accent-gold hover:text-parchment-100 hover:border-accent-gold transition-colors rounded"
                        >
                          어제
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        value={value}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        onBlur={() => handleBlur(field.name)}
                        className={getInputStyle(field.name, field.required)}
                      />
                    </div>
                  )}

                  {field.type === "textarea" && (
                    <>
                      <textarea
                        value={value}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        onBlur={() => handleBlur(field.name)}
                        className={`${getInputStyle(field.name, field.required)} min-h-[120px] resize-y`}
                        placeholder={field.placeholder}
                        maxLength={field.name === 'content' ? MAX_CONTENT_LENGTH : undefined}
                      />
                      {field.name === 'content' && (
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-ink-500">구체적으로 작성할수록 좋은 기사가 됩니다</span>
                          <span className={`text-xs ${value.length > MAX_CONTENT_LENGTH ? 'text-red-600' : 'text-ink-500'}`}>
                            {value.length}/{MAX_CONTENT_LENGTH}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {field.type === "select" && field.options && (
                    <select
                      value={value}
                      onChange={(e) => handleFormChange(field.name, e.target.value)}
                      onBlur={() => handleBlur(field.name)}
                      className={getInputStyle(field.name, field.required)}
                    >
                      <option value="">선택해주세요</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 안내문 */}
        <div className="bg-parchment-200 border-2 border-parchment-400 p-4 rounded-lg">
          <p className="text-ink-600 text-sm">
            <strong>안내:</strong> 신청하신 기사는 관리자 검토 후 게시됩니다.
            검토 결과는 입력하신 이메일로 안내드립니다.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3 pt-2">
          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 text-lg font-semibold rounded-lg transition-all ${
              isFormValid
                ? "bg-accent-gold text-parchment-100 hover:bg-accent-crimson active:scale-[0.98]"
                : "bg-parchment-300 text-ink-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "신청 중..." : isFormValid ? "신청하기" : `필수 항목을 입력해주세요 (${completed}/${total})`}
          </button>

          {/* 임시 저장 삭제 버튼 */}
          {(email || Object.keys(formData).length > 0) && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="w-full py-2 text-sm text-ink-500 hover:text-accent-crimson transition-colors"
            >
              작성 내용 초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

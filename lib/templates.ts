import { Template, SubmissionCategory } from "./types";

// 카테고리별 단일 공통 템플릿
export const templates: Template[] = [
  {
    id: "finance",
    name: "재테크",
    category: "finance",
    description: "재테크, 투자, 경제적 성취를 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "드디어 1억 모았다!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "관련 기관/플랫폼", type: "text", placeholder: "OO증권 / OO은행" },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 재테크 성과가 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "소감이나 팁을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[재테크 특보]** 경제적 성취 소식을 전합니다!

**[eventDate]**, 뜻깊은 재테크 성과가 있었습니다.

[location]에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 💰✨`,
  },
  {
    id: "life",
    name: "라이프",
    category: "life",
    description: "일상의 특별한 순간, 라이프스타일 소식을 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "오늘 있었던 특별한 일!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "장소", type: "text", placeholder: "서울 강남구" },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 일이 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "소감이나 하고 싶은 말을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[라이프 특보]** 일상의 특별한 소식을 전합니다!

**[eventDate]**, 특별한 일이 있었습니다.

[location]에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 📢✨`,
  },
  {
    id: "culture",
    name: "취미/문화",
    category: "culture",
    description: "취미 활동, 문화생활, 예술 관련 소식을 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "드디어 기타 연주 성공!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "장소/활동", type: "text", placeholder: "OO문화센터 / 기타 연주" },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 취미/문화 활동이 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "소감이나 하고 싶은 말을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[문화 특보]** 취미와 문화생활 소식을 전합니다!

**[eventDate]**, 의미 있는 문화 활동이 있었습니다.

[location]에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 🎨✨`,
  },
  {
    id: "fitness",
    name: "운동/건강",
    category: "fitness",
    description: "운동, 건강, 다이어트 관련 성취를 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "마라톤 완주 성공!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "장소/운동 종목", type: "text", placeholder: "서울마라톤 / 헬스장" },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 운동/건강 성취가 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "소감이나 하고 싶은 말을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[스포츠 특보]** 운동과 건강 관련 소식을 전합니다!

**[eventDate]**, 값진 운동 성취가 있었습니다.

[location]에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 🏃✨`,
  },
  {
    id: "people",
    name: "관계/피플",
    category: "people",
    description: "결혼, 생일, 기념일, 소중한 사람들과의 순간을 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "드디어 결혼합니다!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "장소", type: "text", placeholder: "서울 OO웨딩홀" },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 일이 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "축하 메시지나 소감을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[피플 특보]** 따뜻한 소식을 전합니다!

**[eventDate]**, 특별한 순간이 찾아왔습니다.

[location]에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 💕✨`,
  },
  {
    id: "travel",
    name: "여행",
    category: "travel",
    description: "여행, 나들이, 새로운 장소 탐험 소식을 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "제주도 여행 다녀왔습니다!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "여행지", type: "text", placeholder: "제주도 / 파리", required: true },
      { name: "content", label: "내용", type: "textarea", placeholder: "여행에서 어떤 일이 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "여행 소감을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[여행 특보]** 설렘 가득한 여행 소식을 전합니다!

**[eventDate]**, **[location]**(으)로 특별한 여행을 다녀왔습니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** ✈️✨`,
  },
  {
    id: "tech",
    name: "테크/공부",
    category: "tech",
    description: "공부, 자격증, 기술 습득, IT 관련 성취를 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "정보처리기사 합격!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "기관/플랫폼", type: "text", placeholder: "한국산업인력공단 / 인프런" },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 공부/기술 성취가 있었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "소감이나 공부 팁을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[테크 특보]** 공부와 기술 관련 소식을 전합니다!

**[eventDate]**, 값진 성취가 있었습니다.

[location]에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 💻✨`,
  },
  {
    id: "food",
    name: "맛집/음식",
    category: "food",
    description: "맛집 발견, 요리, 음식 관련 소식을 기사로 만들어보세요",
    fields: [
      { name: "title", label: "제목", type: "text", placeholder: "인생 맛집 발견!", required: true },
      { name: "eventDate", label: "날짜", type: "datetime-local", required: true },
      { name: "location", label: "맛집/장소", type: "text", placeholder: "서울 강남 OO식당", required: true },
      { name: "content", label: "내용", type: "textarea", placeholder: "어떤 맛집/음식이었는지 적어주세요", required: true },
      { name: "message", label: "하고 싶은 말", type: "textarea", placeholder: "추천 메뉴나 팁을 적어주세요" },
    ],
    titleTemplate: "[title]",
    contentTemplate: `**[맛집 특보]** 미식 소식을 전합니다!

**[eventDate]**, 특별한 맛집을 발견했습니다.

**[location]**에서의 이야기입니다.

[content]

[message]

**Daily TMI Post가 함께합니다!** 🍽️✨`,
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

// 카테고리에 해당하는 단일 템플릿 반환
export function getTemplateByCategory(category: SubmissionCategory): Template | undefined {
  return templates.find((t) => t.category === category);
}

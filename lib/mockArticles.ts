import { PublishedArticle, SubmissionCategory } from "./types";

// 샘플 게시된 기사 데이터
export const mockPublishedArticles: PublishedArticle[] = [
  {
    id: "1",
    submissionId: "sub-1",
    slug: "kim-minjun-wedding-2026",
    title: "김민준 씨, 백년가약의 주인공이 되다!",
    excerpt: "지난 3월 15일, 김민준 씨가 이수연 씨와 함께 영원한 사랑을 약속했습니다.",
    content: `**[속보]** 본지가 입수한 정보에 따르면, **김민준** 씨가 **이수연** 씨와 함께 영원한 사랑을 약속했습니다!

지난 **2026년 3월 15일**, **서울 그랜드 웨딩홀**에서 열린 결혼식에서 두 사람은 하객들의 축복 속에 부부의 연을 맺었습니다.

신랑 신부는 서로를 바라보며 눈물을 글썽이는 감동적인 순간을 연출했으며, 참석한 하객들 모두가 두 사람의 앞날을 진심으로 축복했습니다.

"드디어 제 인생의 동반자를 만났습니다. 평생 행복하게 살겠습니다!"

본지는 두 사람의 앞날에 무한한 행복과 사랑이 가득하기를 진심으로 기원합니다.

**축! 결혼을 축하드립니다!** 🎊💒`,
    category: "people",
    protagonistName: "김민준",
    imageUrl: "/images/wedding.jpg",
    viewCount: 128,
    createdAt: "2026-03-15",
  },
  {
    id: "2",
    submissionId: "sub-2",
    slug: "park-jihye-promotion-2026",
    title: "박지혜 씨, 팀장 승진! 승승장구의 아이콘!",
    excerpt: "삼성전자에서 또 하나의 전설이 탄생했습니다!",
    content: `**[특종]** **삼성전자**에서 또 하나의 전설이 탄생했습니다!

**박지혜** 씨가 **팀장**(으)로 승진하며, 조직 내에서 그 능력을 인정받았습니다.

관계자에 따르면, 박지혜 씨는 평소 탁월한 업무 능력과 리더십으로 동료들 사이에서도 존경받는 인물이었다고 합니다.

"열심히 노력한 결과라고 생각합니다. 앞으로도 더 열심히 하겠습니다!"

본지는 박지혜 씨의 앞으로의 행보에도 승승장구만 가득하기를 응원합니다!

**축! 승진을 축하드립니다!** 🎉📈`,
    category: "life",
    protagonistName: "박지혜",
    viewCount: 89,
    createdAt: "2026-03-20",
  },
  {
    id: "3",
    submissionId: "sub-3",
    slug: "lee-seungho-pass-2026",
    title: "속보! 이승호 씨, 서울대학교 당당히 합격!",
    excerpt: "드디어 그날이 왔습니다! 이승호 씨가 서울대학교에 당당히 합격했습니다!",
    content: `**[긴급속보]** 드디어 그날이 왔습니다!

**이승호** 씨가 **서울대학교 컴퓨터공학과** 에 당당히 합격하며 영광의 주인공이 되었습니다!

3년 간의 피나는 노력 끝에 얻어낸 값진 결과입니다. 포기하지 않고 끝까지 도전한 이승호 씨에게 박수를 보냅니다.

"부모님께 감사드립니다. 열심히 공부해서 좋은 결과를 낼 수 있었습니다."

본지는 이승호 씨의 앞날에 무궁한 발전이 있기를 진심으로 응원합니다!

**축! 합격을 축하드립니다!** 🎓✨`,
    category: "tech",
    protagonistName: "이승호",
    viewCount: 256,
    createdAt: "2026-03-18",
  },
  {
    id: "4",
    submissionId: "sub-4",
    slug: "choi-yuna-birthday-2026",
    title: "오늘의 주인공! 최유나 씨, 생일 축하합니다!",
    excerpt: "3월 22일, 최유나 씨가 또 한 살의 지혜와 경험을 더하는 뜻깊은 날을 맞이했습니다.",
    content: `**[축하보도]** 오늘은 특별한 날입니다!

**2026년 3월 22일**, **최유나** 씨가 또 한 살의 지혜와 경험을 더하는 뜻깊은 날을 맞이했습니다.

30세가 된 최유나 씨는 주변 사람들의 축하 속에 행복한 하루를 보내고 있습니다.

"서른 살이 되었네요! 앞으로도 건강하고 행복하게 살고 싶습니다."

본지는 최유나 씨의 앞으로의 1년이 건강, 행복, 성공으로 가득하기를 진심으로 기원합니다!

**생일 축하합니다!** 🎂🎈`,
    category: "people",
    protagonistName: "최유나",
    viewCount: 67,
    createdAt: "2026-03-22",
  },
  {
    id: "5",
    submissionId: "sub-5",
    slug: "jung-dongwook-award-2026",
    title: "정동욱 씨, 대한민국 인재상 수상! 영예의 주인공!",
    excerpt: "정동욱 씨가 교육부에서 수여하는 대한민국 인재상을 수상했습니다!",
    content: `**[수상 특보]** 영예로운 수상 소식을 전합니다!

**정동욱** 씨가 **교육부**에서 수여하는 **대한민국 인재상**을(를) 수상했습니다!

2026년 3월 10일, 시상식에서 정동욱 씨는 그동안의 노력과 성과를 인정받아 영광의 상을 받았습니다.

"이 상을 받게 되어 정말 영광입니다. 앞으로도 사회에 기여하는 인재가 되겠습니다."

본지는 정동욱 씨의 뛰어난 성과를 축하하며, 앞으로도 더 큰 영광이 함께하기를 기원합니다!

**축! 수상을 축하드립니다!** 🏆🎖️`,
    category: "life",
    protagonistName: "정동욱",
    viewCount: 143,
    createdAt: "2026-03-10",
  },
  {
    id: "6",
    submissionId: "sub-6",
    slug: "han-soyeon-certificate-2026",
    title: "한소연 씨, 공인회계사 취득! 전문가 등극!",
    excerpt: "한소연 씨가 금융감독원에서 발급하는 공인회계사 자격을 취득했습니다!",
    content: `**[자격 취득 보도]** 또 한 명의 전문가가 탄생했습니다!

**한소연** 씨가 **금융감독원**에서 발급하는 **공인회계사** 자격을 취득했습니다!

꾸준한 노력과 철저한 준비 끝에 얻어낸 값진 결과입니다. 한소연 씨는 이제 공인된 전문가로서 새로운 도약을 준비하고 있습니다.

"5년간의 노력이 드디어 결실을 맺었습니다. 감사합니다!"

본지는 한소연 씨의 전문성을 축하하며, 앞으로의 활약을 기대합니다!

**축! 자격 취득을 축하드립니다!** 📜✨`,
    category: "tech",
    protagonistName: "한소연",
    viewCount: 98,
    createdAt: "2026-03-05",
  },
  {
    id: "7",
    submissionId: "sub-7",
    slug: "kim-jihoon-travel-2026",
    title: "김지훈 씨, 유럽 한 달 살기 완료!",
    excerpt: "김지훈 씨가 파리에서 한 달간의 특별한 여행을 마치고 돌아왔습니다!",
    content: `**[여행 특보]** 설렘 가득한 여행 소식을 전합니다!

**2026년 2월 28일**, **김지훈** 씨가 **프랑스 파리**(으)로 특별한 여행을 다녀왔습니다.

한 달간 파리에서 생활하며 에펠탑, 루브르 박물관, 몽마르트 언덕 등 파리의 명소를 모두 둘러봤습니다. 현지 카페에서 커피를 마시며 글을 쓰는 것이 가장 행복했다고 합니다.

"언젠가 꼭 해보고 싶었던 유럽 한 달 살기를 드디어 실현했습니다. 인생 최고의 경험이었어요!"

본지는 김지훈 씨의 다음 여행도 행복으로 가득하기를 응원합니다!

**Daily TMI Post가 함께합니다!** ✈️✨`,
    category: "travel",
    protagonistName: "김지훈",
    viewCount: 203,
    createdAt: "2026-02-28",
  },
  {
    id: "8",
    submissionId: "sub-8",
    slug: "lee-minah-marathon-2026",
    title: "이민아 씨, 첫 마라톤 완주 성공!",
    excerpt: "이민아 씨가 서울마라톤 풀코스를 완주하며 새로운 도전을 성공시켰습니다!",
    content: `**[스포츠 특보]** 운동과 건강 관련 소식을 전합니다!

**2026년 3월 17일**, **이민아** 씨에게 값진 운동 성취가 있었습니다.

**서울마라톤**에서 풀코스 42.195km를 4시간 32분만에 완주했습니다. 6개월간의 훈련 끝에 이뤄낸 값진 성과입니다.

"처음엔 5km도 힘들었는데, 포기하지 않고 꾸준히 달린 결과 마라톤을 완주할 수 있었습니다. 다음 목표는 4시간 안에 들어오는 것!"

본지는 이민아 씨의 건강한 도전을 응원합니다!

**Daily TMI Post가 함께합니다!** 🏃✨`,
    category: "fitness",
    protagonistName: "이민아",
    viewCount: 156,
    createdAt: "2026-03-17",
  },
];

export function getAllPublishedArticles(): PublishedArticle[] {
  return mockPublishedArticles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPublishedArticleBySlug(slug: string): PublishedArticle | undefined {
  return mockPublishedArticles.find((article) => article.slug === slug);
}

export function getPublishedArticlesByCategory(category: SubmissionCategory): PublishedArticle[] {
  return mockPublishedArticles
    .filter((article) => article.category === category)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getFeaturedArticles(): PublishedArticle[] {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 최근 7일 내 기사 중 인기순 정렬
  const recentArticles = mockPublishedArticles
    .filter((article) => new Date(article.createdAt) >= sevenDaysAgo)
    .sort((a, b) => b.viewCount - a.viewCount);

  // 7일 내 기사가 부족하면 전체에서 인기순으로 채움
  if (recentArticles.length < 5) {
    const allSorted = mockPublishedArticles
      .sort((a, b) => b.viewCount - a.viewCount);
    return allSorted.slice(0, 5);
  }

  return recentArticles.slice(0, 5);
}

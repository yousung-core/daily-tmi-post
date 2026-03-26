import { Article, Category } from "./types";

export const articles: Article[] = [
  {
    id: "1",
    slug: "ministry-announces-new-muggle-protection-act",
    title: "마법부, 새로운 머글 보호법 발표",
    excerpt:
      "마법부는 오늘 머글과 마법사 사회의 조화로운 공존을 위한 새로운 보호법안을 발표했습니다.",
    content: `
마법부 장관 킹슬리 섀클볼트는 오늘 아침 기자회견을 통해 역사적인 '머글 보호 및 공존 촉진법'을 발표했습니다.

"우리는 더 이상 머글 세계와 동떨어져 살 수 없습니다," 섀클볼트 장관은 말했습니다. "이 법안은 양쪽 세계가 서로를 존중하며 평화롭게 공존할 수 있는 기반을 마련할 것입니다."

새로운 법안의 주요 내용은 다음과 같습니다:

**주요 조항**
1. 머글 문화 연구부 신설
2. 혼혈 가정 지원 프로그램 확대
3. 머글 기술과 마법의 융합 연구 지원
4. 비상시 머글 보호 프로토콜 강화

헤르미온느 그레인저 마법법집행부장은 "이 법안은 수십 년간의 노력의 결실"이라며 환영의 뜻을 밝혔습니다.

한편, 일부 순수혈통 가문에서는 이 법안에 대해 우려의 목소리를 내고 있지만, 마법부는 "시대의 변화에 발맞춘 필연적인 조치"라고 강조했습니다.
    `.trim(),
    category: "ministry",
    author: "리타 스키터",
    imageUrl: "/images/ministry.jpg",
    publishedAt: "2026-03-23",
    featured: true,
  },
  {
    id: "2",
    slug: "puddlemere-united-wins-championship",
    title: "퍼들미어 유나이티드, 리그 우승 차지",
    excerpt:
      "치열한 결승전 끝에 퍼들미어 유나이티드가 처드리 캐논스를 꺾고 우승컵을 들어올렸습니다.",
    content: `
어제 저녁 열린 브리티시 앤 아이리시 퀴디치 리그 결승전에서 퍼들미어 유나이티드가 처드리 캐논스를 450-310으로 꺾고 우승을 차지했습니다.

경기는 처음부터 치열했습니다. 캐논스의 새로운 수색꾼 알렉산더 톰슨이 초반부터 적극적으로 스니치를 추격했지만, 유나이티드의 베테랑 수색꾼 올리비아 우드가 한 수 위였습니다.

**경기 하이라이트**
- 1쿼터: 유나이티드 80-60 리드
- 2쿼터: 캐논스 역전 성공 (120-130)
- 3쿼터: 유나이티드 재역전 (240-200)
- 4쿼터: 스니치 포획으로 경기 종료

"팬들 덕분입니다," 우승 트로피를 들어올리며 유나이티드 주장이 말했습니다. "내년에도 이 자리에 서겠습니다."

이번 우승으로 퍼들미어 유나이티드는 통산 23번째 리그 우승을 기록하게 되었습니다.
    `.trim(),
    category: "quidditch",
    author: "지니 위즐리",
    imageUrl: "/images/quidditch.jpg",
    publishedAt: "2026-03-22",
    featured: true,
  },
  {
    id: "3",
    slug: "hogwarts-introduces-new-curriculum",
    title: "호그와트, 새 학기 커리큘럼 대폭 개편",
    excerpt:
      "미네르바 맥고나걸 교장이 현대 마법 사회에 맞춘 새로운 교육과정을 발표했습니다.",
    content: `
호그와트 마법학교가 다가오는 새 학기부터 대대적인 커리큘럼 개편을 단행합니다.

미네르바 맥고나걸 교장은 "변화하는 시대에 발맞춰 학생들에게 더 실용적이고 현대적인 마법 교육을 제공하고자 합니다"라고 밝혔습니다.

**새로 추가되는 과목들**
1. **마법 기술 융합학** - 머글 기술과 마법의 접점 연구
2. **국제 마법 관계학** - 각국 마법 사회와의 외교 및 협력
3. **마법 창업학** - 다이애건 앨리에서 성공적인 사업 운영법
4. **디지털 은신술** - 소셜 미디어 시대의 마법 사회 비밀 유지

네빌 롱바텀 약초학 교수는 "학생들의 반응이 매우 긍정적"이라며 "특히 마법 기술 융합학에 대한 관심이 높다"고 전했습니다.

일부 학부모들은 전통적인 마법 교육의 약화를 우려하고 있지만, 맥고나걸 교장은 "기존 핵심 과목은 그대로 유지된다"고 강조했습니다.
    `.trim(),
    category: "hogwarts",
    author: "루나 러브굿",
    imageUrl: "/images/hogwarts.jpg",
    publishedAt: "2026-03-21",
  },
  {
    id: "4",
    slug: "dark-artifact-discovered-in-knockturn-alley",
    title: "녹턴 앨리에서 위험한 어둠의 유물 발견",
    excerpt:
      "어둠의 마법 방지국 요원들이 불법 거래되던 저주받은 목걸이를 압수했습니다.",
    content: `
어둠의 마법 방지국(DMLE) 요원들이 어제 밤 녹턴 앨리의 한 골동품 상점에서 대규모 단속을 벌여 여러 점의 위험한 어둠의 유물을 압수했습니다.

압수된 물품 중에는 착용자를 저주하는 오팔 목걸이, 만지는 모든 것을 돌로 바꾸는 장갑, 그리고 정체불명의 호크룩스로 의심되는 물건도 포함되어 있습니다.

**압수된 주요 유물**
- 오팔 저주 목걸이 (1등급 위험물)
- 메두사의 장갑 (2등급 위험물)
- 정체불명 어둠의 유물 3점

"이러한 물건들이 일반인들 손에 들어갔다면 끔찍한 결과를 초래했을 것입니다," 해리 포터 마법법집행부 수석 오러가 말했습니다.

상점 주인 모르드레드 버크는 현재 아즈카반에 수감되어 심문을 받고 있습니다. 마법부는 추가적인 밀수 경로를 추적 중이라고 밝혔습니다.
    `.trim(),
    category: "dark-arts",
    author: "바나비 리",
    imageUrl: "/images/dark-arts.jpg",
    publishedAt: "2026-03-20",
  },
  {
    id: "5",
    slug: "newt-scamander-discovers-new-creature",
    title: "뉴트 스캐맨더, 아마존에서 새로운 마법 생물 발견",
    excerpt:
      "전설적인 마법동물학자가 지금까지 알려지지 않은 신비로운 생물을 발견했습니다.",
    content: `
마법동물학의 전설 뉴트 스캐맨더(129세)가 아마존 열대우림 탐사 중 새로운 마법 생물을 발견했다고 마법부 마법생물규제관리국이 발표했습니다.

'아마존 달빛나비(Amazonian Moonwing)'로 명명된 이 생물은 보름달 밤에만 나타나며, 날개에서 치유의 분진을 내뿜는 것으로 알려졌습니다.

**아마존 달빛나비 특징**
- 크기: 날개 폭 약 30cm
- 서식지: 아마존 깊은 숲
- 특성: 보름달 밤에만 활동, 치유 분진 생성
- 위험도: 무해 (XXXXX 분류 예정)

"평생 마법 생물을 연구해왔지만, 이렇게 아름다운 생물은 처음 봅니다," 스캐맨더 씨는 말했습니다. "이 발견은 자연의 마법이 여전히 우리에게 놀라움을 선사할 수 있음을 보여줍니다."

마법생물규제관리국은 해당 종의 보호 조치를 논의 중이며, '신비한 동물 사전' 개정판에 이 생물을 추가할 예정입니다.
    `.trim(),
    category: "creatures",
    author: "롤프 스캐맨더",
    imageUrl: "/images/creatures.jpg",
    publishedAt: "2026-03-19",
  },
  {
    id: "6",
    slug: "opinion-future-of-wizarding-world",
    title: "[오피니언] 마법 세계의 미래, 우리 손에 달렸다",
    excerpt:
      "변화하는 시대에 마법 사회가 나아가야 할 방향에 대한 고찰.",
    content: `
*이 글은 기고자의 개인적인 의견입니다.*

볼드모트 전쟁이 끝난 지 어느덧 30년이 지났습니다. 그동안 마법 세계는 놀라운 발전을 이루었지만, 동시에 새로운 도전에 직면해 있습니다.

**우리가 직면한 과제들**

첫째, 머글 세계와의 관계입니다. 기술의 발전으로 비밀 유지가 점점 어려워지고 있습니다. 드론, 위성, 소셜 미디어 시대에 마법 사회의 존재를 숨기는 것이 과연 지속 가능할까요?

둘째, 순수혈통주의의 잔재입니다. 공식적으로는 사라졌다고 하지만, 여전히 사회 곳곳에 차별의 그림자가 남아 있습니다.

셋째, 교육의 현대화입니다. 호그와트의 커리큘럼 개편은 환영할 만하지만, 더 근본적인 변화가 필요합니다.

**나아가야 할 방향**

저는 마법 사회가 과거의 영광에 안주하지 말고, 적극적으로 변화를 수용해야 한다고 생각합니다. 물론 전통을 지키는 것도 중요합니다. 하지만 전통이 발전의 걸림돌이 되어서는 안 됩니다.

해리 포터 세대가 보여준 용기와 희생 정신을 기억합시다. 그들은 두려움에 맞서 새로운 세상을 만들었습니다. 이제 그 세상을 더 나은 곳으로 만드는 것은 우리의 몫입니다.

*기고자: 퍼시 위즐리, 전 마법부 국제마법협력부 차관*
    `.trim(),
    category: "opinion",
    author: "퍼시 위즐리",
    publishedAt: "2026-03-18",
  },
];

export function getAllArticles(): Article[] {
  return articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: Category): Article[] {
  return articles
    .filter((article) => article.category === category)
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getFeaturedArticles(): Article[] {
  return articles.filter((article) => article.featured);
}

export function getAllCategories(): Category[] {
  return ["ministry", "quidditch", "hogwarts", "dark-arts", "creatures", "opinion"];
}

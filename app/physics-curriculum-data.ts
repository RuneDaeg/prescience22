import {
  CURRICULUM_COURSES,
  CURRICULUM_SOURCE,
  type CurriculumCourse,
} from "./curriculum-data";

export { CURRICULUM_SOURCE };

const byName = (name: string) => {
  const course = CURRICULUM_COURSES.find((item) => item.name === name);
  if (!course) throw new Error(`Missing curriculum course: ${name}`);
  return course;
};

const middlePhysicsSections = [
  {
    part: "운동과 에너지",
    keywords: [
      "운동", "운동 에너지", "위치 에너지", "역학적 에너지", "역학적 에너지 전환", "역학적 에너지 보존",
    ],
  },
  {
    part: "전기와 자기",
    keywords: [
      "자석", "대전", "전기력", "정전기 유도", "전류", "전압", "전기 회로", "옴의 법칙",
      "전지의 직렬연결", "전지의 병렬연결", "저항의 직렬연결", "저항의 병렬연결", "전기 에너지",
      "자기력", "자기장", "전자석",
    ],
  },
  {
    part: "열",
    keywords: [
      "열", "온도", "열평형", "열의 이동", "전도", "대류", "복사", "비열", "단열", "열팽창",
    ],
  },
  {
    part: "빛·소리·파동",
    keywords: [
      "빛의 직진", "반사", "굴절", "거울", "렌즈", "상", "물체를 보는 원리", "오목렌즈", "볼록렌즈",
      "오목거울", "볼록거울", "빛의 합성", "물체의 색이 다른 이유", "소리", "소리의 발생", "소리의 전달",
      "소리의 세기", "소리의 높낮이", "파동", "파동의 발생", "파동의 전달", "진폭", "진동수", "파장",
      "렌즈의 이용",
    ],
  },
] as const;

const integratedOneSections = [
  {
    part: "시간·길이와 측정",
    keywords: [
      "시간", "길이", "질량", "전류", "온도", "물질량(몰)", "광도", "측정", "길이 측정", "시간 측정",
      "측정 방법", "측정 규모", "물리량", "기본량", "단위", "SI 단위계", "어림", "측정 표준",
    ],
  },
  {
    part: "정보와 디지털 변환",
    keywords: [
      "측정과 분석", "정보 산출", "아날로그 정보", "디지털 정보", "정보의 디지털 변환", "정보 통신",
    ],
  },
  {
    part: "물질의 전기적 성질",
    keywords: [
      "도체", "부도체", "반도체", "도체의 성질을 이용한 소재", "부도체의 성질을 이용한 소재",
      "반도체의 성질을 이용한 소재",
    ],
  },
  {
    part: "중력과 운동",
    keywords: [
      "중력", "중력에 의한 운동", "지구 표면에서의 운동", "지구 주위의 운동", "가속도", "관성",
      "뉴턴 운동 제1법칙",
    ],
  },
  {
    part: "충격량과 운동량",
    keywords: [
      "충격량", "운동량", "충격량과 운동량의 관계", "충격력", "충격 완화장치", "충격량과 스포츠",
    ],
  },
] as const;
const integratedTwoSections = [
  {
    part: "태양의 핵융합과 에너지 흐름",
    keywords: [
      "태양", "수소 핵융합", "핵융합 반응", "질량-에너지 동등성", "질량 결손", "핵융합 에너지",
      "태양 에너지", "에너지 흐름", "에너지 전환", "에너지의 형태",
    ],
  },
  {
    part: "발전과 에너지 전환",
    keywords: [
      "발전", "발전기", "발전기의 원리", "전자기 유도", "운동 에너지", "전기 에너지",
      "운동 에너지의 전기 에너지 전환", "에너지원", "화석 연료", "핵에너지", "화력 발전", "원자력 발전",
      "발전소",
    ],
  },
  {
    part: "에너지 효율과 신재생에너지",
    keywords: [
      "에너지 효율", "지속가능한 발전", "지구 환경 문제", "신재생에너지", "재생에너지", "신재생에너지 기술",
    ],
  },
] as const;

const experimentNames = new Set([
  "힘의 평형", "돌림힘의 평형", "속도", "속력", "가속도", "등가속도 직선 운동", "운동량 보존 법칙",
  "충격량", "일-에너지 정리", "역학적 에너지 보존 법칙", "열역학 제1법칙", "열효율", "전기장", "전위차",
  "옴의 법칙", "저항의 직렬연결", "저항의 병렬연결", "소비 전력", "축전기의 에너지 저장", "전류의 자기 작용",
  "전자기 유도", "중첩", "간섭", "굴절", "굴절률", "초점거리", "선스펙트럼", "빛의 방출", "빛의 흡수",
  "반도체", "다이오드",
]);

const official = (course: CurriculumCourse, names?: Set<string>): CurriculumCourse => ({
  ...course,
  topics: names ? course.topics.filter((topic) => names.has(topic.name)) : course.topics,
});

const derived = (
  source: CurriculumCourse,
  target: CurriculumCourse,
  names: Set<string> | null,
  sourceLabel: string,
): CurriculumCourse => ({
  ...target,
  topics: source.topics
    .filter((topic) => names === null || names.has(topic.name))
    .map((topic) => ({ ...topic, sourceLabel })),
});

const physics = byName("물리학");
const middleScience = byName("과학");
const middlePhysics: CurriculumCourse = {
  ...middleScience,
  topics: middlePhysicsSections.flatMap((section) => section.keywords.map((name) => ({
    name,
    domain: `중학교 과학 · ${section.part}`,
    sourceLabel: "검수 확정 · 2026-08-06",
  }))),
};
const integratedScienceOneSource = byName("통합과학1");
const integratedScienceOne: CurriculumCourse = {
  ...integratedScienceOneSource,
  topics: integratedOneSections.flatMap((section) => section.keywords.map((name) => ({
    name,
    domain: `통합과학1 · ${section.part}`,
    sourceLabel: "검수 확정 · 2026-08-06",
  }))),
};
const integratedScienceTwoSource = byName("통합과학2");
const integratedScienceTwo: CurriculumCourse = {
  ...integratedScienceTwoSource,
  topics: integratedTwoSections.flatMap((section) => section.keywords.map((name) => ({
    name,
    domain: `통합과학2 · ${section.part}`,
    sourceLabel: "검수 확정 · 2026-08-06",
  }))),
};

export const PHYSICS_COURSES: CurriculumCourse[] = [
  middlePhysics,
  integratedScienceOne,
  integratedScienceTwo,
  official(physics),
  official(byName("역학과 에너지")),
  official(byName("전자기와 양자")),
  derived(physics, byName("고급 물리학"), null, "물리학 검수 목록 기반 · 고급 물리학"),
  derived(physics, byName("물리학 실험"), experimentNames, "물리학 검수 목록 기반 · 물리학 실험"),
];

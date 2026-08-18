export type QuestionOption = {
  id: string;
  text: string;
  conception: string;
  kind: "scientific" | "misconception" | "partial";
};

export type DiagnosticQuestion = {
  id: string;
  standard: string;
  domain: "변화와 다양성" | "환경과 에너지" | "과학과 미래 사회";
  prompt: string;
  context?: string;
  options: QuestionOption[];
};

export const QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "geo-change", standard: "10통과2-01-01", domain: "변화와 다양성",
    prompt: "과거 지구의 기후가 크게 변했을 때 생물다양성은 어떻게 되었을까요?",
    options: [
      { id: "a", text: "환경 변화와 무관하게 일정하게 유지됐다.", conception: "생물다양성은 환경과 무관함", kind: "misconception" },
      { id: "b", text: "일부 생물은 사라지고 다른 생물이 번성하며 달라졌다.", conception: "환경 변화에 따른 생물다양성 변동", kind: "scientific" },
      { id: "c", text: "생물은 언제나 단순한 것에서 복잡한 것으로만 늘었다.", conception: "진화는 복잡성을 향한 직선 과정", kind: "misconception" },
      { id: "d", text: "기후가 추워질 때에만 생물종이 사라졌다.", conception: "멸종은 한 종류의 기후 변화에서만 발생", kind: "partial" },
    ],
  },
  {
    id: "evolution", standard: "10통과2-01-02", domain: "변화와 다양성",
    prompt: "살충제를 사용한 뒤 살아남는 해충이 많아진 까닭으로 가장 가까운 생각은?",
    options: [
      { id: "a", text: "해충이 살충제를 견디려고 스스로 몸을 바꾸었다.", conception: "필요에 의해 변이가 발생함", kind: "misconception" },
      { id: "b", text: "살충제가 모든 해충에게 같은 저항성을 만들어 주었다.", conception: "환경이 동일한 변이를 직접 유도함", kind: "misconception" },
      { id: "c", text: "원래 있던 변이 중 저항성 개체가 더 많이 살아남아 번식했다.", conception: "변이와 자연선택", kind: "scientific" },
      { id: "d", text: "살충제를 오래 쓰면 해충의 의지가 강해진다.", conception: "생물의 의지로 진화함", kind: "misconception" },
    ],
  },
  {
    id: "redox", standard: "10통과2-01-03", domain: "변화와 다양성",
    prompt: "광합성, 연료의 연소, 철광석에서 철을 얻는 과정의 공통점은 무엇일까요?",
    options: [
      { id: "a", text: "모두 산소가 반드시 직접 결합하는 반응이다.", conception: "산화는 산소 결합만을 뜻함", kind: "partial" },
      { id: "b", text: "전자 이동과 관련된 산화와 환원이 함께 일어난다.", conception: "산화·환원의 동시성", kind: "scientific" },
      { id: "c", text: "모두 물질의 상태만 변하는 물리 변화이다.", conception: "화학 변화를 상태 변화로 이해함", kind: "misconception" },
      { id: "d", text: "에너지를 방출하는 반응만 포함한다.", conception: "산화·환원은 항상 발열 반응", kind: "misconception" },
    ],
  },
  {
    id: "acid-base", standard: "10통과2-01-04", domain: "변화와 다양성",
    prompt: "같은 양의 묽은 염산과 수산화 나트륨 수용액을 알맞은 비율로 섞으면?",
    options: [
      { id: "a", text: "산과 염기의 성질이 모두 더 강해진다.", conception: "산·염기 혼합 시 성질이 강화됨", kind: "misconception" },
      { id: "b", text: "반드시 온도가 내려간다.", conception: "중화 반응은 흡열 반응", kind: "misconception" },
      { id: "c", text: "중화되어 물과 염이 생성되고 열이 날 수 있다.", conception: "중화 반응", kind: "scientific" },
      { id: "d", text: "두 용액이 섞이기만 하고 새로운 물질은 생기지 않는다.", conception: "중화를 단순 혼합으로 이해함", kind: "misconception" },
    ],
  },
  {
    id: "energy-change", standard: "10통과2-01-05", domain: "변화와 다양성",
    prompt: "차가운 찜질팩을 꺾었더니 주변이 차가워졌습니다. 가장 알맞은 설명은?",
    options: [
      { id: "a", text: "팩 속 반응이 주변의 에너지를 흡수했다.", conception: "흡열 현상", kind: "scientific" },
      { id: "b", text: "팩 속에서 차가움이라는 물질이 나왔다.", conception: "차가움을 물질로 이해함", kind: "misconception" },
      { id: "c", text: "에너지가 완전히 사라졌다.", conception: "에너지 소멸", kind: "misconception" },
      { id: "d", text: "온도 변화는 반응과 아무 관련이 없다.", conception: "온도 변화와 에너지 출입을 분리함", kind: "misconception" },
    ],
  },
  {
    id: "ecosystem", standard: "10통과2-02-01", domain: "환경과 에너지",
    prompt: "생태계에서 햇빛, 물, 토양은 생물과 어떤 관계일까요?",
    options: [
      { id: "a", text: "생물이 아니므로 생태계의 구성요소가 아니다.", conception: "생태계를 생물만으로 이해함", kind: "misconception" },
      { id: "b", text: "생물에게만 영향을 주고 생물의 영향은 받지 않는다.", conception: "생물·환경 상호작용을 단방향으로 이해함", kind: "partial" },
      { id: "c", text: "비생물 요소로서 생물과 서로 영향을 주고받는다.", conception: "생물·비생물 요소의 상호작용", kind: "scientific" },
      { id: "d", text: "오직 식물에게만 영향을 준다.", conception: "비생물 요소는 생산자에게만 영향", kind: "misconception" },
    ],
  },
  {
    id: "food-web", standard: "10통과2-02-02", domain: "환경과 에너지",
    prompt: "초식동물이 갑자기 크게 줄어들면 생태계에는 어떤 일이 생길까요?",
    options: [
      { id: "a", text: "그 종만 줄고 다른 생물은 영향을 받지 않는다.", conception: "먹이 관계를 개별 종 관계로 이해함", kind: "misconception" },
      { id: "b", text: "먹이 관계를 따라 여러 개체군의 크기가 연쇄적으로 달라질 수 있다.", conception: "먹이그물과 생태계 평형", kind: "scientific" },
      { id: "c", text: "포식자는 먹이가 줄어도 항상 같은 수를 유지한다.", conception: "포식자 수는 먹이량과 무관함", kind: "misconception" },
      { id: "d", text: "식물은 초식동물이 줄면 반드시 모두 사라진다.", conception: "개체군 변화 결과를 단선적으로 예측함", kind: "misconception" },
    ],
  },
  {
    id: "climate", standard: "10통과2-02-03", domain: "환경과 에너지",
    prompt: "온실효과와 지구온난화에 대한 설명으로 가장 가까운 생각은?",
    options: [
      { id: "a", text: "온실효과는 원래 전혀 없으며 인간이 새로 만들었다.", conception: "자연 온실효과와 강화된 온실효과를 구분하지 못함", kind: "misconception" },
      { id: "b", text: "오존층 구멍으로 태양열이 들어와 온난화가 생긴다.", conception: "오존층 파괴를 지구온난화의 직접 원인으로 이해함", kind: "misconception" },
      { id: "c", text: "온실기체 증가로 지표가 내보낸 에너지가 더 많이 대기에 흡수된다.", conception: "강화된 온실효과", kind: "scientific" },
      { id: "d", text: "지구의 모든 지역이 매년 똑같이 더워지는 현상이다.", conception: "기후 변화와 지역별 날씨를 동일시함", kind: "partial" },
    ],
  },
  {
    id: "solar-energy", standard: "10통과2-02-04", domain: "환경과 에너지",
    prompt: "태양에서 나온 에너지가 지구의 생태계에 도달하기까지의 설명은?",
    options: [
      { id: "a", text: "태양의 수소 핵융합에서 질량 일부가 에너지로 바뀐다.", conception: "태양 핵융합과 질량·에너지 전환", kind: "scientific" },
      { id: "b", text: "태양이 산소로 수소를 태워 빛을 만든다.", conception: "태양 에너지를 연소로 이해함", kind: "misconception" },
      { id: "c", text: "태양 에너지는 지구에 도착한 뒤 새로 만들어진다.", conception: "태양 복사 에너지의 전달을 이해하지 못함", kind: "misconception" },
      { id: "d", text: "태양의 모든 에너지가 지구에 도달한다.", conception: "태양 에너지 일부만 지구에 도달함을 이해하지 못함", kind: "partial" },
    ],
  },
  {
    id: "generator", standard: "10통과2-02-05", domain: "환경과 에너지",
    prompt: "화력, 원자력, 풍력 발전소에서 공통으로 전기를 만드는 장치는?",
    options: [
      { id: "a", text: "연료 자체가 전기로 변하는 전지", conception: "연료가 직접 전기로 변함", kind: "misconception" },
      { id: "b", text: "터빈의 운동 에너지를 전기 에너지로 바꾸는 발전기", conception: "발전기의 에너지 전환", kind: "scientific" },
      { id: "c", text: "전기를 계속 만들어 내는 모터", conception: "전동기와 발전기를 혼동함", kind: "misconception" },
      { id: "d", text: "에너지 손실 없이 열을 모두 전기로 바꾸는 보일러", conception: "발전 과정의 효율을 100%로 이해함", kind: "misconception" },
    ],
  },
  {
    id: "efficiency", standard: "10통과2-02-06", domain: "환경과 에너지",
    prompt: "에너지 효율이 80%인 기기는 어떤 뜻일까요?",
    options: [
      { id: "a", text: "에너지의 20%가 존재하지 않게 되었다.", conception: "비유용 에너지가 소멸함", kind: "misconception" },
      { id: "b", text: "들어온 에너지 중 80%가 목적에 맞는 유용한 에너지로 전환됐다.", conception: "에너지 효율", kind: "scientific" },
      { id: "c", text: "기기를 80분 동안 사용할 수 있다는 뜻이다.", conception: "효율을 사용 시간으로 이해함", kind: "misconception" },
      { id: "d", text: "재생에너지를 80% 사용했다는 뜻이다.", conception: "효율과 재생에너지 비율을 혼동함", kind: "misconception" },
    ],
  },
  {
    id: "infection", standard: "10통과2-03-01", domain: "과학과 미래 사회",
    prompt: "감염병 유행 때 진단 검사와 접촉자 추적이 중요한 까닭은?",
    options: [
      { id: "a", text: "모든 감염자의 증상이 같다는 것을 확인하려고", conception: "감염자는 모두 같은 증상을 보임", kind: "misconception" },
      { id: "b", text: "감염 여부와 전파 경로를 파악해 확산을 줄이는 근거를 얻으려고", conception: "과학적 진단과 추적의 유용성", kind: "scientific" },
      { id: "c", text: "검사 결과는 언제나 100% 정확하기 때문에", conception: "과학적 측정에 불확실성이 없음", kind: "misconception" },
      { id: "d", text: "병원체의 종류와 관계없이 같은 치료를 하려고", conception: "병원체에 따른 진단·대응 차이를 이해하지 못함", kind: "misconception" },
    ],
  },
  {
    id: "bigdata", standard: "10통과2-03-02", domain: "과학과 미래 사회",
    prompt: "많은 건강 데이터를 분석하면 더 정확한 예측이 가능할 수 있습니다. 함께 고려해야 할 점은?",
    options: [
      { id: "a", text: "데이터가 많으면 편향과 오류는 자동으로 사라진다.", conception: "빅데이터는 항상 객관적이고 정확함", kind: "misconception" },
      { id: "b", text: "개인정보, 대표성, 알고리즘 편향을 함께 살펴야 한다.", conception: "빅데이터의 장점과 한계", kind: "scientific" },
      { id: "c", text: "개인정보는 과학 연구에 쓰이면 보호할 필요가 없다.", conception: "과학적 유용성이 개인정보 보호보다 항상 우선함", kind: "misconception" },
      { id: "d", text: "컴퓨터가 분석하면 사람의 판단은 전혀 필요 없다.", conception: "데이터 분석을 완전 자동 의사결정으로 이해함", kind: "misconception" },
    ],
  },
  {
    id: "ai-iot", standard: "10통과2-03-03", domain: "과학과 미래 사회",
    prompt: "인공지능과 사물인터넷 기술을 생활에 활용할 때 가장 균형 잡힌 생각은?",
    options: [
      { id: "a", text: "기술이 발전하면 모든 사회 문제는 자동으로 해결된다.", conception: "기술이 모든 문제를 해결함", kind: "misconception" },
      { id: "b", text: "편리함과 효율을 높이지만 안전, 격차, 일자리 문제도 살펴야 한다.", conception: "과학기술의 유용성과 한계", kind: "scientific" },
      { id: "c", text: "인공지능의 판단은 사람보다 언제나 공정하다.", conception: "인공지능은 항상 중립적임", kind: "misconception" },
      { id: "d", text: "사물인터넷은 인터넷 검색을 빠르게 하는 기술일 뿐이다.", conception: "사물인터넷의 연결·센싱 기능을 이해하지 못함", kind: "misconception" },
    ],
  },
  {
    id: "ssi-ethics", standard: "10통과2-03-04", domain: "과학과 미래 사회",
    prompt: "유전자 편집 기술의 사용 여부를 사회가 결정할 때 필요한 과정은?",
    options: [
      { id: "a", text: "과학자가 가능하다고 말하면 바로 허용한다.", conception: "과학적 가능성이 사회적 허용을 결정함", kind: "misconception" },
      { id: "b", text: "경제적 이익만 가장 크게 만들면 된다.", conception: "과학기술 의사결정을 경제성만으로 판단함", kind: "misconception" },
      { id: "c", text: "과학적 근거와 함께 윤리, 위험, 형평성, 다양한 입장을 검토한다.", conception: "SSI와 과학 윤리", kind: "scientific" },
      { id: "d", text: "과학 문제에는 가치 판단이 전혀 들어가면 안 된다.", conception: "SSI에서 사실과 가치의 상호작용을 부정함", kind: "misconception" },
    ],
  },
];

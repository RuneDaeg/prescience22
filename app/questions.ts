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
  {
    id: "geo-fossil-record", standard: "10통과2-01-01", domain: "변화와 다양성",
    prompt: "서로 다른 지층에서 발견되는 화석의 종류가 달라지는 까닭을 가장 잘 설명한 것은?",
    options: [
      { id: "a", text: "지질시대마다 환경과 생물의 종류가 달라졌기 때문이다.", conception: "지질시대의 환경 변화와 생물다양성", kind: "scientific" },
      { id: "b", text: "오래된 지층일수록 모든 화석이 저절로 단순해지기 때문이다.", conception: "오래된 생물은 모두 단순하다고 이해함", kind: "misconception" },
      { id: "c", text: "화석의 차이는 암석 색깔 때문에 생긴 착시일 뿐이다.", conception: "화석 기록을 지질 환경의 증거로 보지 않음", kind: "misconception" },
      { id: "d", text: "한 번 생긴 생물종은 멸종하지 않고 계속 살아 있기 때문이다.", conception: "종은 멸종하지 않는다고 이해함", kind: "misconception" },
    ],
  },
  {
    id: "evolution-antibiotic", standard: "10통과2-01-02", domain: "변화와 다양성",
    prompt: "항생제를 반복해서 사용했더니 내성 세균의 비율이 높아졌습니다. 가장 알맞은 설명은?",
    options: [
      { id: "a", text: "항생제가 세균에게 내성이 필요하다고 알려 주었다.", conception: "환경이 필요에 맞는 변이를 지시함", kind: "misconception" },
      { id: "b", text: "내성 변이를 가진 세균이 살아남아 더 많이 번식했다.", conception: "변이와 자연선택에 의한 내성 증가", kind: "scientific" },
      { id: "c", text: "모든 세균이 항생제에 노출되는 순간 똑같이 변했다.", conception: "환경이 개체를 동일하게 변화시킴", kind: "misconception" },
      { id: "d", text: "세균 한 개체가 노력해서 얻은 내성을 자손에게 전했다.", conception: "획득한 형질이 그대로 유전됨", kind: "misconception" },
    ],
  },
  {
    id: "redox-rust", standard: "10통과2-01-03", domain: "변화와 다양성",
    prompt: "철제 난간에 페인트를 칠하면 녹이 생기는 것을 늦출 수 있는 주된 까닭은?",
    options: [
      { id: "a", text: "페인트가 이미 생긴 녹을 다시 철로 환원하기 때문이다.", conception: "부식 방지를 녹의 환원으로 이해함", kind: "misconception" },
      { id: "b", text: "철이 산소와 물에 접촉하여 산화되는 것을 막기 때문이다.", conception: "철의 산화와 부식 방지", kind: "scientific" },
      { id: "c", text: "페인트가 철의 온도를 항상 영하로 유지하기 때문이다.", conception: "부식을 온도만의 문제로 이해함", kind: "misconception" },
      { id: "d", text: "페인트를 칠하면 철 원자가 더 이상 존재하지 않기 때문이다.", conception: "코팅 과정에서 철이 사라진다고 이해함", kind: "misconception" },
    ],
  },
  {
    id: "acid-base-antacid", standard: "10통과2-01-04", domain: "변화와 다양성",
    prompt: "속이 쓰릴 때 제산제를 복용하면 증상이 완화될 수 있는 원리는?",
    options: [
      { id: "a", text: "제산제의 염기가 위산 일부와 중화 반응을 하기 때문이다.", conception: "생활 속 중화 반응의 이용", kind: "scientific" },
      { id: "b", text: "제산제가 위산을 물리적으로 얼려 버리기 때문이다.", conception: "중화를 상태 변화로 이해함", kind: "misconception" },
      { id: "c", text: "산과 염기가 만나면 두 물질이 흔적 없이 사라지기 때문이다.", conception: "중화 시 물질이 소멸함", kind: "misconception" },
      { id: "d", text: "제산제가 위 속의 모든 물을 산으로 바꾸기 때문이다.", conception: "제산제가 산성을 강화한다고 이해함", kind: "misconception" },
    ],
  },
  {
    id: "energy-handwarmer", standard: "10통과2-01-05", domain: "변화와 다양성",
    prompt: "일회용 손난로를 흔들었더니 따뜻해졌습니다. 에너지 출입에 대한 설명은?",
    options: [
      { id: "a", text: "손난로 속 철가루가 공기 중 산소와 반응하며 주변으로 에너지를 방출했다.", conception: "산화 반응에서의 에너지 방출", kind: "scientific" },
      { id: "b", text: "손난로가 에너지 없이 열을 새로 만들어 냈다.", conception: "에너지가 무에서 생성됨", kind: "misconception" },
      { id: "c", text: "주변의 차가움을 흡수해서 따뜻함만 남겼다.", conception: "차가움을 이동하는 물질로 이해함", kind: "misconception" },
      { id: "d", text: "따뜻해졌으므로 반드시 빛에너지만 방출한 것이다.", conception: "방출 에너지의 형태를 빛으로만 이해함", kind: "misconception" },
    ],
  },
  {
    id: "ecosystem-interaction", standard: "10통과2-02-01", domain: "환경과 에너지",
    prompt: "숲의 나무가 많아지면 그늘과 습도가 달라지고 다른 생물의 분포도 변할 수 있습니다. 무엇을 보여 주는 사례일까요?",
    options: [
      { id: "a", text: "생물은 환경의 영향만 받고 환경에는 영향을 주지 않는다.", conception: "생물과 환경의 관계를 단방향으로 이해함", kind: "misconception" },
      { id: "b", text: "생물과 비생물 환경이 서로 영향을 주고받는다.", conception: "생물과 환경의 상호 관계", kind: "scientific" },
      { id: "c", text: "같은 숲에 사는 생물은 모두 같은 먹이를 먹는다.", conception: "서식 공간이 같으면 먹이도 같다고 이해함", kind: "misconception" },
      { id: "d", text: "습도는 비생물 요소이므로 생태계 변화와 관계없다.", conception: "비생물 요소를 생태계에서 제외함", kind: "misconception" },
    ],
  },
  {
    id: "food-pyramid", standard: "10통과2-02-02", domain: "환경과 에너지",
    prompt: "일반적으로 생태 피라미드의 위쪽 영양 단계로 갈수록 에너지양이 줄어드는 까닭은?",
    options: [
      { id: "a", text: "각 영양 단계에서 생명 활동과 열로 에너지 일부가 빠져나가기 때문이다.", conception: "영양 단계 사이의 에너지 전달", kind: "scientific" },
      { id: "b", text: "포식자는 에너지를 전혀 필요로 하지 않기 때문이다.", conception: "상위 소비자는 에너지를 사용하지 않음", kind: "misconception" },
      { id: "c", text: "위쪽으로 갈수록 에너지 자체의 질량이 무거워지기 때문이다.", conception: "에너지양 감소를 질량 변화로 이해함", kind: "misconception" },
      { id: "d", text: "생산자가 태양 에너지를 하나도 저장하지 못하기 때문이다.", conception: "생산자의 에너지 저장을 부정함", kind: "misconception" },
    ],
  },
  {
    id: "climate-elnino", standard: "10통과2-02-03", domain: "환경과 에너지",
    prompt: "엘니뇨가 발생할 때 열대 태평양의 변화로 가장 알맞은 것은?",
    options: [
      { id: "a", text: "무역풍이 약해지고 따뜻한 표층수가 동쪽으로 이동해 기상 패턴이 달라진다.", conception: "엘니뇨의 발생 메커니즘과 영향", kind: "scientific" },
      { id: "b", text: "지구의 모든 바닷물이 동시에 끓기 시작한다.", conception: "엘니뇨를 전 지구 해수의 급격한 가열로 이해함", kind: "misconception" },
      { id: "c", text: "오존층이 얇아져 태평양에만 햇빛이 더 들어온다.", conception: "엘니뇨를 오존층 파괴로 설명함", kind: "misconception" },
      { id: "d", text: "태평양의 해수면 온도 변화는 육지의 날씨에 영향을 주지 않는다.", conception: "해양과 대기의 상호작용을 부정함", kind: "misconception" },
    ],
  },
  {
    id: "solar-energy-flow", standard: "10통과2-02-04", domain: "환경과 에너지",
    prompt: "태양 에너지가 풀을 거쳐 초식동물의 운동 에너지로 전환되는 순서로 알맞은 것은?",
    options: [
      { id: "a", text: "태양 복사 에너지 → 풀의 화학 에너지 → 초식동물의 화학·운동 에너지", conception: "지구에서의 태양 에너지 흐름과 전환", kind: "scientific" },
      { id: "b", text: "초식동물의 운동 에너지 → 태양 복사 에너지 → 풀의 화학 에너지", conception: "생태계 에너지 흐름의 방향을 반대로 이해함", kind: "misconception" },
      { id: "c", text: "태양 복사 에너지 → 풀의 핵에너지 → 초식동물의 빛에너지", conception: "생물의 에너지 전환 형태를 혼동함", kind: "misconception" },
      { id: "d", text: "풀과 초식동물이 태양과 관계없이 에너지를 각각 새로 만든다.", conception: "생태계 에너지원으로서 태양을 이해하지 못함", kind: "misconception" },
    ],
  },
  {
    id: "generator-nuclear", standard: "10통과2-02-05", domain: "환경과 에너지",
    prompt: "원자력 발전소에서 전기 에너지가 만들어지는 과정으로 가장 알맞은 것은?",
    options: [
      { id: "a", text: "핵에너지 → 열에너지 → 터빈의 운동 에너지 → 전기 에너지", conception: "원자력 발전의 에너지 전환", kind: "scientific" },
      { id: "b", text: "핵에너지가 발전기를 거치지 않고 곧바로 전자가 된다.", conception: "핵에너지가 직접 전기 에너지로 변환됨", kind: "misconception" },
      { id: "c", text: "냉각수가 전기를 저장했다가 전선으로 내보낸다.", conception: "냉각수의 역할을 전기 저장으로 이해함", kind: "misconception" },
      { id: "d", text: "원자로는 에너지 손실 없이 전기를 100% 생산한다.", conception: "발전 효율을 100%로 이해함", kind: "misconception" },
    ],
  },
  {
    id: "efficiency-renewable", standard: "10통과2-02-06", domain: "환경과 에너지",
    prompt: "학교에 태양광이나 풍력 발전 설비를 설치하려고 합니다. 가장 먼저 함께 고려할 것은?",
    options: [
      { id: "a", text: "햇빛과 바람 같은 지역 조건, 설치 위치와 환경 영향을 함께 살핀다.", conception: "지역 조건을 고려한 신재생에너지 활용", kind: "scientific" },
      { id: "b", text: "어느 지역에 설치해도 항상 같은 양의 에너지를 얻을 수 있다.", conception: "지역 조건과 무관하게 발전량이 일정함", kind: "misconception" },
      { id: "c", text: "재생 가능하므로 설비 생산과 설치가 환경에 미치는 영향은 전혀 없다.", conception: "신재생에너지는 환경 영향이 전혀 없음", kind: "misconception" },
      { id: "d", text: "에너지 효율과 관계없이 발전 설비의 수만 늘리면 된다.", conception: "지속가능한 발전에서 효율의 중요성을 무시함", kind: "misconception" },
    ],
  },
  {
    id: "infection-test", standard: "10통과2-03-01", domain: "과학과 미래 사회",
    prompt: "감염병 진단 검사에서 음성 결과가 나왔다면 어떻게 해석하는 것이 가장 과학적일까요?",
    options: [
      { id: "a", text: "검사 시점과 정확도에 따라 감염 가능성이 남을 수 있어 다른 정보도 함께 본다.", conception: "진단 검사의 불확실성과 종합적 판단", kind: "scientific" },
      { id: "b", text: "음성이면 검사 시점과 관계없이 감염 가능성은 반드시 0%이다.", conception: "진단 검사를 절대적으로 확실한 판정으로 이해함", kind: "misconception" },
      { id: "c", text: "검사 결과보다 소문이 더 정확하므로 결과를 무시한다.", conception: "과학적 진단의 유용성을 부정함", kind: "misconception" },
      { id: "d", text: "한 사람의 음성 결과만으로 지역 유행이 끝났다고 판단한다.", conception: "개인 검사 결과를 집단 전체에 일반화함", kind: "misconception" },
    ],
  },
  {
    id: "bigdata-correlation", standard: "10통과2-03-02", domain: "과학과 미래 사회",
    prompt: "과거 태풍 자료를 아주 많이 모으면 미래 태풍의 이동 경로를 언제나 완벽하게 예측할 수 있을까요?",
    options: [
      { id: "a", text: "자료가 많으면 예측에 도움이 되지만 자료의 정확성과 예외 때문에 오차가 남을 수 있다.", conception: "빅데이터 예측의 유용성과 한계", kind: "scientific" },
      { id: "b", text: "자료의 양만 충분하면 자료의 정확성과 관계없이 예측은 반드시 맞는다.", conception: "데이터의 양만으로 예측이 완벽해짐", kind: "misconception" },
      { id: "c", text: "컴퓨터가 분석한 결과에는 어떤 불확실성이나 오류도 없다.", conception: "알고리즘 결과는 항상 정확함", kind: "misconception" },
      { id: "d", text: "과거 자료에 없던 기상 조건도 과거와 완전히 같은 결과를 만든다.", conception: "새로운 조건과 예외를 고려하지 않음", kind: "misconception" },
    ],
  },
  {
    id: "ai-iot-smartfarm", standard: "10통과2-03-03", domain: "과학과 미래 사회",
    prompt: "스마트팜에서 센서와 인공지능을 함께 사용하는 사례로 가장 알맞은 것은?",
    options: [
      { id: "a", text: "온도와 토양 수분을 측정하고 분석해 물 공급을 조절한다.", conception: "사물인터넷과 인공지능의 환경 개선 활용", kind: "scientific" },
      { id: "b", text: "센서가 측정하지 않아도 인공지능이 항상 정확한 환경값을 상상한다.", conception: "인공지능은 데이터 없이도 정확함", kind: "misconception" },
      { id: "c", text: "인터넷에 연결되면 모든 농작물이 같은 조건에서 잘 자란다.", conception: "기술 적용이 생물의 조건 차이를 없앰", kind: "misconception" },
      { id: "d", text: "자동화된 판단에는 오류가 없으므로 사람이 확인할 필요가 없다.", conception: "자동화 시스템은 항상 오류가 없음", kind: "misconception" },
    ],
  },
  {
    id: "ssi-autonomous", standard: "10통과2-03-04", domain: "과학과 미래 사회",
    prompt: "자율주행차 사고의 책임 기준을 정하는 문제를 해결할 때 가장 필요한 접근은?",
    options: [
      { id: "a", text: "기술의 정확도만 계산하면 법과 윤리 문제도 자동으로 해결된다.", conception: "과학적 사실만으로 SSI가 해결됨", kind: "misconception" },
      { id: "b", text: "개발 회사의 경제적 이익만 기준으로 삼는다.", conception: "사회적 의사결정을 경제성만으로 판단함", kind: "misconception" },
      { id: "c", text: "안전 자료와 함께 책임, 개인정보, 형평성 등 다양한 가치를 논의한다.", conception: "과학 관련 사회적 쟁점의 다면적 논증", kind: "scientific" },
      { id: "d", text: "새로운 기술이므로 기존 사회 규칙과는 아무 관련이 없다.", conception: "과학기술이 사회 제도와 무관함", kind: "misconception" },
    ],
  },
];

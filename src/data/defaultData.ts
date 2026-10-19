import { ChatMessage, ChecklistItem, BudgetItem, ItineraryPlan } from '../types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    role: 'model',
    content: `안녕하세요! 당신만을 위한 스마트 여행 플래너 **트래블메이트 AI**입니다 ✈️🌏

가고 싶은 여행지, 일정(예: 3박 4일), 동행자, 원하는 여행 스타일(가성비, 미식, 힐링, 관광 집중 등)을 편하게 말씀해 주세요.

아래와 같이 질문하시면 가장 최적화된 맞춤형 일정을 짜드립니다:
- *"도쿄 3박 4일 감성 카페와 맛집 중심 뚜벅이 코스 짜줘"*
- *"제주도 2박 3일 부모님 모시고 가는 힐링 드라이브 여행 추천해줘"*
- *"파리 5박 6일 예술과 박물관 중심 일정 및 예상 경비 정리해줘"*
- *"오사카 3박 4일 유니버설 스튜디오 포함 가성비 코스 알려줘"*

언제든 AI가 추천한 일정을 클릭 한 번으로 **우측 인터랙티브 일정표**로 변환하여 자유롭게 편집하고 관리할 수 있습니다!`,
    timestamp: Date.now() - 60000,
    modelUsed: 'gemini-3.8-flash',
    personaUsed: 'master',
  },
];

export const INITIAL_ITINERARY: ItineraryPlan = {
  destination: '도쿄 (Tokyo)',
  title: '도쿄 3박 4일 감성과 미식 힐링 트립',
  summary: '도쿄의 전통과 현대적 트렌드를 조화롭게 둘러보며, 여유로운 카페 산책과 로컬 미식을 만끽하는 알짜배기 3박 4일 여정입니다.',
  totalEstimatedBudget: '약 850,000원 ~ 1,100,000원 (항공료 제외 1인 기준)',
  days: [
    {
      dayNumber: 1,
      title: '도쿄 입국 & 시부야·하라주쿠 트렌디 산책',
      theme: '도시 탐방 & 랜드마크',
      activities: [
        {
          id: 'act-1-1',
          timeSlot: '오후',
          time: '14:30',
          placeName: '나리타/하네다 공항 도착 & 호텔 체크인',
          category: '이동',
          description: '스카이라이너 또는 도쿄 모노레일을 탑승해 신주쿠/시부야 방면 호텔로 이동 후 가벼운 짐 정리',
          transportTip: '공항에서 스이카/파스모 교통카드 애플페이 또는 실물카드 수령 권장',
          costEstimate: '스카이라이너 약 2,570엔',
          completed: true,
        },
        {
          id: 'act-1-2',
          timeSlot: '오후',
          time: '16:00',
          placeName: '시부야 스크램블 교차로 & 시부야 스카이',
          category: '관광',
          description: '세계에서 가장 붐비는 횡단보도를 건너며 도쿄의 활기를 느끼고, 일몰 시간대에 맞춰 시부야 스카이 전망대에서 도쿄 전경 감상',
          transportTip: '시부야역 하차 후 도보 2분',
          costEstimate: '입장료 사전 예약 약 2,200엔',
          completed: false,
        },
        {
          id: 'act-1-3',
          timeSlot: '저녁',
          time: '19:00',
          placeName: '시부야 백식당 또는 미야시타 파크 로컬 다이닝',
          category: '맛집',
          description: '미야시타 파크 옥상 정원을 거닐며 캐주얼한 야키토리 혹은 츠케멘 전문점에서 든든한 첫날 저녁 식사',
          transportTip: '시부야 스카이에서 도보 5분',
          costEstimate: '약 1,800엔 ~ 2,500엔',
          completed: false,
        },
      ],
    },
    {
      dayNumber: 2,
      title: '레트로 감성의 아사쿠사와 세련된 긴자',
      theme: '전통과 현대의 조화',
      activities: [
        {
          id: 'act-2-1',
          timeSlot: '오전',
          time: '09:30',
          placeName: '센소지(아사쿠사사) & 나카미세 거리',
          category: '관광',
          description: '도쿄에서 가장 오래된 사찰 센소지를 둘러보고 나카미세 거리에서 갓 구운 닌교야키와 말차 디저트 시식',
          transportTip: '긴자선 아사쿠사역 1번 출구 도보 5분',
          costEstimate: '사찰 무료입장 / 간식비 약 1,000엔',
          completed: false,
        },
        {
          id: 'act-2-2',
          timeSlot: '오후',
          time: '12:30',
          placeName: '아사쿠사 우나기(장어덮밥) 점심 식사',
          category: '맛집',
          description: '100년 전통의 아사쿠사 로컬 장어덮밥 노포에서 기력 충전',
          costEstimate: '장어덮밥 약 3,500엔',
          completed: false,
        },
        {
          id: 'act-2-3',
          timeSlot: '오후',
          time: '15:00',
          placeName: '긴자 식스 & 츠타야 서점 아트 라운지',
          category: '카페',
          description: '긴자의 럭셔리 복합문화공간 긴자 식스 6층의 츠타야 서점에서 미술 서적을 구경하고 커피 한 잔의 휴식',
          transportTip: '긴자선으로 아사쿠사에서 긴자역까지 직통 약 16분',
          costEstimate: '음료 약 800엔',
          completed: false,
        },
        {
          id: 'act-2-4',
          timeSlot: '저녁',
          time: '18:30',
          placeName: '도쿄역 마루노우치 야경 & 키테(KITTE) 옥상정원',
          category: '관광',
          description: '붉은 벽돌의 고풍스러운 도쿄역 외관과 주변 빌딩 숲이 어우러진 야경 포토스팟 감상',
          transportTip: '긴자에서 도보 12분 또는 마루노우치선 1정거장',
          costEstimate: '무료',
          completed: false,
        },
      ],
    },
    {
      dayNumber: 3,
      title: '예술적인 롯폰기와 오모테산도 카페 투어',
      theme: '아트 & 라이프스타일',
      activities: [
        {
          id: 'act-3-1',
          timeSlot: '오전',
          time: '10:00',
          placeName: '메이지신궁 숲길 산책 & 오모테산도 힐즈',
          category: '관광',
          description: '도심 속 울창한 녹음의 메이지신궁 숲길을 걸으며 차분한 아침을 맞이하고, 오모테산도의 감각적인 부티크 거리 탐방',
          transportTip: 'JR 야마노테선 하라주쿠역 바로 앞',
          costEstimate: '신궁 입장 무료',
          completed: false,
        },
        {
          id: 'act-3-2',
          timeSlot: '오후',
          time: '13:00',
          placeName: '오모테산도 브런치 & 블루보틀 1호점/카페 키츠네',
          category: '카페',
          description: '햇살이 드는 아늑한 테라스에서 브런치와 정성스레 내린 핸드드립 커피 즐기기',
          costEstimate: '약 2,200엔',
          completed: false,
        },
        {
          id: 'act-3-3',
          timeSlot: '오후',
          time: '16:00',
          placeName: '롯폰기 힐즈 모리 미술관(Mori Art Museum)',
          category: '액티비티',
          description: '롯폰기 힐즈 53층의 현대미술관 관람과 함께 롯폰기 타워에서 조망하는 도쿄타워 전경',
          transportTip: '치요다선 노기자카역 또는 오에도선 롯폰기역 도보 5분',
          costEstimate: '전시 관람권 약 2,000엔',
          completed: false,
        },
        {
          id: 'act-3-4',
          timeSlot: '저녁',
          time: '19:30',
          placeName: '도쿄타워 뷰 이자카야 / 롯폰기 다이닝',
          category: '맛집',
          description: '도쿄타워의 주황빛 조명을 바라보며 나마비루(생맥주)와 모둠 꼬치로 여행의 마지막 밤 기념',
          costEstimate: '약 4,000엔',
          completed: false,
        },
      ],
    },
  ],
  suggestedPackingItems: [
    '여권 및 복사본',
    '110V 돼지코 어댑터 2개',
    '스마트폰 보조배터리 (비행기 기내 휴대)',
    '편안한 워킹화 (하루 15,000보 이상)',
    '비짓재팬웹(Visit Japan Web) 사전 QR 등록',
    '동전 지갑 (일본은 아직 동전 사용 빈도 높음)',
  ],
  recommendedFoods: [
    '아사쿠사 노포 장어덮밥 (우나쥬)',
    '시부야 츠케멘 & 돈코츠 라멘',
    '츠키지 장외시장 신선한 카이센동 (해산물 덮밥)',
    '긴자 레트로 킷사텐의 푸딩 & 핸드드립',
    '편의점 야식 (달걀 샌드위치 & 푸딩 & 롤케이크)',
  ],
};

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'c-1', category: '필수 서류/금융', text: '여권 (유효기간 6개월 이상 확인)', checked: true },
  { id: 'c-2', category: '필수 서류/금융', text: '항공권 E-Ticket 및 호텔 바우처 출력/저장', checked: true },
  { id: 'c-3', category: '필수 서류/금융', text: '해외 결제 가능한 신용카드 (트래블로그/트래블월렛 등)', checked: true },
  { id: 'c-4', category: '필수 서류/금융', text: '현지 통화 환전 (일부 현금 소지 권장)', checked: false },
  { id: 'c-5', category: '필수 서류/금융', text: '여행자 보험 가입 완료', checked: false },
  { id: 'c-6', category: '전자기기', text: '해외용 변환 플러그 (110V 돼지코 또는 멀티 어댑터)', checked: true },
  { id: 'c-7', category: '전자기기', text: '고용량 스마트폰 보조배터리 (기내 반입 필수)', checked: true },
  { id: 'c-8', category: '전자기기', text: '해외 eSIM 또는 유심 / 포켓와이파이 예약', checked: false },
  { id: 'c-9', category: '전자기기', text: '휴대폰 및 기기 충전 케이블', checked: true },
  { id: 'c-10', category: '의류/잡화', text: '발이 편한 런닝화 / 워킹화', checked: true },
  { id: 'c-11', category: '의류/잡화', text: '날씨에 맞춘 일자별 여벌 옷 & 겉옷', checked: false },
  { id: 'c-12', category: '의류/잡화', text: '접이식 휴대용 우산 / 양산', checked: false },
  { id: 'c-13', category: '상비약/위생', text: '개인 상비약 (소화제, 두통약, 지사제, 밴드)', checked: false },
  { id: 'c-14', category: '상비약/위생', text: '인공눈물 / 개인 복용 약품', checked: false },
];

export const INITIAL_BUDGET: BudgetItem[] = [
  { id: 'b-1', category: '항공', title: '왕복 항공권 (인천 ↔ 도쿄)', amount: 380000, currency: 'KRW' },
  { id: 'b-2', category: '숙박', title: '도쿄 호텔 3박 (신주쿠/시부야)', amount: 450000, currency: 'KRW' },
  { id: 'b-3', category: '교통', title: '스카이라이너 + 지하철 패스 + 스이카', amount: 80000, currency: 'KRW' },
  { id: 'b-4', category: '식비', title: '3박 4일 현지 식비 및 디저트 카페', amount: 240000, currency: 'KRW' },
  { id: 'b-5', category: '액티비티', title: '시부야 스카이 & 모리 미술관 입장권', amount: 45000, currency: 'KRW' },
  { id: 'b-6', category: '쇼핑', title: '기념품 & 드럭스토어 & 면세 쇼핑', amount: 150000, currency: 'KRW' },
];

export const PERSONA_METADATA = {
  master: {
    id: 'master',
    name: '종합 여행 플래너',
    roleTag: '밸런스 & 동선 최적화',
    desc: '관광, 맛집, 휴식의 균형 잡힌 최적의 동선 설계',
    icon: 'Compass',
  },
  budget: {
    id: 'budget',
    name: '가성비 배낭여행',
    roleTag: '알뜰 경비 & 꿀팁',
    desc: '교통 패스, 무료 스팟, 로컬 가성비 맛집 중심',
    icon: 'Wallet',
  },
  healing: {
    id: 'healing',
    name: '감성 힐링 & 미식',
    roleTag: '여유 & 분위기 카페',
    desc: '감성 스팟, 슬로우 트래블, 미식과 카페 투어',
    icon: 'Coffee',
  },
  express: {
    id: 'express',
    name: '초고속 요약 플래너',
    roleTag: '핵심만 스피드 요약',
    desc: '사족 없이 핵심 동선과 필수 체크리스트만 요약',
    icon: 'Zap',
  },
};

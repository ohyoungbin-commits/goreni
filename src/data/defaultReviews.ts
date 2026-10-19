export interface ReviewComment {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}

export interface TravelReview {
  id: string;
  title: string;
  destination: string;
  author: string;
  rating: number; // 1 to 5
  travelDuration: string;
  companion: '혼자' | '친구와' | '연인과' | '가족과' | '아이와' | string;
  category: '명소 탐방' | '미식/맛집' | '숙소/호텔' | '여행 꿀팁' | '액티비티' | string;
  content: string;
  highlightTags: string[];
  likes: number;
  likedByMe?: boolean;
  comments: ReviewComment[];
  createdAt: number;
  itinerarySummary?: string;
}

export const INITIAL_REVIEWS: TravelReview[] = [
  {
    id: 'rev-1',
    title: '도쿄 3박 4일 시부야스카이 & 골목 킷사텐 솔직 후기',
    destination: '도쿄 (Tokyo)',
    author: '민트라떼',
    rating: 5,
    travelDuration: '3박 4일',
    companion: '친구와',
    category: '명소 탐방',
    content: `시부야 스카이는 일몰 40분 전 타임으로 꼭 예약하고 가세요! 노을 지는 하늘부터 도쿄타워 불 켜지는 야경까지 한 번에 볼 수 있어서 입장료가 전혀 아깝지 않았습니다.
그리고 긴자나 아사쿠사에서는 번화가 체인점보다 한적한 골목에 있는 오래된 킷사텐(전통 다방)에서 푸딩과 핸드드립 커피를 맛보시길 추천해요. 스이카는 아이폰 애플월렛에 미리 충전해두니 환승할 때 정말 편했습니다.`,
    highlightTags: ['시부야스카이 노을 필수', '킷사텐 푸딩 강추', '애플월렛 스이카 편함'],
    likes: 42,
    likedByMe: false,
    comments: [
      {
        id: 'c-1-1',
        author: '떠나요둘이서',
        content: '시부야 스카이 일몰 시간대 예약 몇 주 전에 하셨나요? 꿀팁 감사해요!',
        createdAt: Date.now() - 3600000 * 24 * 2,
      },
      {
        id: 'c-1-2',
        author: '민트라떼',
        content: '방문일 기준 딱 4주 전 자정에 열리는데 그때 바로 예약했습니다!',
        createdAt: Date.now() - 3600000 * 24 * 1,
      },
    ],
    createdAt: Date.now() - 3600000 * 24 * 3,
    itinerarySummary: '시부야 스카이(일몰 17:30) → 긴자 킷사텐 투어 → 아사쿠사 센소지',
  },
  {
    id: 'rev-2',
    title: '제주도 동쪽 힐링 2박 3일 뚜벅이 완벽 정복!',
    destination: '제주도 (Jeju)',
    author: '바람따라구름따라',
    rating: 5,
    travelDuration: '2박 3일',
    companion: '혼자',
    category: '명소 탐방',
    content: `뚜벅이 혼자 여행으로 함덕과 구좌, 종달리 중심 코스를 다녀왔습니다. 급행버스 101번과 순환버스 201번 배차 간격만 카카오맵으로 잘 확인하면 렌트 없이도 여유롭게 다닐 수 있어요.
특히 종달리 마을 골목의 독립서점들과 조용한 심야식당은 혼자 생각 정리하기에 최고의 장소였습니다. 함덕 서우봉 둘레길 아침 산책도 잊지 마세요!`,
    highlightTags: ['혼행 추천', '종달리 골목길', '함덕 서우봉 아침 산책'],
    likes: 38,
    likedByMe: true,
    comments: [
      {
        id: 'c-2-1',
        author: '제주러버',
        content: '종달리는 정말 마음이 편안해지는 곳이죠. 후기 사진 없어도 감성이 느껴져요.',
        createdAt: Date.now() - 3600000 * 18,
      },
    ],
    createdAt: Date.now() - 3600000 * 24 * 4,
    itinerarySummary: '함덕 해변 & 서우봉 → 종달리 마을 서점 투어 → 세화 카페거리',
  },
  {
    id: 'rev-3',
    title: '파리 5박 6일 오르세 & 에펠탑 피크닉 감성 여행',
    destination: '파리 (Paris)',
    author: '크루아상요정',
    rating: 4,
    travelDuration: '5박 6일',
    companion: '연인과',
    category: '미식/맛집',
    content: `루브르보다 오르세 미술관이 동선도 편하고 인상주의 명작들이 가득해서 훨씬 감동적이었습니다. 목요일은 야간 개장이 있어 덜 붐비니 참고하세요!
바게트 샌드위치와 와인 한 병 사서 샹드마르스 공원에서 에펠탑 보며 즐긴 피크닉이 이번 여행 최고의 순간이었어요. 다만 지하철 환승 통로에서 소매치기 항상 주의하세요.`,
    highlightTags: ['오르세 목요 야간개장', '에펠탑 공원 피크닉', '소매치기 주의'],
    likes: 56,
    likedByMe: false,
    comments: [],
    createdAt: Date.now() - 3600000 * 24 * 6,
    itinerarySummary: '오르세 미술관 → 생제르맹데프레 카페 → 샹드마르스 에펠탑 피크닉',
  },
  {
    id: 'rev-4',
    title: '오사카 유니버설 익스프레스 없이 하루 알차게 즐긴 팁',
    destination: '오사카 (Osaka)',
    author: '놀이기구마스터',
    rating: 4,
    travelDuration: '3박 4일',
    companion: '친구와',
    category: '액티비티',
    content: `익스프레스 티켓이 매진되어 일반 입장권으로 갔는데, 오픈 1시간 전(오전 7시 30분)에 도착해서 오픈런하니 닌텐도 월드 확약권 없이도 바로 입장 가능했습니다!
싱글라이더 줄을 적극 활용하면 인기 어트랙션도 대기 시간 30분 안으로 탈 수 있어요. 점심은 파크 안보다 든든하게 먹고 들어가서 간식 위주로 먹는 게 가성비 좋습니다.`,
    highlightTags: ['USJ 오픈런 성공', '싱글라이더 꿀팁', '닌텐도월드 공략'],
    likes: 29,
    likedByMe: false,
    comments: [],
    createdAt: Date.now() - 3600000 * 24 * 8,
    itinerarySummary: '오사카 USJ 오픈런 → 도톤보리 야경 & 타코야키 투어',
  },
  {
    id: 'rev-5',
    title: '방콕 4박 5일 가성비 5성급 호캉스와 미슐랭 팟타이 투어',
    destination: '방콕 (Bangkok)',
    author: '망고스틴중독',
    rating: 5,
    travelDuration: '4박 5일',
    companion: '가족과',
    category: '숙소/호텔',
    content: `방콕은 1박 10만원대 중반으로 차오프라야 강변 5성급 호텔 수영장과 조식을 누릴 수 있어 가성비 최고입니다.
왓아룬 뷰 루프탑 바는 해질녘 17시쯤 방문하면 노을과 사원 조명이 켜지는 순간을 둘 다 볼 수 있어요. 이동할 때는 볼트(Bolt)나 그랩(Grab) 어플 이용하면 바가지 없이 편합니다.`,
    highlightTags: ['강변 호캉스 가성비', '왓아룬 일몰 명당', '볼트 앱 추천'],
    likes: 64,
    likedByMe: false,
    comments: [],
    createdAt: Date.now() - 3600000 * 24 * 10,
    itinerarySummary: '차오프라야 강변 호캉스 → 왓아룬 노을 루프탑 → 쩟페어 야시장',
  },
];

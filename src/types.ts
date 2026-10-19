export type PersonaType = 'master' | 'budget' | 'healing' | 'express';

export type ModelType = 'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
  personaUsed?: PersonaType;
}

export interface ItineraryActivity {
  id: string;
  timeSlot: string; // 오전, 오후, 저녁, 야간
  time?: string; // 09:30, 14:00 etc
  placeName: string;
  category: '관광' | '맛집' | '카페' | '액티비티' | '쇼핑' | '휴식' | '이동' | string;
  description: string;
  costEstimate?: string;
  transportTip?: string;
  completed?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  theme?: string;
  activities: ItineraryActivity[];
}

export interface ItineraryPlan {
  destination: string;
  title: string;
  summary?: string;
  totalEstimatedBudget?: string;
  days: ItineraryDay[];
  suggestedPackingItems?: string[];
  recommendedFoods?: string[];
}

export interface ChecklistItem {
  id: string;
  category: '필수 서류/금융' | '전자기기' | '의류/잡화' | '상비약/위생' | '기타' | string;
  text: string;
  checked: boolean;
}

export interface BudgetItem {
  id: string;
  category: '항공' | '숙박' | '식비' | '교통' | '액티비티' | '쇼핑' | '기타';
  title: string;
  amount: number;
  currency: 'KRW' | 'JPY' | 'USD' | 'EUR';
}

export type ActiveTab = 'chat' | 'itinerary' | 'checklist' | 'budget' | 'community' | 'briefing';

export interface TravelBriefingReport {
  tripThemeTitle: string;
  executiveSummary: string;
  paceRating: string;
  paceDescription: string;
  dailyHighlights: {
    dayNumber: number;
    dayTitle: string;
    coreRoute: string;
    tip: string;
  }[];
  budgetAssessment: string;
  preparationStatus: string;
  topRecommendations: string[];
  generatedAt: number;
}

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

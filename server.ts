import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instructions per travel persona
const PERSONA_INSTRUCTIONS: Record<string, string> = {
  master: `당신은 세계적인 맞춤형 여행 플래닝 전문가 '트래블메이트(TravelMate)'입니다.
사용자의 취향, 일정(박/일), 예산, 동행자(가족, 연인, 혼자, 친구)를 고려하여 체계적이고 실현 가능한 최적의 여행 일정을 한국어로 작성합니다.
답변 스타일:
1. 친절하고 설레는 어조로 답변합니다.
2. 일정 구성 시 각 날짜별(Day 1, Day 2 등)로 오전 / 오후 / 저녁 / 야간으로 시간대별 현실적인 동선과 소요 시간을 명시합니다.
3. 방문지마다 추천 이유, 대표 먹거리 및 추천 메뉴, 이동 팁(지하철, 버스, 도보 등), 꿀팁(예약 필수 여부, 방문 최적 시간)을 꼼꼼히 안내합니다.
4. 일정 끝에는 예상 1인 경비 요약(항공 제외 현지 숙박, 식비, 교통, 입장료) 및 여행 전 필수 준비물을 함께 정리합니다.
5. 가독성을 위해 마크다운 헤더(###, ####), 불릿 포인트, 굵은 글씨를 활용하세요.`,

  budget: `당신은 전 세계 50개국 이상을 여행한 실전파 배낭여행 & 가성비 여행 전문가 '알뜰 트래블러'입니다.
최소한의 예산으로 최대의 경험과 추억을 만드는 실속 있는 일정을 한국어로 제시합니다.
답변 스타일:
1. 대중교통 패스(지하철 패스, 1일권 등)를 활용한 동선 절약 팁을 최우선으로 알려줍니다.
2. 현지인들이 찾는 저렴하고 맛있는 로컬 노포 식당과 무료 입장 가능 명소를 적극 추천합니다.
3. 무료 전망대, 학생/청년/조기예약 할인, 숙소 위치 선정 팁 등 낭비 없는 알짜 정보를 구체적 비용과 함께 제시합니다.
4. 날짜별(Day 1, Day 2 등) 현실적인 스케줄과 절약 노하우를 명쾌하게 정리합니다.`,

  healing: `당신은 품격 있는 힐링과 감성 미식 여행을 디자인하는 '감성 트래블 큐레이터'입니다.
바쁜 빡빡한 일정 대신, 여유로운 휴식, 아름다운 풍경, 인스타그래머블한 감성 카페, 미슐랭/현지 평점 높은 미식 코스를 한국어로 추천합니다.
답변 스타일:
1. 하루에 2~3개 핵심 스팟만 여유롭게 즐길 수 있는 슬로우 트래블 일정을 제시합니다.
2. 아침 브런치 카페, 오후 채광이 좋은 명소나 미술관, 노을 뷰포인트, 분위기 좋은 저녁 다이닝바를 감각적으로 묘사합니다.
3. 사진 찍기 좋은 스팟과 시그니처 메뉴, 현지 분위기를 생생하게 설명합니다.`,

  express: `당신은 핵심만 빠르고 명쾌하게 요약해주는 '스피드 트래블 플래너'입니다.
복잡한 사족 없이 실천 가능한 핵심 일정과 필수 방문 코스만 빠르고 일목요연하게 불릿 포인트로 한국어로 전달합니다.
답변 스타일:
1. 짧고 간결한 핵심 요약 형식으로 작성합니다.
2. Day별 [오전 / 오후 / 저녁] 1줄 요약과 핵심 이동 수단만 압축 제시합니다.
3. 주의사항 및 필수 예약 3가지를 체크리스트 형태로 끝에 붙입니다.`,
};

// Available models allowed by spec
const ALLOWED_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

// Multi-turn chat API
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      persona = 'master',
      model = 'gemini-3.8-flash',
      customSystemInstruction,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '대화 메시지 목록이 비어 있습니다.' });
    }

    const selectedModel = ALLOWED_MODELS.includes(model) ? model : 'gemini-3.8-flash';
    const systemInstruction = customSystemInstruction || PERSONA_INSTRUCTIONS[persona] || PERSONA_INSTRUCTIONS.master;

    // Format messages for @google/genai
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const replyText = response.text || '';
    return res.json({
      text: replyText,
      modelUsed: selectedModel,
      persona,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Gemini API 호출 중 문제가 발생했습니다.',
    });
  }
});

// Structured Itinerary Extraction API (converts natural text into interactive day planner JSON)
app.post('/api/parse-itinerary', async (req, res) => {
  try {
    const { destination, daysCount, text } = req.body;

    const prompt = `다음 여행 정보나 대화 내용을 바탕으로 여행자가 직접 편집하고 관리할 수 있는 상세한 일정표 JSON을 생성해주세요.
목적지: ${destination || '요청된 목적지'}
일정 기간: ${daysCount ? `${daysCount}일` : '적정 기간'}
참고 내용:
${text}

반드시 JSON 스키마 규격에 맞게 반환하세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `당신은 여행 일정을 정형화된 JSON 데이터로 파싱하고 보강하는 데이터 엔지니어입니다.
모든 항목은 한국어로 작성하며 각 날짜(Day 1, Day 2 등)와 시간대(오전, 오후, 저녁, 야간), 장소명, 카테고리, 간단한 설명, 예상 비용(원화 또는 현지화), 이동 팁을 충실하게 작성하세요.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            totalEstimatedBudget: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        timeSlot: { type: Type.STRING }, // 오전, 오후, 저녁, 야간
                        time: { type: Type.STRING }, // 예: 09:30
                        placeName: { type: Type.STRING },
                        category: { type: Type.STRING }, // 관광, 맛집, 카페, 액티비티, 휴식, 쇼핑, 이동
                        description: { type: Type.STRING },
                        costEstimate: { type: Type.STRING },
                        transportTip: { type: Type.STRING },
                      },
                      required: ['timeSlot', 'placeName', 'category', 'description'],
                    },
                  },
                },
                required: ['dayNumber', 'title', 'activities'],
              },
            },
            suggestedPackingItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedFoods: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['destination', 'title', 'days'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json(parsedJson);
  } catch (error: any) {
    console.error('Parse Itinerary Error:', error);
    return res.status(500).json({
      error: error?.message || '일정표 변환 중 오류가 발생했습니다.',
    });
  }
});

// Quick Recommendations API (packing list / destination quick tips)
app.post('/api/destination-tips', async (req, res) => {
  try {
    const { destination, season = '현재' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${destination} 여행에 필요한 핵심 여행 팁, 날씨 및 복장 조언, 필수 준비물 5가지, 현지 에티켓 및 주의사항을 JSON으로 알려줘. (시즌: ${season})`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            weatherSummary: { type: Type.STRING },
            clothingAdvice: { type: Type.STRING },
            currencyAndPayment: { type: Type.STRING },
            mustPackItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            localEtiquette: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safetyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['destination', 'weatherSummary', 'clothingAdvice', 'mustPackItems'],
        },
      },
    });

    const tips = JSON.parse(response.text || '{}');
    return res.json(tips);
  } catch (error: any) {
    console.error('Destination Tips Error:', error);
    return res.status(500).json({ error: error?.message || '여행 팁 생성 실패' });
  }
});

// ===============================================
// Backend Data Storage & Persistence System
// ===============================================
import fs from 'fs';
import {
  INITIAL_ITINERARY,
  INITIAL_CHECKLIST,
  INITIAL_BUDGET,
  INITIAL_CHAT_MESSAGES,
} from './src/data/defaultData';

const DATA_DIR = path.resolve(__dirname, 'data');
const ITINERARY_FILE = path.resolve(DATA_DIR, 'itinerary.json');
const CHECKLIST_FILE = path.resolve(DATA_DIR, 'checklist.json');
const BUDGET_FILE = path.resolve(DATA_DIR, 'budget.json');
const CHAT_FILE = path.resolve(DATA_DIR, 'chat.json');
const BRIEFING_FILE = path.resolve(DATA_DIR, 'briefing.json');
const REVIEWS_FILE = path.resolve(DATA_DIR, 'reviews.json');

// Generic helper to load JSON file with default fallback
function loadJsonFile<T>(filePath: string, fallbackData: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
    // Write fallback if not exists
    fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf-8');
    return fallbackData;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallbackData;
  }
}

// Generic helper to save JSON file
function saveJsonFile<T>(filePath: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Load full application state from backend server files
app.get('/api/app-data', (_req, res) => {
  try {
    const itinerary = loadJsonFile(ITINERARY_FILE, INITIAL_ITINERARY);
    const checklist = loadJsonFile(CHECKLIST_FILE, INITIAL_CHECKLIST);
    const budget = loadJsonFile(BUDGET_FILE, INITIAL_BUDGET);
    const messages = loadJsonFile(CHAT_FILE, INITIAL_CHAT_MESSAGES);
    const briefing = loadJsonFile(BRIEFING_FILE, null);

    return res.json({
      itinerary,
      checklist,
      budget,
      messages,
      briefing,
      serverTime: Date.now(),
      persistedOnBackend: true,
    });
  } catch (err) {
    console.error('Error fetching backend app-data:', err);
    return res.status(500).json({ error: '백엔드 데이터 조회 실패' });
  }
});

// Update itinerary on backend server
app.post('/api/app-data/itinerary', (req, res) => {
  try {
    const { itinerary } = req.body;
    if (!itinerary) {
      return res.status(400).json({ error: '일정 데이터가 누락되었습니다.' });
    }
    saveJsonFile(ITINERARY_FILE, itinerary);
    return res.json({ success: true, savedAt: Date.now() });
  } catch (err) {
    console.error('Save itinerary error:', err);
    return res.status(500).json({ error: '일정 데이터 저장 실패' });
  }
});

// Update checklist on backend server
app.post('/api/app-data/checklist', (req, res) => {
  try {
    const { checklist } = req.body;
    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: '체크리스트 데이터가 올바르지 않습니다.' });
    }
    saveJsonFile(CHECKLIST_FILE, checklist);
    return res.json({ success: true, savedAt: Date.now() });
  } catch (err) {
    console.error('Save checklist error:', err);
    return res.status(500).json({ error: '체크리스트 저장 실패' });
  }
});

// Update budget on backend server
app.post('/api/app-data/budget', (req, res) => {
  try {
    const { budget } = req.body;
    if (!Array.isArray(budget)) {
      return res.status(400).json({ error: '예산 데이터가 올바르지 않습니다.' });
    }
    saveJsonFile(BUDGET_FILE, budget);
    return res.json({ success: true, savedAt: Date.now() });
  } catch (err) {
    console.error('Save budget error:', err);
    return res.status(500).json({ error: '예산 데이터 저장 실패' });
  }
});

// Update chat messages history on backend server
app.post('/api/app-data/chat', (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '대화 메시지 데이터가 올바르지 않습니다.' });
    }
    saveJsonFile(CHAT_FILE, messages);
    return res.json({ success: true, savedAt: Date.now() });
  } catch (err) {
    console.error('Save chat error:', err);
    return res.status(500).json({ error: '대화 기록 저장 실패' });
  }
});

// Update briefing report on backend server
app.post('/api/app-data/briefing', (req, res) => {
  try {
    const { briefing } = req.body;
    saveJsonFile(BRIEFING_FILE, briefing);
    return res.json({ success: true, savedAt: Date.now() });
  } catch (err) {
    console.error('Save briefing error:', err);
    return res.status(500).json({ error: '브리핑 저장 실패' });
  }
});

// Reset backend server state to initial defaults
app.post('/api/app-data/reset', (_req, res) => {
  try {
    saveJsonFile(ITINERARY_FILE, INITIAL_ITINERARY);
    saveJsonFile(CHECKLIST_FILE, INITIAL_CHECKLIST);
    saveJsonFile(BUDGET_FILE, INITIAL_BUDGET);
    saveJsonFile(CHAT_FILE, INITIAL_CHAT_MESSAGES);
    saveJsonFile(BRIEFING_FILE, null);
    return res.json({ success: true, resetAt: Date.now() });
  } catch (err) {
    console.error('Reset error:', err);
    return res.status(500).json({ error: '초기화 실패' });
  }
});

// ========================
// Community Reviews APIs
// ========================

// Initialize reviews file with default reviews if not existing
function loadReviews() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading reviews file:', err);
  }

  // Fallback defaults
  const defaults = [
    {
      id: 'rev-1',
      title: '도쿄 3박 4일 시부야스카이 & 골목 킷사텐 솔직 후기',
      destination: '도쿄 (Tokyo)',
      author: '민트라떼',
      rating: 5,
      travelDuration: '3박 4일',
      companion: '친구와',
      category: '명소 탐방',
      content: '시부야 스카이는 일몰 40분 전 타임으로 꼭 예약하고 가세요! 노을 지는 하늘부터 도쿄타워 불 켜지는 야경까지 한 번에 볼 수 있어서 입장료가 전혀 아깝지 않았습니다.\n그리고 긴자나 아사쿠사에서는 번화가 체인점보다 한적한 골목에 있는 오래된 킷사텐(전통 다방)에서 푸딩과 핸드드립 커피를 맛보시길 추천해요. 스이카는 아이폰 애플월렛에 미리 충전해두니 환승할 때 정말 편했습니다.',
      highlightTags: ['시부야스카이 노을 필수', '킷사텐 푸딩 강추', '애플월렛 스이카 편함'],
      likes: 42,
      comments: [
        {
          id: 'c-1-1',
          author: '떠나요둘이서',
          content: '시부야 스카이 일몰 시간대 예약 몇 주 전에 하셨나요? 꿀팁 감사해요!',
          createdAt: Date.now() - 3600000 * 24 * 2,
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
      content: '뚜벅이 혼자 여행으로 함덕과 구좌, 종달리 중심 코스를 다녀왔습니다. 급행버스 101번과 순환버스 201번 배차 간격만 카카오맵으로 잘 확인하면 렌트 없이도 여유롭게 다닐 수 있어요.\n특히 종달리 마을 골목의 독립서점들과 조용한 심야식당은 혼자 생각 정리하기에 최고의 장소였습니다. 함덕 서우봉 둘레길 아침 산책도 잊지 마세요!',
      highlightTags: ['혼행 추천', '종달리 골목길', '함덕 서우봉 아침 산책'],
      likes: 38,
      comments: [],
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
      content: '루브르보다 오르세 미술관이 동선도 편하고 인상주의 명작들이 가득해서 훨씬 감동적이었습니다. 목요일은 야간 개장이 있어 덜 붐비니 참고하세요!\n바게트 샌드위치와 와인 한 병 사서 샹드마르스 공원에서 에펠탑 보며 즐긴 피크닉이 이번 여행 최고의 순간이었어요. 다만 지하철 환승 통로에서 소매치기 항상 주의하세요.',
      highlightTags: ['오르세 목요 야간개장', '에펠탑 공원 피크닉', '소매치기 주의'],
      likes: 56,
      comments: [],
      createdAt: Date.now() - 3600000 * 24 * 6,
      itinerarySummary: '오르세 미술관 → 생제르맹데프레 카페 → 샹드마르스 에펠탑 피크닉',
    },
  ];

  saveReviews(defaults);
  return defaults;
}

function saveReviews(reviews: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reviews file:', err);
  }
}

// Get reviews with search, filter, and sorting
app.get('/api/reviews', (req, res) => {
  try {
    const { destination, category, sort = 'latest', search } = req.query;
    let reviews = loadReviews();

    if (destination && typeof destination === 'string' && destination !== 'all') {
      reviews = reviews.filter((r: any) =>
        r.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      reviews = reviews.filter((r: any) => r.category === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      reviews = reviews.filter(
        (r: any) =>
          r.title.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          (r.highlightTags && r.highlightTags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (sort === 'popular') {
      reviews.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
    } else if (sort === 'rating') {
      reviews.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    } else {
      // latest
      reviews.sort((a: any, b: any) => b.createdAt - a.createdAt);
    }

    return res.json(reviews);
  } catch (error: any) {
    console.error('Get Reviews Error:', error);
    return res.status(500).json({ error: '후기 목록 조회 실패' });
  }
});

// Create new travel review
app.post('/api/reviews', (req, res) => {
  try {
    const {
      title,
      destination,
      author = '익명 여행자',
      rating = 5,
      travelDuration = '자유 일정',
      companion = '혼자',
      category = '명소 탐방',
      content,
      highlightTags = [],
      itinerarySummary = '',
    } = req.body;

    if (!title || !destination || !content) {
      return res.status(400).json({ error: '제목, 여행지, 후기 내용은 필수 항목입니다.' });
    }

    const reviews = loadReviews();
    const newReview = {
      id: `rev-${Date.now()}`,
      title: title.trim(),
      destination: destination.trim(),
      author: author.trim() || '여행자',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      travelDuration,
      companion,
      category,
      content: content.trim(),
      highlightTags: Array.isArray(highlightTags) ? highlightTags : [],
      likes: 0,
      comments: [],
      createdAt: Date.now(),
      itinerarySummary: itinerarySummary.trim(),
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    return res.status(201).json(newReview);
  } catch (error: any) {
    console.error('Create Review Error:', error);
    return res.status(500).json({ error: '후기 등록 실패' });
  }
});

// Like review
app.post('/api/reviews/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const reviews = loadReviews();
    const review = reviews.find((r: any) => r.id === id);

    if (!review) {
      return res.status(404).json({ error: '후기를 찾을 수 없습니다.' });
    }

    review.likes = (review.likes || 0) + 1;
    saveReviews(reviews);

    return res.json({ id, likes: review.likes });
  } catch (error: any) {
    console.error('Like Review Error:', error);
    return res.status(500).json({ error: '좋아요 반영 실패' });
  }
});

// Add comment to review
app.post('/api/reviews/:id/comments', (req, res) => {
  try {
    const { id } = req.params;
    const { author = '익명 여행자', content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }

    const reviews = loadReviews();
    const review = reviews.find((r: any) => r.id === id);

    if (!review) {
      return res.status(404).json({ error: '후기를 찾을 수 없습니다.' });
    }

    if (!Array.isArray(review.comments)) {
      review.comments = [];
    }

    const newComment = {
      id: `c-${Date.now()}`,
      author: author.trim() || '여행자',
      content: content.trim(),
      createdAt: Date.now(),
    };

    review.comments.push(newComment);
    saveReviews(reviews);

    return res.status(201).json(review);
  } catch (error: any) {
    console.error('Comment Error:', error);
    return res.status(500).json({ error: '댓글 등록 실패' });
  }
});

// AI Review Assistant: Polish draft and suggest highlight tags & itinerary summary
app.post('/api/reviews/ai-refine', async (req, res) => {
  try {
    const { draft, destination } = req.body;

    if (!draft) {
      return res.status(400).json({ error: '후기 초안을 입력해주세요.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `여행지: ${destination || '미정'}
초안 내용:
${draft}

위 여행 후기 초안을 한국어로 더 생생하고 가독성 높게 다듬어주고, 핵심 장점 태그 3개와 추천 동선 요약을 JSON으로 작성해주세요.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedContent: { type: Type.STRING, description: '매끄럽고 읽기 쉽게 정돈된 후기 본문' },
            suggestedTitle: { type: Type.STRING, description: '매력적인 후기 제목' },
            highlightTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '핵심 꿀팁 키워드 3가지 (예: 노을 맛집, 예약 필수 등)',
            },
            itinerarySummary: {
              type: Type.STRING,
              description: '후기에서 추천하는 핵심 동선 요약 (예: A → B → C)',
            },
          },
          required: ['refinedContent', 'suggestedTitle', 'highlightTags'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('AI Refine Error:', error);
    return res.status(500).json({ error: 'AI 후기 보정 중 오류가 발생했습니다.' });
  }
});

// AI Community Review Digest: Summarize traveler community sentiment for a destination
app.post('/api/reviews/ai-summary', async (req, res) => {
  try {
    const { destination } = req.body;
    const reviews = loadReviews();
    const targetReviews = destination
      ? reviews.filter((r: any) => r.destination.toLowerCase().includes(destination.toLowerCase()))
      : reviews;

    const reviewTexts = targetReviews
      .slice(0, 8)
      .map((r: any) => `[${r.destination} - 평점 ${r.rating}점 / ${r.title}]: ${r.content}`)
      .join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `다음은 여행자들이 작성한 실제 여행 후기들입니다:
${reviewTexts}

이 후기들을 바탕으로 '${destination || '전체 여행지'}'에 대한 종합 여행자 인사이트를 JSON으로 요약해주세요.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            averageTone: { type: Type.STRING, description: '여행자들의 전반적인 만족도 평가 요약' },
            topPraisedSpots: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '후기에서 가장 호평받은 스팟/음식 3~4가지',
            },
            commonWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '여행자들이 주의하라고 당부한 팁/주의사항 2~3가지',
            },
          },
          required: ['destination', 'averageTone', 'topPraisedSpots', 'commonWarnings'],
        },
      },
    });

    const summary = JSON.parse(response.text || '{}');
    return res.json(summary);
  } catch (error: any) {
    console.error('AI Summary Error:', error);
    return res.status(500).json({ error: '커뮤니티 요약 생성 실패' });
  }
});

// ============================================
// Executive Travel Briefing Report Generation
// ============================================
app.post('/api/generate-briefing', async (req, res) => {
  try {
    const { itinerary, budget = [], checklist = [] } = req.body;

    if (!itinerary || !itinerary.destination) {
      return res.status(400).json({ error: '일정 정보가 필요합니다.' });
    }

    const totalDays = itinerary.days ? itinerary.days.length : 1;
    const totalActivities = (itinerary.days || []).reduce(
      (sum: number, d: any) => sum + (d.activities ? d.activities.length : 0),
      0
    );

    const budgetSummary = budget
      .map((b: any) => `${b.category}: ${b.amount} ${b.currency} (${b.title})`)
      .join(', ');

    const checkedItemsCount = checklist.filter((c: any) => c.checked).length;
    const checklistSummary = `총 ${checklist.length}개 준비물 중 ${checkedItemsCount}개 완료`;

    const dayOverviews = (itinerary.days || [])
      .map((d: any) => {
        const route = (d.activities || [])
          .map((a: any) => `${a.time ? `[${a.time}]` : ''}${a.placeName}(${a.category})`)
          .join(' → ');
        return `Day ${d.dayNumber} [${d.title}]: ${route}`;
      })
      .join('\n');

    const prompt = `여행지: ${itinerary.destination}
여행 타이틀: ${itinerary.title}
총 기간: ${totalDays}일 (총 ${totalActivities}개 활동 계획됨)
예산 현황: ${budgetSummary || '등록된 예산 없음'}
준비물 진행률: ${checklistSummary}

상세 일정 흐름:
${dayOverviews}

위 여행의 전체 일정과 예산, 준비 상황을 종합하여 여행자가 한눈에 파악할 수 있는 최고급 '여행 총괄 브리핑 리포트'를 JSON으로 작성해주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripThemeTitle: {
              type: Type.STRING,
              description: '매력적인 총괄 여행 테마 타이틀 (예: 도쿄 감성 미식 3박 4일 총괄 브리핑)',
            },
            executiveSummary: {
              type: Type.STRING,
              description: '전체 여행의 핵심 매력과 여정 흐름을 요약한 2~3줄 총평',
            },
            paceRating: {
              type: Type.STRING,
              description: '전체 일정 페이스 평가 (예: 적절한 밸런스 페이스, 여유로운 힐링 페이스, 고밀도 탐방 페이스)',
            },
            paceDescription: {
              type: Type.STRING,
              description: '동선 이동 거리와 체력 소모도를 분석한 페이스 설명 및 휴식 안배 조언',
            },
            dailyHighlights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayTitle: { type: Type.STRING },
                  coreRoute: { type: Type.STRING, description: '주요 핵심 이동 코스 1줄 요약' },
                  tip: { type: Type.STRING, description: '이 날짜의 핵심 포인트 꿀팁 1문장' },
                },
                required: ['dayNumber', 'dayTitle', 'coreRoute', 'tip'],
              },
            },
            budgetAssessment: {
              type: Type.STRING,
              description: '등록된 예산 항목들의 적정성과 현지 절약 팁 평가',
            },
            preparationStatus: {
              type: Type.STRING,
              description: '체크리스트 기반 준비 상황 진단 및 출국 전 꼭 확인할 사항',
            },
            topRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '이 여행을 200% 즐기기 위한 절대 놓치지 말아야 할 3가지 꿀팁',
            },
          },
          required: [
            'tripThemeTitle',
            'executiveSummary',
            'paceRating',
            'paceDescription',
            'dailyHighlights',
            'budgetAssessment',
            'preparationStatus',
            'topRecommendations',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.generatedAt = Date.now();
    return res.json(parsed);
  } catch (error: any) {
    console.error('Generate Briefing Error:', error);
    return res.status(500).json({ error: '브리핑 리포트 생성 중 오류가 발생했습니다.' });
  }
});

// Mounting Vite in development or serving static build in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TravelMate AI Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

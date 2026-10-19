import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  CalendarPlus,
  Loader2,
  Compass,
  Wallet,
  Coffee,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, PersonaType, ModelType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PERSONA_METADATA } from '../data/defaultData';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  selectedPersona: PersonaType;
  setSelectedPersona: (persona: PersonaType) => void;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  onConvertToItinerary: (messageContent: string) => void;
  onClearChat: () => void;
}

const QUICK_PROMPTS = [
  {
    title: '도쿄 3박 4일 감성 미식',
    prompt: '도쿄 3박 4일 감성 카페와 로컬 맛집 중심의 뚜벅이 여행 일정을 시간대별로 자세히 짜줘.',
  },
  {
    title: '제주도 2박 3일 힐링 드라이브',
    prompt: '제주도 2박 3일 렌터카 드라이브 코스로 오션뷰 카페와 힐링 숲길 중심 일정을 계획해줘.',
  },
  {
    title: '오사카·교토 3박 4일 알짜',
    prompt: '오사카와 교토 3박 4일 일정으로 유니버설 스튜디오 재팬과 교토 전통 사찰을 효율적으로 돌아보는 동선 알려줘.',
  },
  {
    title: '파리 5박 6일 예술 & 랜드마크',
    prompt: '파리 5박 6일 루브르, 오르세 등 핵심 미술관과 센 강 유람선, 에펠탑 피크닉을 포함한 추천 코스 짜줘.',
  },
  {
    title: '방콕 4박 5일 가성비 호캉스',
    prompt: '방콕 4박 5일 가성비 5성급 호텔 호캉스와 야시장, 마사지, 왓아룬 뷰 다이닝 중심 코스 추천해줘.',
  },
  {
    title: '비 오는 날 대체 실내 코스',
    prompt: '비 오는 날 여행지에서 즐길 수 있는 매력적인 실내 복합문화공간 및 힐링 코스를 추천해줘.',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedPersona,
  setSelectedPersona,
  selectedModel,
  setSelectedModel,
  onConvertToItinerary,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPersonaIcon = (p: PersonaType) => {
    switch (p) {
      case 'budget':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'healing':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'express':
        return <Zap className="w-4 h-4 text-purple-600" />;
      default:
        return <Compass className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* Persona bar & Quick control header */}
      <div className="py-2.5 px-3 border-b border-slate-200 bg-slate-50/70 rounded-t-xl mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">플래너 모드:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            {(['master', 'budget', 'healing', 'express'] as PersonaType[]).map((p) => {
              const meta = PERSONA_METADATA[p];
              const isSelected = selectedPersona === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPersona(p)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={meta.desc}
                >
                  {getPersonaIcon(p)}
                  <span className="hidden sm:inline">{meta.name}</span>
                  <span className="sm:hidden">{meta.name.slice(0, 3)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <span>엔진:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelType)}
              className="bg-white border border-slate-200 text-slate-700 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-teal-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
            </select>
          </div>

          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
            title="대화 기록 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">초기화</span>
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white border-x border-slate-200">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs mt-1 text-teal-700">
                  <Compass className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-2xl sm:max-w-3xl rounded-2xl p-4 sm:p-5 transition-shadow ${
                  isUser
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-teal-700">트래블메이트 AI</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500">
                        {message.personaUsed ? PERSONA_METADATA[message.personaUsed]?.roleTag : '스마트 여행 플래너'}
                      </span>
                    </div>
                    {message.modelUsed && (
                      <span className="font-mono text-[10px] text-slate-400">
                        {message.modelUsed}
                      </span>
                    )}
                  </div>
                )}

                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-100">
                    {message.content}
                  </p>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}

                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => onConvertToItinerary(message.content)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs"
                      title="이 일정 추천을 인터랙티브 일정표 탭으로 불러옵니다"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-teal-700" />
                      <span>📅 인터랙티브 일정표로 변환하기</span>
                    </button>

                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                      title="메시지 복사"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1 text-xs font-bold">
                  나
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs mt-1 text-teal-700">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-600 shadow-2xs flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-800">
                  {PERSONA_METADATA[selectedPersona].name}가 맞춤형 여행 코스를 분석하고 있습니다...
                </p>
                <p className="text-[11px] text-slate-400">
                  동선 효율화, 현지 맛집, 시간대별 예상 비용을 종합 중입니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      <div className="bg-slate-50 border-x border-slate-200 px-4 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5 font-medium">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>추천 여행 질문:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(item.prompt);
                inputRef.current?.focus();
              }}
              className="text-xs text-slate-700 hover:text-teal-900 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-md px-2.5 py-1 whitespace-nowrap transition-colors shadow-2xs shrink-0"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border border-slate-200 rounded-b-xl p-3 sm:p-4 mb-3 shadow-sm">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="어디로 떠나고 싶으신가요? (예: 파리 5박 6일 예술과 카페 중심 여행 코스 짜줘 / Enter로 전송)"
            rows={2}
            className="w-full resize-none p-3 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all leading-relaxed"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="메시지 전송"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 px-1">
          <span>Shift + Enter 로 줄바꿈 · Enter 로 전송</span>
          <span>다중 턴(Multi-turn) 기억 유지</span>
        </div>
      </div>
    </div>
  );
};

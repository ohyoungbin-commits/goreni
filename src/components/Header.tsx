import React from 'react';
import {
  Compass,
  Calendar,
  CheckSquare,
  Wallet,
  MessageSquare,
  Sparkles,
  Share2,
  ChevronDown,
  Users,
  FileText,
  Database,
} from 'lucide-react';
import { ActiveTab, PersonaType, ModelType } from '../types';
import { PERSONA_METADATA } from '../data/defaultData';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPersona: PersonaType;
  setSelectedPersona: (persona: PersonaType) => void;
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  onExport: () => void;
  destinationName?: string;
  isSavingToServer?: boolean;
  onSaveNow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedPersona,
  setSelectedPersona,
  selectedModel,
  setSelectedModel,
  onExport,
  destinationName,
  isSavingToServer = false,
  onSaveNow,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                트래블메이트 AI
              </span>
              {destinationName && (
                <span className="hidden sm:inline text-xs text-slate-500 font-medium border-l border-slate-200 pl-2">
                  {destinationName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-tight hidden md:block">
              스마트 여행 일정 & 플래닝 가이드
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI 플래너 챗</span>
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'itinerary'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>상세 일정표</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">준비물 </span>체크리스트
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'budget'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>예산 가계부</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>여행 커뮤니티</span>
          </button>

          <button
            onClick={() => setActiveTab('briefing')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'briefing'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>내 여행 브리핑</span>
          </button>
        </nav>

        {/* Zone 3: Controls & Action */}
        <div className="flex items-center gap-2">
          {/* Persona selector */}
          <div className="relative group hidden lg:block">
            <label className="sr-only">챗봇 페르소나 선택</label>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{PERSONA_METADATA[selectedPersona].name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value as PersonaType)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="여행 플래너 스타일 선택"
            >
              <option value="master">종합 여행 플래너 (균형/동선 최적화)</option>
              <option value="budget">가성비 배낭여행 (알뜰 경비/꿀팁)</option>
              <option value="healing">감성 힐링 & 미식 (슬로우/감성 스팟)</option>
              <option value="express">초고속 요약 플래너 (스피드 요약)</option>
            </select>
          </div>

          {/* Model selector */}
          <div className="relative hidden xl:block">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ModelType)}
              className="text-xs bg-white border border-slate-200 text-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              title="Gemini 모델 선택"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (기본 권장)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (표준 플래시)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (초고속)</option>
            </select>
          </div>

          {/* Backend Server Sync Indicator */}
          <button
            onClick={onSaveNow}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            title="클릭 시 백엔드 서버에 즉시 전체 저장"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSavingToServer ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="hidden md:inline">
              {isSavingToServer ? '서버 저장 중...' : '백엔드 저장됨'}
            </span>
          </button>

          {/* Export button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap shadow-xs"
            title="일정 공유 및 텍스트 내보내기"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">일정 공유</span>
          </button>
        </div>
      </div>
    </header>
  );
};

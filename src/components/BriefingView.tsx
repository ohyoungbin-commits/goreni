import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Wallet,
  CheckSquare,
  Clock,
  Printer,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import {
  ItineraryPlan,
  BudgetItem,
  ChecklistItem,
  TravelBriefingReport,
} from '../types';

interface BriefingViewProps {
  itinerary: ItineraryPlan;
  budget: BudgetItem[];
  checklist: ChecklistItem[];
  briefing: TravelBriefingReport | null;
  onGenerateBriefing: () => Promise<void>;
  isLoading: boolean;
}

export const BriefingView: React.FC<BriefingViewProps> = ({
  itinerary,
  budget,
  checklist,
  briefing,
  onGenerateBriefing,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute live metrics
  const totalDays = itinerary.days ? itinerary.days.length : 0;
  const allActivities = itinerary.days
    ? itinerary.days.flatMap((d) => d.activities || [])
    : [];
  const completedActivities = allActivities.filter((a) => a.completed).length;
  const activityProgress =
    allActivities.length > 0
      ? Math.round((completedActivities / allActivities.length) * 100)
      : 0;

  // Currency rate map for rough sum
  const RATES: Record<string, number> = {
    KRW: 1,
    JPY: 9.1,
    USD: 1380,
    EUR: 1500,
  };

  const totalSpentKrw = budget.reduce(
    (sum, b) => sum + Math.round(b.amount * (RATES[b.currency] || 1)),
    0
  );

  const completedChecklist = checklist.filter((c) => c.checked).length;
  const checklistPercent =
    checklist.length > 0
      ? Math.round((completedChecklist / checklist.length) * 100)
      : 0;

  // Default fallback briefing if not generated yet
  const displayBriefing: TravelBriefingReport = briefing || {
    tripThemeTitle: `${itinerary.destination} 맞춤형 여행 총괄 브리핑`,
    executiveSummary:
      itinerary.summary ||
      `${itinerary.destination}의 대표 명소와 로컬 미식을 조화롭게 안배한 ${totalDays}일간의 실속 여정입니다. 주요 동선이 권역별로 효율적으로 구성되어 체력 소모를 최소화하면서도 알찬 경험을 선사합니다.`,
    paceRating: '적절한 밸런스 페이스',
    paceDescription:
      '오전 1개, 오후 1~2개, 저녁 1개 스팟으로 하루 이동 거리가 쾌적하며, 충분한 식사 및 카페 휴식 시간이 확보된 최적의 밸런스형 코스입니다.',
    dailyHighlights: (itinerary.days || []).map((d) => ({
      dayNumber: d.dayNumber,
      dayTitle: d.title,
      coreRoute:
        (d.activities || []).map((a) => a.placeName).slice(0, 3).join(' → ') ||
        '자유 탐방 코스',
      tip:
        d.activities?.[0]?.transportTip ||
        '대중교통 패스를 사전 준비하여 환승 대기를 줄이세요.',
    })),
    budgetAssessment: `총 계획 지출액 ${totalSpentKrw.toLocaleString()}원으로, 숙박과 식비 및 교통비 비중이 안정적으로 분배되어 있습니다. 현지 카드 결제가 불가한 로컬 식당을 대비해 소액 현금을 준비하세요.`,
    preparationStatus: `총 ${checklist.length}개 준비물 중 ${completedChecklist}개 준비 완료(${checklistPercent}%). 여권 만료일과 필수 전자기기 변환 플러그를 최종 점검하세요.`,
    topRecommendations: [
      '인기 전망대 및 주요 명소는 최소 일주일 전 사전 예약 필수',
      '도보 이동이 많은 일정이므로 발이 편안한 워킹화 착용 권장',
      '현지 모바일 교통카드(애플페이 등) 사전 등록으로 시간 절약',
    ],
    generatedAt: Date.now(),
  };

  const handleCopyReport = () => {
    const reportText = `[트래블메이트 AI - 여행 총괄 브리핑 리포트]
📍 목적지: ${itinerary.destination} (${totalDays}일 여정)
📌 타이틀: ${displayBriefing.tripThemeTitle}

📊 핵심 지표:
- 총 계획 일정: ${allActivities.length}개 스팟 (방문 완료: ${completedActivities}개)
- 총 예산 계획: ${totalSpentKrw.toLocaleString()}원
- 준비물 점검율: ${checklistPercent}% (${completedChecklist}/${checklist.length} 완료)
- 추천 여행 페이스: ${displayBriefing.paceRating}

📝 총평 & 동선 분석:
${displayBriefing.executiveSummary}
${displayBriefing.paceDescription}

📅 일자별 핵심 동선:
${displayBriefing.dailyHighlights
  .map(
    (h) => `- Day ${h.dayNumber} [${h.dayTitle}]: ${h.coreRoute}\n  꿀팁: ${h.tip}`
  )
  .join('\n')}

💰 예산 평가:
${displayBriefing.budgetAssessment}

🎒 준비 상황 진단:
${displayBriefing.preparationStatus}

💡 핵심 추천 꿀팁:
${displayBriefing.topRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Briefing Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI 종합 여행 인텔리전스 리포트</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              내 여행 종합 브리핑
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              전체 여행 일정, 예산 계획, 준비물 완료율을 교차 분석하여 한눈에 확인하는 총괄 리포트 카드입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onGenerateBriefing}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs disabled:bg-slate-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI 분석 브리핑 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 브리핑 실시간 분석/갱신</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              title="브리핑 전문 복사"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>리포트 복사</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              title="리포트 인쇄 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>인쇄/PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Core KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Tile 1: Itinerary Spots */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>계획 일정 규모</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {totalDays}일 여정
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {allActivities.length}개 스팟
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
              <span>완료: {completedActivities}개</span>
              <span className="font-semibold text-teal-700">{activityProgress}%</span>
            </div>
          </div>

          {/* Tile 2: Total Budget */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>총 계획 지출액</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {budget.length}개 항목
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {totalSpentKrw.toLocaleString()}원
            </div>
            <div className="text-[11px] text-emerald-700 font-medium pt-0.5 truncate">
              {itinerary.totalEstimatedBudget || '적정 예산 관리 중'}
            </div>
          </div>

          {/* Tile 3: Checklist Readiness */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>짐싸기 준비율</span>
              </span>
              <span className="text-[11px] font-mono text-purple-700 font-bold">
                {checklistPercent}%
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {completedChecklist} / {checklist.length}개
            </div>
            <div className="text-[11px] text-slate-500 pt-0.5">
              {checklistPercent >= 80 ? '출국 준비 거의 완료!' : '체크리스트 점검 필요'}
            </div>
          </div>

          {/* Tile 4: Pace Rating */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>여행 페이스 지수</span>
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">최적화됨</span>
            </div>
            <div className="text-lg font-bold text-slate-900 truncate">
              {displayBriefing.paceRating}
            </div>
            <div className="text-[11px] text-slate-500 pt-0.5 truncate">
              체력 소모 대비 만족도 최고
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Narrative Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              {displayBriefing.tripThemeTitle}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {new Date(displayBriefing.generatedAt).toLocaleDateString('ko-KR')} 브리핑
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {displayBriefing.executiveSummary}
        </p>

        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-teal-900 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            <span>동선 효율성 및 페이스 진단:</span>
          </span>
          <p className="text-teal-950 leading-relaxed">
            {displayBriefing.paceDescription}
          </p>
        </div>
      </div>

      {/* Daily Highlights Quick Roadmap */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>일자별 핵심 동선 로드맵 (Daily Highlights)</span>
          </h3>
          <span className="text-xs text-slate-400">총 {totalDays}일 코스</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayBriefing.dailyHighlights.map((highlight) => (
            <div
              key={highlight.dayNumber}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-teal-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold text-teal-800 bg-teal-100">
                  Day {highlight.dayNumber}
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
                  {highlight.dayTitle}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400">주요 흐름:</span>
                <p className="text-xs font-medium text-slate-900 leading-snug">
                  {highlight.coreRoute}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 flex items-start gap-1.5">
                <span className="text-amber-500 font-bold shrink-0">TIP</span>
                <span className="leading-tight">{highlight.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Analysis Columns: Budget, Preparation, Top Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Budget Analysis */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>예산 효율성 종합 진단</span>
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            {displayBriefing.budgetAssessment}
          </p>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>총 지출액:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {totalSpentKrw.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>항목 수:</span>
              <span className="font-mono font-medium text-slate-900">
                {budget.length}개 품목
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Preparation Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-purple-600" />
            <span>출국 준비 상황 진단</span>
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            {displayBriefing.preparationStatus}
          </p>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>체크리스트 완료:</span>
              <span className="font-mono font-bold text-purple-700 tabular-nums">
                {completedChecklist} / {checklist.length} ({checklistPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full"
                style={{ width: `${checklistPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Column 3: Top Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>핵심 여행 꿀팁 3가지</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {displayBriefing.topRecommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-600 font-bold shrink-0">{i + 1}.</span>
                <span className="leading-snug">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

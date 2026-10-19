import React, { useState } from 'react';
import { Copy, Check, Printer, X, Download } from 'lucide-react';
import { ItineraryPlan } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: ItineraryPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  itinerary,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownSummary = () => {
    let md = `# ✈️ ${itinerary.title}\n\n`;
    md += `**목적지:** ${itinerary.destination}\n`;
    if (itinerary.summary) md += `**개요:** ${itinerary.summary}\n`;
    if (itinerary.totalEstimatedBudget)
      md += `**예상 1인 경비:** ${itinerary.totalEstimatedBudget}\n\n`;
    md += `---\n\n`;

    itinerary.days.forEach((day) => {
      md += `### 📅 Day ${day.dayNumber}: ${day.title}\n`;
      if (day.theme) md += `*테마: ${day.theme}*\n\n`;

      day.activities.forEach((act) => {
        const timeStr = act.time ? `[${act.time}] ` : '';
        md += `- **${timeStr}${act.placeName}** (${act.category})\n`;
        md += `  - 설명: ${act.description}\n`;
        if (act.transportTip) md += `  - 이동: ${act.transportTip}\n`;
        if (act.costEstimate) md += `  - 예상비용: ${act.costEstimate}\n`;
      });
      md += `\n`;
    });

    if (itinerary.recommendedFoods && itinerary.recommendedFoods.length > 0) {
      md += `### 🍜 추천 현지 음식\n`;
      itinerary.recommendedFoods.forEach((food) => {
        md += `- ${food}\n`;
      });
      md += `\n`;
    }

    if (
      itinerary.suggestedPackingItems &&
      itinerary.suggestedPackingItems.length > 0
    ) {
      md += `### 🎒 필수 준비물 팁\n`;
      itinerary.suggestedPackingItems.forEach((item) => {
        md += `- ${item}\n`;
      });
    }

    return md;
  };

  const handleCopyText = () => {
    const text = generateMarkdownSummary();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const text = generateMarkdownSummary();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${itinerary.destination.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_여행일정.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            여행 일정 공유 및 내보내기
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          완성된 여행 일정을 텍스트로 복사하거나 텍스트 파일 저장, 인쇄하여 동행자와 공유하세요.
        </p>

        {/* Text Preview Box */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-700 max-h-72">
          {generateMarkdownSummary()}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF 저장</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>텍스트 파일 다운로드</span>
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>클립보드 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>전체 내용 클립보드 복사</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

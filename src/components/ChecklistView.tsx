import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  FileText,
  Smartphone,
  Shirt,
  Pill,
  Package,
} from 'lucide-react';
import { ChecklistItem } from '../types';

interface ChecklistViewProps {
  items: ChecklistItem[];
  destination: string;
  onUpdateItems: (items: ChecklistItem[]) => void;
  onFetchAiTips?: () => Promise<void>;
  isAiLoading?: boolean;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  items,
  destination,
  onUpdateItems,
  onFetchAiTips,
  isAiLoading,
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('필수 서류/금융');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['필수 서류/금융', '전자기기', '의류/잡화', '상비약/위생', '기타'];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case '필수 서류/금융':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case '전자기기':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case '의류/잡화':
        return <Shirt className="w-4 h-4 text-teal-600" />;
      case '상비약/위생':
        return <Pill className="w-4 h-4 text-rose-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  const completedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleItem = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
    onUpdateItems(updated);
  };

  const deleteItem = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `c-${Date.now()}`,
      category: selectedCategory,
      text: newItemText.trim(),
      checked: false,
    };

    onUpdateItems([...items, newItem]);
    setNewItemText('');
  };

  const handleResetChecklist = () => {
    if (confirm('모든 준비물 체크를 해제하시겠습니까?')) {
      onUpdateItems(items.map((i) => ({ ...i, checked: false })));
    }
  };

  const displayedItems = items.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
              <CheckSquare className="w-4 h-4" />
              <span>{destination} 여행 짐싸기 가이드</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              여행 준비물 체크리스트
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              빠트리기 쉬운 필수 서류, 전자제품, 비상약을 꼼꼼하게 점검하세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onFetchAiTips && (
              <button
                onClick={onFetchAiTips}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{isAiLoading ? 'AI 분석 중...' : '목적지 맞춤 팁 자동추가'}</span>
              </button>
            )}

            <button
              onClick={handleResetChecklist}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="체크 전체 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">
              준비 완료 상태 ({completedCount}/{totalCount})
            </span>
            <span className="text-teal-700 tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent === 100 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>모든 여행 준비물이 완벽하게 준비되었습니다! 안심하고 떠나세요 🎉</span>
            </div>
          )}
        </div>
      </div>

      {/* Add New Item Form */}
      <form
        onSubmit={handleAddItem}
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row gap-2"
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="새로 챙길 물품 입력 (예: 방수팩, 여행용 목베개)"
          className="flex-1 text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>준비물 추가</span>
        </button>
      </form>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          전체 ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Checklist Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        {displayedItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            해당 카테고리에 등록된 준비물이 없습니다.
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3.5 sm:px-5 hover:bg-slate-50/70 transition-colors ${
                item.checked ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-3 text-left flex-1 min-w-0"
              >
                {item.checked ? (
                  <CheckSquare className="w-5 h-5 text-teal-600 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-slate-500 shrink-0" />
                )}
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      item.checked ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="text-slate-300 hover:text-rose-500 p-1.5 rounded transition-colors ml-2"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

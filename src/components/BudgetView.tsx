import React, { useState } from 'react';
import {
  Wallet,
  DollarSign,
  Plus,
  Trash2,
  PieChart,
  Plane,
  Building,
  Utensils,
  Bus,
  Ticket,
  ShoppingBag,
  CircleDollarSign,
} from 'lucide-react';
import { BudgetItem } from '../types';

interface BudgetViewProps {
  items: BudgetItem[];
  destination: string;
  onUpdateItems: (items: BudgetItem[]) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  items,
  destination,
  onUpdateItems,
}) => {
  const [targetBudget, setTargetBudget] = useState<number>(1500000);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newCategory, setNewCategory] = useState<BudgetItem['category']>('식비');
  const [newCurrency, setNewCurrency] = useState<BudgetItem['currency']>('KRW');

  // Simple exchange rates relative to KRW for unified sum
  const RATES: Record<string, number> = {
    KRW: 1,
    JPY: 9.1, // 1 JPY ≈ 9.1 KRW
    USD: 1380, // 1 USD ≈ 1380 KRW
    EUR: 1500, // 1 EUR ≈ 1500 KRW
  };

  const getAmountInKrw = (amount: number, currency: BudgetItem['currency']) => {
    return Math.round(amount * (RATES[currency] || 1));
  };

  const totalSpentKrw = items.reduce(
    (sum, item) => sum + getAmountInKrw(item.amount, item.currency),
    0
  );

  const remainingBudget = targetBudget - totalSpentKrw;
  const spentPercent = targetBudget > 0 ? Math.min(Math.round((totalSpentKrw / targetBudget) * 100), 100) : 0;

  const getCategoryIcon = (cat: BudgetItem['category']) => {
    switch (cat) {
      case '항공':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case '숙박':
        return <Building className="w-4 h-4 text-indigo-600" />;
      case '식비':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case '교통':
        return <Bus className="w-4 h-4 text-emerald-600" />;
      case '액티비티':
        return <Ticket className="w-4 h-4 text-rose-600" />;
      case '쇼핑':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      default:
        return <CircleDollarSign className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newItem: BudgetItem = {
      id: `b-${Date.now()}`,
      title: newTitle.trim(),
      amount: parsedAmount,
      currency: newCurrency,
      category: newCategory,
    };

    onUpdateItems([...items, newItem]);
    setNewTitle('');
    setNewAmount('');
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
  };

  // Category totals
  const categoryTotals: Record<string, number> = {};
  items.forEach((item) => {
    const krw = getAmountInKrw(item.amount, item.currency);
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + krw;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
              <Wallet className="w-4 h-4" />
              <span>{destination} 여행 경비 시뮬레이터</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              여행 가계부 및 예산 계산기
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              목표 예산 대비 항목별 지출 계획을 세우고 똑똑하게 지출을 관리하세요.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">목표 예산:</span>
            <input
              type="number"
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              step={50000}
              className="text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 w-32 text-right tabular-nums focus:ring-1 focus:ring-teal-500"
            />
            <span className="text-xs font-semibold text-slate-700">원</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">총 계획 지출액</span>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
              {totalSpentKrw.toLocaleString()}원
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">
              {remainingBudget >= 0 ? '남은 예산 여유금' : '예산 초과액'}
            </span>
            <div
              className={`text-xl font-bold mt-1 tabular-nums font-mono ${
                remainingBudget >= 0 ? 'text-teal-700' : 'text-rose-600'
              }`}
            >
              {remainingBudget >= 0 ? '+' : ''}
              {remainingBudget.toLocaleString()}원
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">예산 소진율</span>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
              {spentPercent}%
            </div>
          </div>
        </div>

        {/* Spending Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                spentPercent > 90 ? 'bg-amber-500' : 'bg-teal-600'
              }`}
              style={{ width: `${spentPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      <form
        onSubmit={handleAddItem}
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-5 gap-2"
      >
        <div className="sm:col-span-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="지출 항목명 (예: 오사카 주유패스 2일권, 저녁 스시)"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as BudgetItem['category'])}
            className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2.5"
          >
            <option value="항공">항공</option>
            <option value="숙박">숙박</option>
            <option value="식비">식비</option>
            <option value="교통">교통</option>
            <option value="액티비티">액티비티</option>
            <option value="쇼핑">쇼핑</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="flex gap-1">
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="금액"
            className="w-2/3 text-xs border border-slate-200 rounded-lg p-2.5 tabular-nums focus:ring-1 focus:ring-teal-500"
            required
          />
          <select
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value as BudgetItem['currency'])}
            className="w-1/3 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1"
          >
            <option value="KRW">KRW</option>
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full h-full min-h-[38px] px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>항목 추가</span>
          </button>
        </div>
      </form>

      {/* Category Breakdown & Item List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Breakdown List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-teal-600" />
            <span>카테고리별 지출 요약</span>
          </h2>

          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([cat, total]) => {
              const pct = totalSpentKrw > 0 ? Math.round((total / totalSpentKrw) * 100) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                      {getCategoryIcon(cat as BudgetItem['category'])}
                      <span>{cat}</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-900 font-semibold">
                      {total.toLocaleString()}원 ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Items List */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
          <div className="bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>등록된 지출 내역 ({items.length}건)</span>
            <span className="text-slate-400 font-normal">환율 기준 자동 환산</span>
          </div>

          {items.map((item) => {
            const krw = getAmountInKrw(item.amount, item.currency);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {item.title}
                    </div>
                    <span className="text-[11px] text-slate-400">{item.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {item.amount.toLocaleString()} {item.currency}
                    </div>
                    {item.currency !== 'KRW' && (
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        ≈ {krw.toLocaleString()}원
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded transition-colors"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

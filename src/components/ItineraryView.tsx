import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Camera,
  Coffee,
  ShoppingBag,
  Bus,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Edit2,
  Sparkles,
  Share2,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ItineraryPlan, ItineraryActivity, ItineraryDay } from '../types';

interface ItineraryViewProps {
  itinerary: ItineraryPlan;
  onUpdateItinerary: (newPlan: ItineraryPlan) => void;
  onAskAiToModify: (prompt: string) => void;
  onExport: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onUpdateItinerary,
  onAskAiToModify,
  onExport,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingActivity, setEditingActivity] = useState<{
    dayNumber: number;
    activity: ItineraryActivity;
  } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<number | null>(null); // dayNumber where adding
  const [newActivityForm, setNewActivityForm] = useState<Partial<ItineraryActivity>>({
    timeSlot: '오전',
    time: '10:00',
    placeName: '',
    category: '관광',
    description: '',
    costEstimate: '',
    transportTip: '',
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '맛집':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case '카페':
        return <Coffee className="w-3.5 h-3.5 text-orange-600" />;
      case '관광':
        return <Camera className="w-3.5 h-3.5 text-blue-600" />;
      case '쇼핑':
        return <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />;
      case '이동':
        return <Bus className="w-3.5 h-3.5 text-slate-600" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const toggleActivityComplete = (dayNumber: number, activityId: string) => {
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.map((act) =>
          act.id === activityId ? { ...act, completed: !act.completed } : act
        ),
      };
    });
    onUpdateItinerary({ ...itinerary, days: updatedDays });
  };

  const handleDeleteActivity = (dayNumber: number, activityId: string) => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.filter((act) => act.id !== activityId),
      };
    });
    onUpdateItinerary({ ...itinerary, days: updatedDays });
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    const { dayNumber, activity } = editingActivity;
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.map((act) => (act.id === activity.id ? activity : act)),
      };
    });
    onUpdateItinerary({ ...itinerary, days: updatedDays });
    setEditingActivity(null);
  };

  const handleCreateNewActivity = (dayNumber: number) => {
    if (!newActivityForm.placeName?.trim()) return;

    const newAct: ItineraryActivity = {
      id: `act-${Date.now()}`,
      timeSlot: newActivityForm.timeSlot || '오전',
      time: newActivityForm.time || '10:00',
      placeName: newActivityForm.placeName || '',
      category: newActivityForm.category || '관광',
      description: newActivityForm.description || '',
      costEstimate: newActivityForm.costEstimate || '',
      transportTip: newActivityForm.transportTip || '',
      completed: false,
    };

    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: [...day.activities, newAct],
      };
    });

    onUpdateItinerary({ ...itinerary, days: updatedDays });
    setIsAddingNew(null);
    setNewActivityForm({
      timeSlot: '오전',
      time: '10:00',
      placeName: '',
      category: '관광',
      description: '',
      costEstimate: '',
      transportTip: '',
    });
  };

  const handleAddDay = () => {
    const nextDayNum = itinerary.days.length + 1;
    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum} 여정`,
      theme: '자유 일정 & 탐방',
      activities: [],
    };
    onUpdateItinerary({
      ...itinerary,
      days: [...itinerary.days, newDay],
    });
    setSelectedDayNumber(nextDayNum);
  };

  const displayedDays = itinerary.days.filter((day) => {
    if (selectedDayNumber === 'all') return true;
    return day.dayNumber === selectedDayNumber;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Trip Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold tracking-wide">
              <span>{itinerary.destination}</span>
              <span className="text-slate-300">·</span>
              <span>총 {itinerary.days.length}일 코스</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {itinerary.title}
            </h1>
            {itinerary.summary && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {itinerary.summary}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() =>
                onAskAiToModify(
                  `${itinerary.destination} ${itinerary.days.length}일 일정에서 2일차 오후 일정을 다른 특색 있는 명소나 카페로 바꾸고 싶어.`
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI로 일정 다듬기</span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>공유 / 내보내기</span>
            </button>
          </div>
        </div>

        {/* Estimated Budget Summary Bar */}
        {itinerary.totalEstimatedBudget && (
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">예상 1인 경비:</span>
              <span className="font-medium text-emerald-700">{itinerary.totalEstimatedBudget}</span>
            </div>
            <div className="text-slate-400">
              * 현지 상황 및 환율에 따라 달라질 수 있습니다.
            </div>
          </div>
        )}
      </div>

      {/* Day Selector & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Day Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDayNumber('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedDayNumber === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            전체 일정 보기
          </button>
          {itinerary.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedDayNumber === day.dayNumber
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
          <button
            onClick={handleAddDay}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap"
            title="새 날짜 추가"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>날짜 추가</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">분류:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 text-slate-700 rounded-md px-2 py-1 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">전체 카테고리</option>
            <option value="관광">관광</option>
            <option value="맛집">맛집</option>
            <option value="카페">카페</option>
            <option value="액티비티">액티비티</option>
            <option value="쇼핑">쇼핑</option>
            <option value="이동">이동</option>
          </select>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-8">
        {displayedDays.map((day) => {
          const filteredActivities = day.activities.filter((act) => {
            if (categoryFilter === 'all') return true;
            return act.category === categoryFilter;
          });

          return (
            <div
              key={day.dayNumber}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Day Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    D{day.dayNumber}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Day {day.dayNumber}. {day.title}
                    </h2>
                    {day.theme && (
                      <span className="text-xs text-slate-500 font-normal">
                        테마: {day.theme}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    활동 {day.activities.length}개
                  </span>
                  <button
                    onClick={() => setIsAddingNew(day.dayNumber)}
                    className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 border border-slate-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>활동 추가</span>
                  </button>
                </div>
              </div>

              {/* Activities Timeline */}
              <div className="p-4 sm:p-6 space-y-4">
                {filteredActivities.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    등록된 일정이 없습니다. 우측 상단의 '+ 활동 추가' 버튼을 눌러 새 일정을 계획해보세요.
                  </div>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className={`group relative flex items-start gap-3 sm:gap-4 p-4 rounded-xl border transition-all ${
                        act.completed
                          ? 'bg-slate-50/60 border-slate-200 opacity-70'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Checkbox toggle */}
                      <button
                        onClick={() => toggleActivityComplete(day.dayNumber, act.id)}
                        className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors shrink-0"
                        title={act.completed ? '미방문으로 변경' : '방문 완료로 표시'}
                      >
                        {act.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content Area */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {act.time && (
                            <span className="text-xs font-semibold text-slate-700 tabular-nums flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {act.time}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">[{act.timeSlot}]</span>

                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {getCategoryIcon(act.category)}
                            <span>{act.category}</span>
                          </span>

                          <h3
                            className={`text-sm sm:text-base font-bold text-slate-900 truncate ${
                              act.completed ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {act.placeName}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {act.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          {act.transportTip && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Bus className="w-3.5 h-3.5 text-teal-600" />
                              <span>{act.transportTip}</span>
                            </div>
                          )}
                          {act.costEstimate && (
                            <div className="flex items-center gap-1 text-emerald-700 font-medium">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>{act.costEstimate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            setEditingActivity({
                              dayNumber: day.dayNumber,
                              activity: { ...act },
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="일정 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(day.dayNumber, act.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="일정 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Inline Add New Form */}
                {isAddingNew === day.dayNumber && (
                  <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
                    <div className="text-xs font-bold text-teal-900">
                      Day {day.dayNumber} 새 활동 추가
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          시간대 / 시간
                        </label>
                        <div className="flex gap-1">
                          <select
                            value={newActivityForm.timeSlot}
                            onChange={(e) =>
                              setNewActivityForm({ ...newActivityForm, timeSlot: e.target.value })
                            }
                            className="text-xs bg-white border border-slate-200 rounded p-1.5 w-1/2"
                          >
                            <option value="오전">오전</option>
                            <option value="오후">오후</option>
                            <option value="저녁">저녁</option>
                            <option value="야간">야간</option>
                          </select>
                          <input
                            type="text"
                            placeholder="10:00"
                            value={newActivityForm.time}
                            onChange={(e) =>
                              setNewActivityForm({ ...newActivityForm, time: e.target.value })
                            }
                            className="text-xs bg-white border border-slate-200 rounded p-1.5 w-1/2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          장소/일정 이름 *
                        </label>
                        <input
                          type="text"
                          placeholder="예: 센소지 사찰 & 나카미세"
                          value={newActivityForm.placeName}
                          onChange={(e) =>
                            setNewActivityForm({ ...newActivityForm, placeName: e.target.value })
                          }
                          className="text-xs bg-white border border-slate-200 rounded p-1.5 w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          카테고리
                        </label>
                        <select
                          value={newActivityForm.category}
                          onChange={(e) =>
                            setNewActivityForm({ ...newActivityForm, category: e.target.value })
                          }
                          className="text-xs bg-white border border-slate-200 rounded p-1.5 w-full"
                        >
                          <option value="관광">관광</option>
                          <option value="맛집">맛집</option>
                          <option value="카페">카페</option>
                          <option value="액티비티">액티비티</option>
                          <option value="쇼핑">쇼핑</option>
                          <option value="휴식">휴식</option>
                          <option value="이동">이동</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">
                        상세 설명 및 방문 팁
                      </label>
                      <input
                        type="text"
                        placeholder="예: 갓 구운 닌교야키 시식 및 향로 연기로 소원 빌기"
                        value={newActivityForm.description}
                        onChange={(e) =>
                          setNewActivityForm({ ...newActivityForm, description: e.target.value })
                        }
                        className="text-xs bg-white border border-slate-200 rounded p-1.5 w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          이동 팁
                        </label>
                        <input
                          type="text"
                          placeholder="예: 긴자선 아사쿠사역 도보 5분"
                          value={newActivityForm.transportTip}
                          onChange={(e) =>
                            setNewActivityForm({ ...newActivityForm, transportTip: e.target.value })
                          }
                          className="text-xs bg-white border border-slate-200 rounded p-1.5 w-full"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          예상 비용
                        </label>
                        <input
                          type="text"
                          placeholder="예: 무료입장 / 간식비 1,000엔"
                          value={newActivityForm.costEstimate}
                          onChange={(e) =>
                            setNewActivityForm({ ...newActivityForm, costEstimate: e.target.value })
                          }
                          className="text-xs bg-white border border-slate-200 rounded p-1.5 w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsAddingNew(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleCreateNewActivity(day.dayNumber)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs"
                      >
                        저장하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Foods and Packing from AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {itinerary.recommendedFoods && itinerary.recommendedFoods.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>AI 추천 현지 미식 리스트</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {itinerary.recommendedFoods.map((food, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">·</span>
                  <span>{food}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {itinerary.suggestedPackingItems && itinerary.suggestedPackingItems.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              <span>이 여행 맞춤 준비물 조언</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {itinerary.suggestedPackingItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">활동 상세 수정</h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">시간대</label>
                  <select
                    value={editingActivity.activity.timeSlot}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, timeSlot: e.target.value },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  >
                    <option value="오전">오전</option>
                    <option value="오후">오후</option>
                    <option value="저녁">저녁</option>
                    <option value="야간">야간</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">구체적 시간</label>
                  <input
                    type="text"
                    value={editingActivity.activity.time || ''}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, time: e.target.value },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">장소명</label>
                <input
                  type="text"
                  value={editingActivity.activity.placeName}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      activity: { ...editingActivity.activity, placeName: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">카테고리</label>
                <select
                  value={editingActivity.activity.category}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      activity: { ...editingActivity.activity, category: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                >
                  <option value="관광">관광</option>
                  <option value="맛집">맛집</option>
                  <option value="카페">카페</option>
                  <option value="액티비티">액티비티</option>
                  <option value="쇼핑">쇼핑</option>
                  <option value="휴식">휴식</option>
                  <option value="이동">이동</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">설명 및 팁</label>
                <textarea
                  rows={3}
                  value={editingActivity.activity.description}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      activity: { ...editingActivity.activity, description: e.target.value },
                    })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">이동 팁</label>
                  <input
                    type="text"
                    value={editingActivity.activity.transportTip || ''}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, transportTip: e.target.value },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">예상 비용</label>
                  <input
                    type="text"
                    value={editingActivity.activity.costEstimate || ''}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        activity: { ...editingActivity.activity, costEstimate: e.target.value },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  변경사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

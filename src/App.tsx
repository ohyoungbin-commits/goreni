import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ItineraryView } from './components/ItineraryView';
import { ChecklistView } from './components/ChecklistView';
import { BudgetView } from './components/BudgetView';
import { CommunityView } from './components/CommunityView';
import { BriefingView } from './components/BriefingView';
import { ExportModal } from './components/ExportModal';
import {
  ActiveTab,
  ChatMessage,
  PersonaType,
  ModelType,
  ItineraryPlan,
  ChecklistItem,
  BudgetItem,
  TravelReview,
  TravelBriefingReport,
} from './types';
import {
  INITIAL_CHAT_MESSAGES,
  INITIAL_ITINERARY,
  INITIAL_CHECKLIST,
  INITIAL_BUDGET,
} from './data/defaultData';
import { INITIAL_REVIEWS } from './data/defaultReviews';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('master');
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTipLoading, setIsAiTipLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Persistent or default state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('tm_chat_messages');
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  const [itinerary, setItinerary] = useState<ItineraryPlan>(() => {
    try {
      const saved = localStorage.getItem('tm_itinerary');
      return saved ? JSON.parse(saved) : INITIAL_ITINERARY;
    } catch {
      return INITIAL_ITINERARY;
    }
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('tm_checklist');
      return saved ? JSON.parse(saved) : INITIAL_CHECKLIST;
    } catch {
      return INITIAL_CHECKLIST;
    }
  });

  const [budget, setBudget] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem('tm_budget');
      return saved ? JSON.parse(saved) : INITIAL_BUDGET;
    } catch {
      return INITIAL_BUDGET;
    }
  });

  const [reviews, setReviews] = useState<TravelReview[]>(() => {
    try {
      const saved = localStorage.getItem('tm_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [briefing, setBriefing] = useState<TravelBriefingReport | null>(() => {
    try {
      const saved = localStorage.getItem('tm_briefing');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);

  // Load state from backend server on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch('/api/app-data');
        if (res.ok) {
          const data = await res.json();
          if (data.itinerary && data.itinerary.destination) {
            setItinerary(data.itinerary);
          }
          if (Array.isArray(data.checklist) && data.checklist.length > 0) {
            setChecklist(data.checklist);
          }
          if (Array.isArray(data.budget) && data.budget.length > 0) {
            setBudget(data.budget);
          }
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(data.messages);
          }
          if (data.briefing) {
            setBriefing(data.briefing);
          }
        }
      } catch (err) {
        console.warn('Backend load failed, using local cache:', err);
      }
    };

    fetchBackendData();
  }, []);

  // Fetch reviews from server on mount
  useEffect(() => {
    const fetchServerReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setReviews(data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch reviews from server, using local fallback:', err);
      }
    };
    fetchServerReviews();
  }, []);

  // Backend save functions
  const saveItineraryToServer = (plan: ItineraryPlan) => {
    setIsSavingToServer(true);
    fetch('/api/app-data/itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary: plan }),
    })
      .catch((e) => console.warn('Backend save itinerary failed:', e))
      .finally(() => setIsSavingToServer(false));
  };

  const saveChecklistToServer = (items: ChecklistItem[]) => {
    setIsSavingToServer(true);
    fetch('/api/app-data/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: items }),
    })
      .catch((e) => console.warn('Backend save checklist failed:', e))
      .finally(() => setIsSavingToServer(false));
  };

  const saveBudgetToServer = (items: BudgetItem[]) => {
    setIsSavingToServer(true);
    fetch('/api/app-data/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: items }),
    })
      .catch((e) => console.warn('Backend save budget failed:', e))
      .finally(() => setIsSavingToServer(false));
  };

  const saveChatToServer = (msgs: ChatMessage[]) => {
    setIsSavingToServer(true);
    fetch('/api/app-data/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs }),
    })
      .catch((e) => console.warn('Backend save chat failed:', e))
      .finally(() => setIsSavingToServer(false));
  };

  const saveBriefingToServer = (b: TravelBriefingReport) => {
    setIsSavingToServer(true);
    fetch('/api/app-data/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefing: b }),
    })
      .catch((e) => console.warn('Backend save briefing failed:', e))
      .finally(() => setIsSavingToServer(false));
  };

  const updateItinerary = (newPlan: ItineraryPlan) => {
    setItinerary(newPlan);
    saveItineraryToServer(newPlan);
  };

  const updateChecklist = (items: ChecklistItem[]) => {
    setChecklist(items);
    saveChecklistToServer(items);
  };

  const updateBudget = (items: BudgetItem[]) => {
    setBudget(items);
    saveBudgetToServer(items);
  };

  const handleSaveAllNow = async () => {
    setIsSavingToServer(true);
    try {
      await Promise.all([
        fetch('/api/app-data/itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itinerary }),
        }),
        fetch('/api/app-data/checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checklist }),
        }),
        fetch('/api/app-data/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget }),
        }),
        fetch('/api/app-data/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
        }),
        briefing
          ? fetch('/api/app-data/briefing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ briefing }),
            })
          : Promise.resolve(),
      ]);
      showToast('☁️ 모든 여행 데이터가 백엔드 서버에 성공적으로 동기화 저장되었습니다!');
    } catch (e) {
      showError('백엔드 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsSavingToServer(false);
    }
  };

  // Sync to localStorage as local mirror
  useEffect(() => {
    try {
      localStorage.setItem('tm_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_itinerary', JSON.stringify(itinerary));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [itinerary]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_checklist', JSON.stringify(checklist));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [checklist]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_budget', JSON.stringify(budget));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [budget]);

  useEffect(() => {
    try {
      localStorage.setItem('tm_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      if (briefing) {
        localStorage.setItem('tm_briefing', JSON.stringify(briefing));
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [briefing]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Send message in multi-turn chat
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send conversation history to backend Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: selectedPersona,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `서버 오류 (${response.status})`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || '죄송합니다. 답변을 생성하지 못했습니다.',
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
        personaUsed: selectedPersona,
      };

      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      saveChatToServer(updatedMessages);
    } catch (error: any) {
      console.error('Chat error:', error);
      showError(error?.message || '답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert AI message text to structured interactive itinerary
  const handleConvertToItinerary = async (messageContent: string) => {
    setIsLoading(true);
    showToast('AI가 일정을 분석하여 인터랙티브 일정표로 변환하는 중입니다...');

    try {
      const res = await fetch('/api/parse-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: itinerary.destination,
          text: messageContent,
        }),
      });

      if (!res.ok) {
        throw new Error('일정표 변환 실패');
      }

      const parsedPlan: ItineraryPlan = await res.json();

      // Ensure ids are assigned
      if (parsedPlan && parsedPlan.days) {
        parsedPlan.days = parsedPlan.days.map((day, dIdx) => ({
          ...day,
          activities: (day.activities || []).map((act, aIdx) => ({
            ...act,
            id: act.id || `act-parsed-${dIdx}-${aIdx}-${Date.now()}`,
            completed: false,
          })),
        }));

        updateItinerary(parsedPlan);
        setActiveTab('itinerary');
        showToast('🎉 새로운 여행 일정이 백엔드 서버에 성공적으로 동기화되었습니다!');

        // If AI suggested packing items, merge with checklist
        if (parsedPlan.suggestedPackingItems && parsedPlan.suggestedPackingItems.length > 0) {
          const newChecklistItems: ChecklistItem[] = parsedPlan.suggestedPackingItems.map(
            (item, idx) => ({
              id: `c-ai-${Date.now()}-${idx}`,
              category: '의류/잡화',
              text: item,
              checked: false,
            })
          );
          updateChecklist([...newChecklistItems, ...checklist]);
        }
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      showError('일정표 변환 중 문제가 발생했습니다. 일반 텍스트로 계속 확인하실 수 있습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch destination tips to auto-populate checklist
  const handleFetchAiTips = async () => {
    setIsAiTipLoading(true);
    try {
      const res = await fetch('/api/destination-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: itinerary.destination,
        }),
      });

      if (!res.ok) throw new Error('팁 불러오기 실패');

      const data = await res.json();
      if (data.mustPackItems && Array.isArray(data.mustPackItems)) {
        const added: ChecklistItem[] = data.mustPackItems.map((text: string, i: number) => ({
          id: `tip-${Date.now()}-${i}`,
          category: '필수 서류/금융',
          text,
          checked: false,
        }));
        updateChecklist([...added, ...checklist]);
        showToast(`${itinerary.destination} 맞춤 준비물이 백엔드 서버에 저장되었습니다.`);
      }
    } catch (e: any) {
      showError(e?.message || '팁을 가져오지 못했습니다.');
    } finally {
      setIsAiTipLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('대화 기록을 모두 지우고 초기화하시겠습니까?')) {
      setMessages(INITIAL_CHAT_MESSAGES);
      saveChatToServer(INITIAL_CHAT_MESSAGES);
      showToast('대화 기록이 초기화되었습니다.');
    }
  };

  const handleAskAiToModify = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  // Community review handlers
  const handleAddReview = async (reviewData: Partial<TravelReview>) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (!res.ok) throw new Error('후기 저장 실패');
      const savedReview = await res.json();
      setReviews((prev) => [savedReview, ...prev]);
      showToast('🎉 여행 후기가 성공적으로 등록되었습니다!');
    } catch (e: any) {
      // optimistic fallback
      const fallbackReview: TravelReview = {
        id: `rev-${Date.now()}`,
        title: reviewData.title || '',
        destination: reviewData.destination || '',
        author: reviewData.author || '익명 여행자',
        rating: reviewData.rating || 5,
        travelDuration: reviewData.travelDuration || '자유 일정',
        companion: reviewData.companion || '혼자',
        category: reviewData.category || '명소 탐방',
        content: reviewData.content || '',
        highlightTags: reviewData.highlightTags || [],
        likes: 0,
        comments: [],
        createdAt: Date.now(),
        itinerarySummary: reviewData.itinerarySummary || '',
      };
      setReviews((prev) => [fallbackReview, ...prev]);
      showToast('🎉 여행 후기가 등록되었습니다!');
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              likes: r.likedByMe ? Math.max(0, r.likes - 1) : r.likes + 1,
              likedByMe: !r.likedByMe,
            }
          : r
      )
    );

    try {
      await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' });
    } catch (e) {
      console.warn('Like failed:', e);
    }
  };

  const handleAddComment = async (reviewId: string, author: string, content: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
        showToast('댓글이 등록되었습니다.');
        return;
      }
    } catch (e) {
      console.warn('Comment api failed, fallback to local:', e);
    }

    const newComment = {
      id: `c-${Date.now()}`,
      author: author || '여행자',
      content,
      createdAt: Date.now(),
    };
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, comments: [...(r.comments || []), newComment] }
          : r
      )
    );
    showToast('댓글이 등록되었습니다.');
  };

  const handleApplyReviewToPlanner = (review: TravelReview) => {
    setActiveTab('chat');
    const prompt = `${review.destination} 여행 후기 '[${review.title}]'에서 추천된 코스(${review.itinerarySummary || review.content.slice(0, 100)})를 바탕으로, 내 여행 일정에 반영할 수 있는 추천 상세 스케줄을 짜줘!`;
    handleSendMessage(prompt);
  };

  // Generate executive travel briefing report
  const handleGenerateBriefing = async () => {
    setIsBriefingLoading(true);
    showToast('AI가 전체 일정과 예산, 준비 상황을 종합 분석하는 중입니다...');

    try {
      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          budget,
          checklist,
        }),
      });

      if (!res.ok) {
        throw new Error('브리핑 리포트 생성 실패');
      }

      const reportData: TravelBriefingReport = await res.json();
      setBriefing(reportData);
      saveBriefingToServer(reportData);
      showToast('🎉 AI 여행 종합 브리핑 리포트가 성공적으로 완성되었습니다!');
    } catch (e: any) {
      console.error(e);
      showError(e?.message || '브리핑 리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsBriefingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4 text-white shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Global Loading Overlay (for Itinerary conversion) */}
      {isLoading && activeTab !== 'chat' && (
        <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-800">
              여행 일정표를 구성하는 중입니다...
            </span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPersona={selectedPersona}
        setSelectedPersona={setSelectedPersona}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onExport={() => setIsExportOpen(true)}
        destinationName={itinerary.destination}
        isSavingToServer={isSavingToServer}
        onSaveNow={handleSaveAllNow}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            selectedPersona={selectedPersona}
            setSelectedPersona={setSelectedPersona}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onConvertToItinerary={handleConvertToItinerary}
            onClearChat={handleClearChat}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryView
            itinerary={itinerary}
            onUpdateItinerary={updateItinerary}
            onAskAiToModify={handleAskAiToModify}
            onExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistView
            items={checklist}
            destination={itinerary.destination}
            onUpdateItems={updateChecklist}
            onFetchAiTips={handleFetchAiTips}
            isAiLoading={isAiTipLoading}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            items={budget}
            destination={itinerary.destination}
            onUpdateItems={updateBudget}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            reviews={reviews}
            onAddReview={handleAddReview}
            onLikeReview={handleLikeReview}
            onAddComment={handleAddComment}
            onApplyReviewToPlanner={handleApplyReviewToPlanner}
            currentDestination={itinerary.destination}
          />
        )}

        {activeTab === 'briefing' && (
          <BriefingView
            itinerary={itinerary}
            budget={budget}
            checklist={checklist}
            briefing={briefing}
            onGenerateBriefing={handleGenerateBriefing}
            isLoading={isBriefingLoading}
          />
        )}
      </main>

      {/* Export & Share Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        itinerary={itinerary}
      />
    </div>
  );
}

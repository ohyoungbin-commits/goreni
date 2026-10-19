import React, { useState } from 'react';
import {
  Users,
  Star,
  Heart,
  MessageCircle,
  Sparkles,
  Search,
  PenSquare,
  Share2,
  Calendar,
  Send,
  Loader2,
  X,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { TravelReview } from '../types';

interface CommunityViewProps {
  reviews: TravelReview[];
  onAddReview: (reviewData: Partial<TravelReview>) => Promise<void>;
  onLikeReview: (reviewId: string) => Promise<void>;
  onAddComment: (reviewId: string, author: string, content: string) => Promise<void>;
  onApplyReviewToPlanner: (review: TravelReview) => void;
  currentDestination?: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  reviews,
  onAddReview,
  onLikeReview,
  onAddComment,
  onApplyReviewToPlanner,
  currentDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');

  // Modal states
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, { author: string; content: string }>>({});

  // AI Refine in Write Modal
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [aiRefineTip, setAiRefineTip] = useState<string | null>(null);

  // AI Community Summary state
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState<{
    destination: string;
    averageTone: string;
    topPraisedSpots: string[];
    commonWarnings: string[];
  } | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // New review form state
  const [formData, setFormData] = useState({
    title: '',
    destination: currentDestination || '도쿄 (Tokyo)',
    author: '',
    rating: 5,
    travelDuration: '3박 4일',
    companion: '친구와',
    category: '명소 탐방',
    content: '',
    highlightTags: [] as string[],
    newTagInput: '',
    itinerarySummary: '',
  });

  // Extract distinct destinations
  const destinations = ['all', ...Array.from(new Set(reviews.map((r) => r.destination)))];
  const categories = ['all', '명소 탐방', '미식/맛집', '숙소/호텔', '여행 꿀팁', '액티비티'];

  // Filter & Sort
  const filteredReviews = reviews
    .filter((r) => {
      if (selectedDestination !== 'all' && !r.destination.toLowerCase().includes(selectedDestination.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchContent = r.content.toLowerCase().includes(q);
        const matchDest = r.destination.toLowerCase().includes(q);
        const matchTags = r.highlightTags && r.highlightTags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchDest && !matchTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return b.createdAt - a.createdAt;
    });

  // Toggle comments accordion
  const toggleComments = (reviewId: string) => {
    setExpandedComments((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  // Submit comment
  const handleCommentSubmit = async (reviewId: string) => {
    const data = commentInputs[reviewId];
    if (!data || !data.content.trim()) return;

    await onAddComment(reviewId, data.author || '익명 여행자', data.content.trim());
    setCommentInputs((prev) => ({
      ...prev,
      [reviewId]: { author: data.author, content: '' },
    }));
  };

  // AI Refine review text
  const handleAiRefine = async () => {
    if (!formData.content.trim()) {
      alert('먼저 후기 초안을 몇 줄 작성해 주세요.');
      return;
    }

    setIsAiRefining(true);
    setAiRefineTip(null);

    try {
      const res = await fetch('/api/reviews/ai-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: formData.content,
          destination: formData.destination,
        }),
      });

      if (!res.ok) throw new Error('AI 보정 요청 실패');
      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : data.suggestedTitle,
        content: data.refinedContent || prev.content,
        highlightTags: Array.from(new Set([...prev.highlightTags, ...(data.highlightTags || [])])),
        itinerarySummary: data.itinerarySummary || prev.itinerarySummary,
      }));

      setAiRefineTip('✨ AI가 후기 문맥을 다듬고 꿀팁 키워드와 추천 동선을 추가했습니다!');
    } catch (err) {
      console.error(err);
      alert('AI 후기 보정 중 오류가 발생했습니다.');
    } finally {
      setIsAiRefining(false);
    }
  };

  // AI Community Summary for a destination
  const handleFetchCommunitySummary = async () => {
    setIsSummaryLoading(true);
    setIsSummaryModalOpen(true);

    try {
      const targetDest = selectedDestination !== 'all' ? selectedDestination : currentDestination || '도쿄';
      const res = await fetch('/api/reviews/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: targetDest }),
      });

      if (!res.ok) throw new Error('요약 실패');
      const summary = await res.json();
      setAiSummaryData(summary);
    } catch (err) {
      console.error(err);
      alert('커뮤니티 요약 불러오기 실패');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!formData.newTagInput.trim()) return;
    if (!formData.highlightTags.includes(formData.newTagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        highlightTags: [...prev.highlightTags, prev.newTagInput.trim()],
        newTagInput: '',
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      highlightTags: prev.highlightTags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.destination.trim() || !formData.content.trim()) {
      alert('제목, 여행지, 후기 본문은 필수 입력 사항입니다.');
      return;
    }

    await onAddReview({
      title: formData.title,
      destination: formData.destination,
      author: formData.author || '익명 여행자',
      rating: formData.rating,
      travelDuration: formData.travelDuration,
      companion: formData.companion,
      category: formData.category,
      content: formData.content,
      highlightTags: formData.highlightTags,
      itinerarySummary: formData.itinerarySummary,
    });

    setIsWriteModalOpen(false);
    setFormData({
      title: '',
      destination: currentDestination || '도쿄 (Tokyo)',
      author: '',
      rating: 5,
      travelDuration: '3박 4일',
      companion: '친구와',
      category: '명소 탐방',
      content: '',
      highlightTags: [],
      newTagInput: '',
      itinerarySummary: '',
    });
    setAiRefineTip(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
              <Users className="w-4 h-4" />
              <span>실시간 여행자 피드백 & 꿀팁 커뮤니티</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              여행지 생생 후기 커뮤니티
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              실제 여행자들이 경험한 숨은 명소, 맛집 솔직 평점, 예약 꿀팁을 나누고 내 일정에 바로 담아보세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFetchCommunitySummary}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI 여행지 후기 종합분석</span>
            </button>

            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>내 여행 후기 작성하기</span>
            </button>
          </div>
        </div>

        {/* Community Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500">누적 여행 후기</span>
            <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums font-mono">
              {reviews.length}편
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500">평균 만족도</span>
            <div className="text-base font-bold text-amber-600 mt-0.5 tabular-nums font-mono flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>
                {(reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5.0
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500">인기 여행지</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              도쿄, 제주, 파리, 오사카
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-slate-500">여행자 추천 꿀팁</span>
            <div className="text-sm font-bold text-teal-700 mt-0.5">
              일정표 원클릭 연동 지원
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="여행지, 명소, 키워드 검색 (예: 시부야스카이, 뚜벅이, 킷사텐, 오픈런)"
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-xs text-slate-500 font-medium">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500"
            >
              <option value="latest">최신순</option>
              <option value="popular">추천/좋아요순</option>
              <option value="rating">평점 높은순</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Destination tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>도시:</span>
            </span>
            {destinations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDestination(d)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedDestination === d
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {d === 'all' ? '전체 도시' : d}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-teal-100 text-teal-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {c === 'all' ? '전체 카테고리' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Review Feed List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm text-slate-500">
              조건에 맞는 여행 후기가 없습니다. 첫 번째 후기를 남겨보세요!
            </p>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-2xs"
            >
              후기 작성하기
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isCommentsOpen = !!expandedComments[review.id];
            const commentCount = review.comments ? review.comments.length : 0;
            const currentComment = commentInputs[review.id] || { author: '', content: '' };

            return (
              <article
                key={review.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Review Header: User info & Meta */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                      {review.author ? review.author[0] : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{review.author}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{review.companion}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {review.travelDuration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-teal-700 font-medium mt-0.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>{review.destination}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{review.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-md shrink-0">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-900 tabular-nums">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Title & Content */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {review.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>

                {/* Highlight Tags */}
                {review.highlightTags && review.highlightTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {review.highlightTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommended Itinerary Route Snippet & Link to Planner */}
                {review.itinerarySummary && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        📍 작성자 추천 여행 코스:
                      </span>
                      <p className="font-medium text-slate-800">{review.itinerarySummary}</p>
                    </div>

                    <button
                      onClick={() => onApplyReviewToPlanner(review)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 rounded-lg transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
                      title="이 후기 추천 코스를 바탕으로 AI 일정표 생성/수정 요청"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>이 코스 일정에 담기</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Footer Controls: Like, Comment, Date */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {/* Like button */}
                    <button
                      onClick={() => onLikeReview(review.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                        review.likedByMe
                          ? 'text-rose-600 bg-rose-50 font-medium'
                          : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${review.likedByMe ? 'fill-rose-600' : ''}`}
                      />
                      <span className="tabular-nums">{review.likes}</span>
                    </button>

                    {/* Comments toggle */}
                    <button
                      onClick={() => toggleComments(review.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>댓글 {commentCount}개</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                {/* Comments Section Accordion */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/50 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-700">
                      댓글 목록 ({commentCount})
                    </h4>

                    {commentCount === 0 ? (
                      <p className="text-xs text-slate-400 py-1">
                        아직 댓글이 없습니다. 첫 질문이나 응원 댓글을 남겨보세요!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {review.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">
                                {comment.author}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-slate-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write comment form */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="닉네임"
                        value={currentComment.author}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [review.id]: {
                              ...currentComment,
                              author: e.target.value,
                            },
                          }))
                        }
                        className="w-24 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="궁금한 점이나 응원 댓글을 입력하세요..."
                        value={currentComment.content}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [review.id]: {
                              ...currentComment,
                              content: e.target.value,
                            },
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(review.id);
                        }}
                        className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(review.id)}
                        disabled={!currentComment.content?.trim()}
                        className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PenSquare className="w-5 h-5 text-teal-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  생생 여행 후기 작성
                </h2>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReviewSubmit} className="space-y-4">
              {/* Destination & Duration & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    여행지 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 도쿄 (Tokyo), 제주도"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    여행 기간
                  </label>
                  <input
                    type="text"
                    placeholder="예: 3박 4일, 당일치기"
                    value={formData.travelDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, travelDuration: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    별점 평가
                  </label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formData.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">
                      {formData.rating}점
                    </span>
                  </div>
                </div>
              </div>

              {/* Companion & Category & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    동행자
                  </label>
                  <select
                    value={formData.companion}
                    onChange={(e) =>
                      setFormData({ ...formData, companion: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="혼자">혼자</option>
                    <option value="친구와">친구와</option>
                    <option value="연인과">연인과</option>
                    <option value="가족과">가족과</option>
                    <option value="아이와">아이와</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    주요 카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="명소 탐방">명소 탐방</option>
                    <option value="미식/맛집">미식/맛집</option>
                    <option value="숙소/호텔">숙소/호텔</option>
                    <option value="여행 꿀팁">여행 꿀팁</option>
                    <option value="액티비티">액티비티</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    작성자 닉네임
                  </label>
                  <input
                    type="text"
                    placeholder="익명 여행자"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  후기 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 시부야 스카이 일몰 예약 성공 꿀팁 및 긴자 카페 투어"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium"
                />
              </div>

              {/* Content with AI Refine Assistant */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    상세 후기 내용 *
                  </label>

                  <button
                    type="button"
                    onClick={handleAiRefine}
                    disabled={isAiRefining}
                    className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {isAiRefining ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    <span>AI로 후기 다듬기 & 태그 자동생성</span>
                  </button>
                </div>

                <textarea
                  required
                  rows={5}
                  placeholder="방문했던 명소의 느낌, 웨이팅 시간, 교통 이용 팁, 꼭 먹어봐야 할 메뉴나 주의할 점을 자유롭게 적어주세요. 간단히 적고 위의 'AI로 후기 다듬기'를 누르면 매끄럽게 정리해드립니다."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
                />

                {aiRefineTip && (
                  <p className="text-[11px] text-teal-700 bg-teal-50 p-2 rounded-md font-medium">
                    {aiRefineTip}
                  </p>
                )}
              </div>

              {/* Recommended Route Snippet */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  추천 동선 요약 (선택 사항)
                </label>
                <input
                  type="text"
                  placeholder="예: 시부야 스카이 → 미야시타 파크 → 롯폰기 타워 야경"
                  value={formData.itinerarySummary}
                  onChange={(e) =>
                    setFormData({ ...formData, itinerarySummary: e.target.value })
                  }
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Highlight Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  핵심 꿀팁 키워드 태그
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="태그 입력 (예: 일몰명소, 110V어댑터필수)"
                    value={formData.newTagInput}
                    onChange={(e) =>
                      setFormData({ ...formData, newTagInput: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 text-xs p-2 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    추가
                  </button>
                </div>

                {formData.highlightTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {formData.highlightTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-teal-600 hover:text-teal-900"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  후기 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Community Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  AI 여행자 커뮤니티 종합 분석
                </h3>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSummaryLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                <p className="text-xs text-slate-600 font-medium">
                  여행자들이 남긴 후기와 평점을 분석하고 있습니다...
                </p>
              </div>
            ) : aiSummaryData ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                  <span className="font-bold text-teal-900">
                    {aiSummaryData.destination} 전반적인 만족도 평가
                  </span>
                  <p className="text-teal-950 leading-relaxed">
                    {aiSummaryData.averageTone}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>후기에서 가장 호평받은 스팟 & 미식</span>
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    {aiSummaryData.topPraisedSpots.map((spot, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <span className="text-amber-500 font-bold">·</span>
                        <span>{spot}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-rose-500" />
                    <span>여행자 공통 주의사항 & 필수 팁</span>
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    {aiSummaryData.commonWarnings.map((warn, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700">
                        <span className="text-rose-500 font-bold">·</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

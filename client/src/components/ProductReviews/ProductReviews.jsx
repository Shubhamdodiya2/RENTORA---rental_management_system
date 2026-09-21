import React, { useState, useEffect } from 'react';
import {
  Star,
  ThumbsUp,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Send,
  User
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ProductReviews.css';

export default function ProductReviews({ productId, onReviewAdded }) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 5.0,
    totalReviews: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    breakdownPercentage: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Write Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Voted helpful IDs
  const [votedHelpful, setVotedHelpful] = useState({});

  const fetchReviews = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await api.get(`/reviews/products/${productId}`);
      if (res.data?.success) {
        setReviews(res.data.data.reviews || []);
        if (res.data.data.summary) {
          setSummary(res.data.data.summary);
        }
      }
    } catch (err) {
      console.warn('[ProductReviews] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setFormError('Please select a star rating');
      return;
    }
    if (!comment.trim() || comment.trim().length < 3) {
      setFormError('Please enter at least a few words describing your experience');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await api.post(`/reviews/products/${productId}`, {
        rating,
        title: title.trim(),
        comment: comment.trim()
      });

      if (res.data?.success) {
        setFormSuccess('Thank you! Your verified review has been published.');
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
          setTitle('');
          setComment('');
        }, 1500);

        await fetchReviews();
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (votedHelpful[reviewId]) return;
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
      );
    } catch (err) {
      console.warn('Helpful vote notice:', err.message);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    return Math.round(r.rating) === Number(selectedFilter);
  });

  return (
    <div className="product-reviews-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#A8DADC]/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D3557]/5 text-[#1D3557] text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles size={12} className="text-[#E63946]" />
            <span>Verified Customer Feedback</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[#1D3557] font-['Sora']">
            Customer Reviews & Ratings
          </h3>
          <p className="text-xs text-[#457B9D]">
            Authentic rental experiences shared by verified community members.
          </p>
        </div>

        <div>
          {isAuthenticated ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E63946] text-white text-xs font-bold shadow-md hover:bg-[#D62839] transition-all cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              <span>Write a Review</span>
            </button>
          ) : (
            <div className="text-xs text-[#457B9D] bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-[#1D3557]">Want to review? </span>
              <a href="/login" className="text-[#E63946] font-bold hover:underline">Log in</a> as a customer.
            </div>
          )}
        </div>
      </div>

      {/* Ratings Overview Card */}
      <div className="bg-white rounded-3xl border border-[#A8DADC]/40 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6">
        {/* Left: Big Score */}
        <div className="lg:col-span-4 text-center lg:border-r lg:border-slate-100 lg:pr-6 space-y-2">
          <div className="text-5xl sm:text-6xl font-extrabold text-[#1D3557] font-['Sora'] tracking-tight">
            {summary.averageRating}
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={22}
                fill={star <= Math.round(summary.averageRating) ? 'currentColor' : 'none'}
                className={star <= Math.round(summary.averageRating) ? 'text-amber-400' : 'text-slate-200'}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-[#457B9D]">
            Based on {summary.totalReviews} verified customer {summary.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="lg:col-span-8 space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.breakdown[stars] || 0;
            const pct = summary.breakdownPercentage[stars] || 0;
            return (
              <div
                key={stars}
                onClick={() => setSelectedFilter(selectedFilter === String(stars) ? 'all' : String(stars))}
                className={`flex items-center gap-3 text-xs cursor-pointer group p-1 rounded-lg transition-colors ${
                  selectedFilter === String(stars) ? 'bg-[#F1FAEE]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-14 flex items-center gap-1 font-bold text-[#1D3557] shrink-0">
                  <span>{stars}</span>
                  <Star size={12} fill="currentColor" className="text-amber-400" />
                </div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-[#E63946] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-16 text-right font-medium text-slate-500 text-[11px] shrink-0">
                  {pct}% ({count})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 text-xs font-bold">
        {[
          { id: 'all', label: `All Reviews (${reviews.length})` },
          { id: '5', label: '5 Stars' },
          { id: '4', label: '4 Stars' },
          { id: '3', label: '3 Stars' },
          { id: '2', label: '2 Stars' },
          { id: '1', label: '1 Star' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-[#1D3557] text-white border-[#1D3557]'
                : 'bg-white text-[#457B9D] border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Loader2 size={28} className="animate-spin text-[#E63946] mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/60 shadow-sm space-y-2">
          <MessageSquare size={36} className="text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-[#1D3557]">No reviews found for this filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first customer to share your experience with this equipment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-[#A8DADC]/40 p-6 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              {/* Review Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1D3557]/10 text-[#1D3557] font-extrabold flex items-center justify-center text-sm border border-[#A8DADC]/60">
                    {(r.customer?.avatarUrl || r.customer?.avatar) ? (
                      <img src={r.customer.avatarUrl || r.customer.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      r.customer?.fullName ? r.customer.fullName.charAt(0).toUpperCase() : <User size={18} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1D3557] text-sm font-['Sora']">
                        {r.customer?.fullName || 'Verified Customer'}
                      </span>
                      {r.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={10} />
                          <span>Verified Rental</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0">
                  <Star size={13} fill="currentColor" />
                  <span className="text-xs font-bold text-amber-900">{r.rating}.0</span>
                </div>
              </div>

              {/* Title & Comment */}
              {r.title && (
                <h5 className="font-bold text-[#1D3557] text-sm leading-snug">
                  {r.title}
                </h5>
              )}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {r.comment}
              </p>

              {/* Footer: Helpful button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => handleHelpfulVote(r.id)}
                  disabled={votedHelpful[r.id]}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    votedHelpful[r.id]
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <ThumbsUp size={13} className={votedHelpful[r.id] ? 'text-emerald-600' : ''} />
                  <span>{votedHelpful[r.id] ? 'Marked Helpful' : 'Helpful'}</span>
                  <span>({r.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center font-bold">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1D3557] text-base font-['Sora']">Rate & Review Equipment</h4>
                  <p className="text-[11px] text-[#457B9D]">Share your verified rental experience</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {formSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h5 className="font-bold text-base">Review Submitted!</h5>
                <p className="text-xs">{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Star Selector */}
                <div className="text-center space-y-1 py-2 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/40">
                  <label className="text-xs font-bold text-[#1D3557] block">
                    Overall Experience Rating *
                  </label>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={32}
                          fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                          className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-[#E63946] pt-1">
                    {rating === 5 && 'Outstanding & Flawless ★★★★★'}
                    {rating === 4 && 'Very Good Equipment ★★★★☆'}
                    {rating === 3 && 'Average Experience ★★★☆☆'}
                    {rating === 2 && 'Below Expectations ★★☆☆☆'}
                    {rating === 1 && 'Unsatisfactory ★☆☆☆☆'}
                  </div>
                </div>

                {/* Review Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Excellent sound quality & clean kit!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                {/* Review Comment */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Detailed Review & Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Tell other renters about the gear condition, battery life, handover punctuality, or accessories..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#E63946]"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-bold hover:bg-[#D62839] transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>Publish Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

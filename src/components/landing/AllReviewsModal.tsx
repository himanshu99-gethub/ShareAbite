import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, MessageSquare, PenSquare, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { UserReview } from "./ReviewModal";

interface AllReviewsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenWriteModal: () => void;
  reviews: UserReview[];
  onDeleteReview?: (id: string) => void;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: Math.min(5, Math.max(1, count)) }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function AllReviewsModal({
  open,
  onClose,
  onOpenWriteModal,
  reviews,
  onDeleteReview,
}: AllReviewsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState<number | "all">("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete review from "${name}"?`)) return;

    try {
      // 1. Delete from localStorage
      const localStr = localStorage.getItem("shareabite_user_reviews");
      if (localStr) {
        const localReviews: UserReview[] = JSON.parse(localStr);
        const updated = localReviews.filter((r) => r.id !== id);
        localStorage.setItem("shareabite_user_reviews", JSON.stringify(updated));
      }

      // 2. Try deleting from Supabase
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.from("reviews" as any).delete().eq("id", id);
      } catch (_) {}

      // 3. Dispatch global event & trigger parent callback
      window.dispatchEvent(new CustomEvent("user_review_deleted", { detail: { id } }));

      toast.success("Review deleted successfully.");

      if (onDeleteReview) {
        onDeleteReview(id);
      }
    } catch (err: any) {
      toast.error("Failed to delete review.");
    }
  };

  // Filter reviews
  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      r.quote.toLowerCase().includes(search.toLowerCase());

    const matchesStar = starFilter === "all" || r.rating === starFilter;
    return matchesSearch && matchesStar;
  });

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col my-auto animate-fade-up-blur">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/50 pr-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="eyebrow-tag text-[11px]">💬 Community Stories</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                {reviews.length} Reviews
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">All Customer Reviews</h2>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenWriteModal();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 w-fit"
          >
            <PenSquare className="w-3.5 h-3.5" />
            Write a Review
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews by name or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setStarFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                starFilter === "all"
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  starFilter === s
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[50vh]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-bold text-foreground text-sm">No reviews found</p>
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search or filter</p>
            </div>
          ) : (
            filtered.map((r, i) => (
              <div
                key={r.id || `${r.name}-${i}`}
                className="group relative bg-card border border-border/50 rounded-2xl p-4 sm:p-5 hover:border-border transition-all duration-200"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <StarRating count={r.rating} />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "Verified"}
                    </span>

                    {/* Delete Review Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.name)}
                      title="Delete review"
                      className="p-1 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <blockquote className="text-sm text-foreground leading-relaxed font-medium mb-3">
                  "{r.quote}"
                </blockquote>

                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-9 h-9 rounded-full object-cover border border-white shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.role}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

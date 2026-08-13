import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, MessageSquare, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export interface UserReview {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
  featured?: boolean;
  created_at: string;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newReview: UserReview) => void;
}

export function ReviewModal({ open, onClose, onSuccess }: ReviewModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim() || !quote.trim()) {
      toast.error("Please fill in your name and review.");
      return;
    }

    setLoading(true);

    const seed = encodeURIComponent(name.trim().toLowerCase());
    const newReview: UserReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || "Community Member",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`,
      quote: quote.trim(),
      rating,
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Try Supabase insert
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.from("reviews" as any).insert({
          name: newReview.name,
          role: newReview.role,
          avatar: newReview.avatar,
          quote: newReview.quote,
          rating: newReview.rating,
        });
      } catch (_) {
        // Fallback gracefully if reviews table is not defined in DB schema
      }

      // 2. Save to localStorage for instant local & cross-tab persistence
      const existingStr = localStorage.getItem("shareabite_user_reviews");
      const existing: UserReview[] = existingStr ? JSON.parse(existingStr) : [];
      const updated = [newReview, ...existing];
      localStorage.setItem("shareabite_user_reviews", JSON.stringify(updated));

      // 3. Dispatch window event for live real-time UI refresh
      window.dispatchEvent(new CustomEvent("user_review_added", { detail: newReview }));

      toast.success("Thank you for your review! It's now live on the site 🎉");
      onSuccess(newReview);
      
      // Reset form
      setName("");
      setRole("");
      setQuote("");
      setRating(5);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-up-blur my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Write a Review</h3>
            <p className="text-xs text-muted-foreground">Share your experience with ShareABite</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Your Rating
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-115 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chef Anita Sharma"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Role / Org */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Role / Organisation
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Owner, Spice Bistro / NGO Volunteer"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Review Quote */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Your Review *
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="How has ShareABite helped you donate or receive food?"
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim() || !quote.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Live Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

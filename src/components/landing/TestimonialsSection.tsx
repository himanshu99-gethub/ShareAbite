import { useState, useEffect } from "react";
import { Quote, Star, PenSquare } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ReviewModal, type UserReview } from "./ReviewModal";
import { AllReviewsModal } from "./AllReviewsModal";

const initialTestimonials: UserReview[] = [
  {
    id: "default-1",
    name: "Chef Rajeev Kumar",
    role: "Head Chef, The Grand Palace Hotel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajeev&backgroundColor=b6e3f4",
    quote:
      "We used to throw away 15 kg of food every weekend. ShareABite changed that — within 30 minutes of posting, an NGO collects it. It feels incredible.",
    rating: 5,
    featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    name: "Sister Maria Thomas",
    role: "Director, Hope Shelter Trust",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria&backgroundColor=d1d4f9",
    quote:
      "Before ShareABite, our shelter often ran short on dinner. Now we receive fresh, nutritious meals from restaurants near us every day. Life-changing.",
    rating: 5,
    featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "Priya Menon",
    role: "Owner, Green Leaf Bakery",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc",
    quote:
      "Listing a donation takes me 2 minutes. The map shows me the NGO picking it up. The transparency is what I love the most about ShareABite.",
    rating: 5,
    featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-4",
    name: "Ahmed Khan",
    role: "Coordinator, City Food Bank",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=c0aede",
    quote:
      "The real-time notifications mean we can dispatch a volunteer the moment a donation is confirmed. Zero food wasted, zero guesswork.",
    rating: 5,
    featured: false,
    created_at: new Date().toISOString(),
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: Math.min(5, Math.max(1, count)) }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function FeaturedCard({
  testimonial,
}: {
  testimonial: UserReview;
}) {
  const { ref, isIntersecting } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`relative col-span-full rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-emerald-50/30 dark:from-primary/8 dark:via-card dark:to-emerald-900/10 p-8 sm:p-10 overflow-hidden
        hover:-translate-y-1 transition-all duration-300 opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Large decorative quote */}
      <Quote className="absolute top-6 right-8 w-20 h-20 text-primary/6 rotate-180" aria-hidden />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-emerald-400/40 to-transparent" />

      <div className="relative z-10">
        <StarRating count={testimonial.rating} />

        <blockquote className="mt-5 text-xl sm:text-2xl font-semibold text-foreground leading-snug max-w-3xl">
          "{testimonial.quote}"
        </blockquote>

        <div className="flex items-center gap-4 mt-8">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-emerald-400 rounded-full blur opacity-30" />
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            />
          </div>
          <div>
            <p className="font-bold text-foreground text-base">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{testimonial.role}</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-semibold">
            ✓ Verified Community Member
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  delay,
}: {
  testimonial: UserReview;
  delay: number;
}) {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-border/50 bg-card p-6 sm:p-7 overflow-hidden
        hover:-translate-y-1 transition-all duration-300 opacity-0 ${isIntersecting ? "animate-fade-up-blur opacity-100" : ""}`}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Subtle gradient hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <StarRating count={testimonial.rating} />

        <p className="text-sm sm:text-base text-foreground leading-relaxed my-5 font-medium">
          "{testimonial.quote}"
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-emerald-300 rounded-full blur-sm opacity-25" />
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="relative w-10 h-10 rounded-full object-cover border border-white shadow-sm"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [allReviewsList, setAllReviewsList] = useState<UserReview[]>(initialTestimonials);
  const [display4, setDisplay4] = useState<UserReview[]>(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [allModalOpen, setAllModalOpen] = useState(false);

  const loadAllReviews = async () => {
    let remoteReviews: UserReview[] = [];

    // 1. Try fetching from Supabase
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("reviews" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        remoteReviews = data.map((r: any) => ({
          id: r.id || `supa-${Math.random()}`,
          name: r.name,
          role: r.role || "Community Member",
          avatar: r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
          quote: r.quote,
          rating: r.rating || 5,
          created_at: r.created_at || new Date().toISOString(),
        }));
      }
    } catch (_) {}

    // 2. Fetch from LocalStorage
    let localReviews: UserReview[] = [];
    try {
      const localStr = localStorage.getItem("shareabite_user_reviews");
      if (localStr) localReviews = JSON.parse(localStr);
    } catch (_) {}

    // Combine user submitted reviews
    const combinedUser = [...localReviews, ...remoteReviews];
    const uniqueMap = new Map<string, UserReview>();

    combinedUser.forEach((item) => {
      const key = item.id || `${item.name.toLowerCase()}-${item.quote.slice(0, 20)}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const userSubmitted = Array.from(uniqueMap.values());

    // ALL REVIEWS LIST for AllReviewsModal
    const fullList = userSubmitted.length > 0 ? [...userSubmitted, ...initialTestimonials] : initialTestimonials;
    setAllReviewsList(fullList);

    // 4 MAIN SCREEN CARDS: Real user reviews OVERLAP the 4 default cards!
    const fillNeeded = Math.max(0, 4 - userSubmitted.length);
    const main4 = [...userSubmitted, ...initialTestimonials.slice(0, fillNeeded)].slice(0, 4);
    setDisplay4(main4);
  };

  useEffect(() => {
    loadAllReviews();

    const handleNewReview = () => loadAllReviews();
    const handleDeletedReview = () => loadAllReviews();

    window.addEventListener("user_review_added", handleNewReview);
    window.addEventListener("user_review_deleted", handleDeletedReview);
    return () => {
      window.removeEventListener("user_review_added", handleNewReview);
      window.removeEventListener("user_review_deleted", handleDeletedReview);
    };
  }, []);

  const featured = display4[0] || initialTestimonials[0];
  const gridCards = display4.slice(1, 4);

  return (
    <>
      <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent dark:from-blue-900/8 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-5 relative z-10">
          {/* Section Header */}
          <div
            ref={ref}
            className={`flex flex-col md:flex-row items-center justify-between gap-6 mb-16 opacity-0 ${
              isIntersecting ? "animate-fade-up-blur opacity-100" : ""
            }`}
          >
            <div className="text-center md:text-left">
              <span className="eyebrow-tag mb-4 inline-flex">💬 Stories</span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2"
                style={{ lineHeight: "1.12" }}
              >
                Real impact,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                  real communities
                </span>
              </h2>
              <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-lg">
                Hear from the restaurants, donors, and NGOs building a hunger-free community.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAllModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card text-foreground font-bold text-sm hover:bg-muted/50 transition-all shadow-sm active:scale-[0.98]"
              >
                All Reviews ({allReviewsList.length})
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm hover:from-primary/90 hover:to-emerald-500 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
              >
                <PenSquare className="w-4 h-4" />
                Write a Review
              </button>
            </div>
          </div>

          {/* Cards Layout: 4 Main Screen Cards (1 Featured + 3 Grid Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Featured hero card spans full width */}
            {featured && <FeaturedCard testimonial={featured} />}

            {/* 3 Grid cards */}
            {gridCards.map((t, i) => (
              <TestimonialCard key={t.id || `${t.name}-${i}`} testimonial={t} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* Review Submission Modal */}
      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadAllReviews()}
      />

      {/* All Reviews Modal */}
      <AllReviewsModal
        open={allModalOpen}
        onClose={() => setAllModalOpen(false)}
        onOpenWriteModal={() => setModalOpen(true)}
        reviews={allReviewsList}
        onDeleteReview={() => loadAllReviews()}
      />
    </>
  );
}

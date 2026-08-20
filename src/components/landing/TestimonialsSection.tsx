import { useState, useEffect } from "react";
import { Quote, Star, PenSquare, MessageSquare, ShieldCheck, Heart } from "lucide-react";
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
      "We used to throw away 15 kg of surplus banquet food every weekend. ShareABite transformed our workflow — within 25 minutes of posting, a verified shelter is at our doorstep collecting it with dignity.",
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
      "Before ShareABite, our shelter often ran short on warm dinners. Now we receive fresh, nutritious meals from restaurants near us every day. Truly life-changing for over 80 children.",
    rating: 5,
    featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "Priya Menon",
    role: "Owner, Green Leaf Artisan Bakery",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc",
    quote:
      "Listing a batch of evening breads takes 60 seconds from my phone. The live radar shows exactly who is coming. The speed and transparency give us complete peace of mind.",
    rating: 5,
    featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-4",
    name: "Ahmed Khan",
    role: "Operations Lead, City Hunger Relief",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=c0aede",
    quote:
      "The instant notifications allow us to dispatch a volunteer immediately. Zero food wasted, zero guesswork. It's the most reliable food rescue platform we've ever used.",
    rating: 5,
    featured: false,
    created_at: new Date().toISOString(),
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: Math.min(5, Math.max(1, count)) }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
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
      className={`relative col-span-full rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-emerald-50/20 dark:to-emerald-950/20 p-8 sm:p-10 overflow-hidden
        transition-all duration-400 hover:-translate-y-1.5 ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
      style={{ boxShadow: "var(--shadow-neumorphic)" }}
    >
      {/* Large decorative quote watermark */}
      <Quote className="absolute top-6 right-8 w-24 h-24 text-primary/5 rotate-180 pointer-events-none" aria-hidden />

      {/* Top Specular Rim */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/70 via-emerald-400/50 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <StarRating count={testimonial.rating} />
          <span className="glass-pill text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Featured Community Story</span>
          </span>
        </div>

        <blockquote className="mt-4 text-xl sm:text-2xl font-bold text-foreground leading-relaxed max-w-3xl">
          "{testimonial.quote}"
        </blockquote>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-border/40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-emerald-400 rounded-full blur opacity-40" />
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-md"
              />
            </div>
            <div>
              <p className="font-extrabold text-foreground text-base leading-tight">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{testimonial.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Heart className="w-3.5 h-3.5 text-primary fill-primary/30" />
            Verified Donor Partner
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
      className={`group relative rounded-3xl border border-border/60 bg-card/90 dark:bg-card/50 backdrop-blur-xl p-7 overflow-hidden
        transition-all duration-400 hover:-translate-y-2 cursor-default ${isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"}`}
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: "var(--shadow-neumorphic)",
      }}
    >
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <StarRating count={testimonial.rating} />

          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed my-5 font-normal">
            "{testimonial.quote}"
          </p>
        </div>

        <div className="flex items-center gap-3.5 pt-4 border-t border-border/40">
          <div className="relative flex-shrink-0">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
            />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground leading-tight">{testimonial.name}</p>
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

    let localReviews: UserReview[] = [];
    try {
      const localStr = localStorage.getItem("shareabite_user_reviews");
      if (localStr) localReviews = JSON.parse(localStr);
    } catch (_) {}

    const combinedUser = [...localReviews, ...remoteReviews];
    const uniqueMap = new Map<string, UserReview>();

    combinedUser.forEach((item) => {
      const key = item.id || `${item.name.toLowerCase()}-${item.quote.slice(0, 20)}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const userSubmitted = Array.from(uniqueMap.values());
    const fullList = userSubmitted.length > 0 ? [...userSubmitted, ...initialTestimonials] : initialTestimonials;
    setAllReviewsList(fullList);

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
      <section id="testimonials" className="py-28 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          
          {/* Section Header */}
          <div
            ref={ref}
            className={`flex flex-col md:flex-row items-center justify-between gap-8 mb-16 ${
              isIntersecting ? "animate-fade-up-blur opacity-100" : "opacity-0"
            }`}
          >
            <div className="text-center md:text-left">
              <span className="glass-pill text-blue-700 dark:text-blue-300 text-xs font-extrabold mb-4">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Voices of the Network</span>
              </span>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mt-3 tracking-[-0.03em]"
                style={{ lineHeight: "1.10" }}
              >
                Real impact.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                  Real communities.
                </span>
              </h2>
              <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl">
                Hear firsthand from the restaurants, caterers, and shelters powering zero-waste hunger relief.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAllModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border/80 bg-card font-bold text-xs hover:bg-muted transition-all shadow-sm active:scale-[0.98]"
              >
                All Stories ({allReviewsList.length})
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 text-white font-extrabold text-xs hover:from-primary/90 hover:to-emerald-500 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
              >
                <PenSquare className="w-4 h-4" />
                Submit Your Story
              </button>
            </div>
          </div>

          {/* Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured && <FeaturedCard testimonial={featured} />}
            {gridCards.map((t, i) => (
              <TestimonialCard key={t.id || `${t.name}-${i}`} testimonial={t} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* Review Modals */}
      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadAllReviews()}
      />

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

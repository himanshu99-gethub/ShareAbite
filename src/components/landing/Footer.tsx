import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, Github, Twitter, Linkedin, Heart, Star, MessageSquare } from "lucide-react";
import { ReviewModal, type UserReview } from "./ReviewModal";
import { AllReviewsModal } from "./AllReviewsModal";

const navLinks = [
  { href: "#features",     label: "Platform Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#live-map",     label: "Live Rescue Radar" },
  { href: "#testimonials", label: "Community Stories" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Food Safety Guidelines" },
];

const socialLinks = [
  { href: "#", icon: Github,   label: "GitHub" },
  { href: "#", icon: Twitter,  label: "Twitter" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
];

const initialReviews: UserReview[] = [
  {
    id: "default-1",
    name: "Chef Rajeev Kumar",
    role: "Head Chef, The Grand Palace Hotel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajeev&backgroundColor=b6e3f4",
    quote: "We used to throw away 15 kg of food every weekend. ShareABite changed that — within 30 minutes of posting, an NGO collects it. It feels incredible.",
    rating: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    name: "Sister Maria Thomas",
    role: "Director, Hope Shelter Trust",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria&backgroundColor=d1d4f9",
    quote: "Before ShareABite, our shelter often ran short on dinner. Now we receive fresh, nutritious meals from restaurants near us every day. Life-changing.",
    rating: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "Priya Menon",
    role: "Owner, Green Leaf Bakery",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc",
    quote: "Listing a donation takes me 2 minutes. The map shows me the NGO picking it up. The transparency is what I love the most about ShareABite.",
    rating: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: "default-4",
    name: "Ahmed Khan",
    role: "Coordinator, City Food Bank",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=c0aede",
    quote: "The real-time notifications mean we can dispatch a volunteer the moment a donation is confirmed. Zero food wasted, zero guesswork.",
    rating: 5,
    created_at: new Date().toISOString(),
  },
];

export function Footer() {
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [allReviewsOpen, setAllReviewsOpen] = useState(false);
  const [allReviewsList, setAllReviewsList] = useState<UserReview[]>(initialReviews);

  const loadAllReviews = async () => {
    let localReviews: UserReview[] = [];
    try {
      const localStr = localStorage.getItem("shareabite_user_reviews");
      if (localStr) localReviews = JSON.parse(localStr);
    } catch (_) {}

    setAllReviewsList([...localReviews, ...initialReviews]);
  };

  return (
    <>
      <footer className="border-t border-border/40 bg-background relative overflow-hidden">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Brand column */}
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-3 group w-fit mb-5">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm group-hover:blur-md transition-all" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Leaf className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <span className="font-extrabold text-foreground text-xl tracking-tight">
                  Share<span className="text-primary">A</span>Bite
                </span>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Bridging the gap between food surplus and hunger. Connecting restaurants, caterers, and households with verified local NGOs in real-time — free forever.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2.5 mt-6">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/60 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation column */}
            <div className="md:col-span-4">
              <p className="text-xs font-black uppercase tracking-widest text-foreground/70 mb-5">
                Navigation & Stories
              </p>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setWriteModalOpen(true)}
                    className="text-sm text-amber-500 hover:text-amber-600 font-bold flex items-center gap-2 transition-colors duration-200"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Submit a Partner Review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      loadAllReviews();
                      setAllReviewsOpen(true);
                    }}
                    className="text-sm text-blue-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-colors duration-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Read All Network Reviews
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal / Direct Access column */}
            <div className="md:col-span-3">
              <p className="text-xs font-black uppercase tracking-widest text-foreground/70 mb-5">
                Protocol & Access
              </p>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li className="pt-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-extrabold transition-all"
                  >
                    Launch Portal Login →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 bg-muted/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} ShareABite Initiative. Powered by real-time community solidarity.
            </p>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> to eliminate hunger
            </p>
          </div>
        </div>
      </footer>

      {/* Write Review Modal */}
      <ReviewModal
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onSuccess={() => {
          setWriteModalOpen(false);
        }}
      />

      {/* All Reviews Modal */}
      <AllReviewsModal
        open={allReviewsOpen}
        onClose={() => setAllReviewsOpen(false)}
        onOpenWriteModal={() => setWriteModalOpen(true)}
        reviews={allReviewsList}
      />
    </>
  );
}

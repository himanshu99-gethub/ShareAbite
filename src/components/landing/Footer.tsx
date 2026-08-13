import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, Github, Twitter, Linkedin, Heart, Star, MessageSquare } from "lucide-react";
import { ReviewModal, type UserReview } from "./ReviewModal";
import { AllReviewsModal } from "./AllReviewsModal";

const navLinks = [
  { href: "#features",     label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#testimonials", label: "Stories" },
];

const legalLinks = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Contact" },
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
      <footer className="border-t border-border/40 bg-background">
        {/* Main footer content */}
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">

            {/* Brand column */}
            <div className="sm:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 group w-fit mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm group-hover:blur-md transition-all" />
                  <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                </div>
                <span className="font-bold text-foreground text-lg">
                  Share<span className="text-primary">A</span>Bite
                </span>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Bridging the gap between food surplus and hunger. Connecting donors
                with NGOs in real-time, for free — forever.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-2 mt-5">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/50 transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation column */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">
                Product & Reviews
              </p>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setWriteModalOpen(true)}
                    className="text-sm text-amber-500 hover:text-amber-600 font-semibold flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Write a Review
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      loadAllReviews();
                      setAllReviewsOpen(true);
                    }}
                    className="text-sm text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    All Reviews
                  </button>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                  >
                    Sign in →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal / Contact column */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">
                Legal
              </p>
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40">
          <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ShareABite. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> to end hunger
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

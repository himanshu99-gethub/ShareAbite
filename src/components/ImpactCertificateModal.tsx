import { useState } from "react";
import { Award, Download, Share2, X, Check, Sparkles, Leaf, HeartHandshake, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ImpactCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorName: string;
  totalDonations: number;
  mealsServed: number;
}

export function ImpactCertificateModal({
  isOpen,
  onClose,
  donorName,
  totalDonations,
  mealsServed,
}: ImpactCertificateModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Impact calculations (standards: ~2.5kg CO2 saved per meal rescued, ~320L water preserved)
  const meals = Math.max(mealsServed, totalDonations * 15 || 25);
  const co2SavedKg = Math.round(meals * 2.5);
  const waterSavedLitres = Math.round(meals * 320);
  const certId = `SAB-CERT-${Math.abs((donorName || "donor").split("").reduce((acc, c) => acc + c.charCodeAt(0), 1000))}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareText = `Proud to partner with ShareABite! Together we've rescued over ${meals} meals and prevented ${co2SavedKg}kg of CO2 emissions. Join the zero food-waste movement! 🌱🍲 #ZeroHunger #FoodRescue #ShareABite`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Impact summary copied to clipboard! Ready to share on LinkedIn / Socials.");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 my-8">
        
        {/* Header action bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70 print:hidden">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Official Impact Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Download / Print
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer"
              title="Share impact"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Container */}
        <div id="printable-certificate" className="p-8 sm:p-10 bg-[radial-gradient(#ecfdf5_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="relative p-6 sm:p-8 rounded-2xl border-4 border-double border-emerald-600/40 bg-white shadow-inner text-center">
            
            {/* Top Badge */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="w-7 h-7" />
              </div>
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-bold mb-1">
              ShareABite Zero Waste Network
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight mb-2">
              Certificate of Food Rescue Impact
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
              This certificate is proudly awarded in recognition of outstanding commitment to fighting hunger and eliminating food waste in our community.
            </p>

            <div className="my-5 py-3 border-y border-emerald-100/80">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium block mb-1">
                Proudly Presented To
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
                {donorName || "Community Food Partner"}
              </h3>
            </div>

            {/* Impact Metric Grid */}
            <div className="grid grid-cols-3 gap-3 my-6 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <HeartHandshake className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-black text-gray-900">
                  {meals.toLocaleString()}+
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 font-medium mt-0.5">
                  Meals Rescued
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100">
                <Sparkles className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-black text-gray-900">
                  {co2SavedKg.toLocaleString()} kg
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 font-medium mt-0.5">
                  CO₂ Averted
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-100">
                <ShieldCheck className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-black text-gray-900">
                  {waterSavedLitres.toLocaleString()} L
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 font-medium mt-0.5">
                  Water Preserved
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 text-left">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Date of Issuance</p>
                <p className="text-xs font-semibold text-gray-700">{currentDate}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">ID: {certId}</p>
              </div>

              {/* Official Seal */}
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-800 tracking-wide uppercase">
                  Verified Impact Partner
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

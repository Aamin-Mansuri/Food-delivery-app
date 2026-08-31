import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  Sparkles,
  Tag,
  Copy,
  Check,
  ChevronRight,
  Flame,
  Gift,
  ArrowRight,
  Clock,
  Percent,
} from 'lucide-react';
import { soundFX } from '../../utils/audioFeedback';

export default function PromotionalBanner({ onSelectCategory, onScrollToSection }) {
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  const offers = [
    {
      id: 'free-delivery',
      badge: 'FIRST BITE PERK',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Truck,
      title: 'Free delivery on your first artisanal order',
      subtitle: 'Zero delivery fee on your first order from any 5-star master cloud kitchen',
      code: 'ARTISANFREE',
      condition: 'Min. order ₹199 • Valid for new food lovers',
      categoryTarget: 'All',
      tagline: '✨ 100% Thermal Lock Guarantee',
    },
    {
      id: 'chef-reserve',
      badge: 'CHEF CURATIONS',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Sparkles,
      title: 'Flat 30% Off Master Chef Reserve Dishes',
      subtitle: 'Signature slow-cooked handi curations, gourmet smash patties & truffle pastas',
      code: 'CHEF30',
      condition: 'Save up to ₹150 • Auto-claim at checkout',
      categoryTarget: 'Biryani',
      tagline: '👨‍🍳 Small-Batch Kitchens Only',
    },
    {
      id: 'pizza-perk',
      badge: 'WOODFIRED SPECIAL',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Gift,
      title: 'Complimentary Truffle Burrata Dip with Artisan Pizzas',
      subtitle: 'Hand-stretched 48-hr fermented sourdough pies with imported San Marzano sauce',
      code: 'BURRATA',
      condition: 'Valid with all Neapolitan Pizza orders',
      categoryTarget: 'Pizza',
      tagline: '🍕 Stone Oven Baked',
    },
    {
      id: 'biryani-feast',
      badge: 'DUM FEAST',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Flame,
      title: 'Flat ₹100 Off on Claypot Handi Biryanis',
      subtitle: 'Sealed dough handis with aged basmati, saffron infusion & spiced raita',
      code: 'DUM100',
      condition: 'Min. order ₹399 • Today only',
      categoryTarget: 'Biryani',
      tagline: '🍲 Authentic Nizami Dum',
    },
  ];

  const currentOffer = offers[activeOfferIndex];

  const handleCopy = (code) => {
    soundFX.playSuccess();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleExplore = (offer) => {
    soundFX.playPop();
    if (onSelectCategory && offer.categoryTarget) {
      onSelectCategory(offer.categoryTarget);
    }
    if (onScrollToSection) {
      onScrollToSection('featured-restaurants-section');
    } else {
      const el = document.getElementById('featured-restaurants-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section id="promotional-offers-banner" className="relative">
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-900/10 dark:border-amber-400/20 rounded-3xl p-4 sm:p-6 backdrop-blur-xs shadow-xs relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Side: Highlight Details */}
          <div className="space-y-3 max-w-2xl">
            {/* Offer Selector Ribbon Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono shrink-0 mr-1 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-orange-500" />
                <span>ONGOING OFFERS:</span>
              </span>
              {offers.map((offer, idx) => {
                const isActive = idx === activeOfferIndex;
                const IconComponent = offer.icon;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => {
                      soundFX.playPop();
                      setActiveOfferIndex(idx);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs scale-102'
                        : 'bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    <IconComponent className={`w-3 h-3 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate max-w-[130px] sm:max-w-none">{offer.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Offer Content Card with Smooth Motion Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentOffer.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                  <span
                    className={`text-[10px] font-black font-mono uppercase px-2.5 py-0.5 rounded-md border tracking-wider ${currentOffer.badgeColor}`}
                  >
                    {currentOffer.badge}
                  </span>
                  <span className="text-xs font-bold text-amber-900/80 dark:text-amber-300/90 font-mono">
                    {currentOffer.tagline}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-display">
                  {currentOffer.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {currentOffer.subtitle}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium pt-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span>{currentOffer.condition}</span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Promo Code Voucher Capsule & Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-3 shrink-0">
            {/* Voucher Box */}
            <div className="bg-white border border-amber-900/15 rounded-2xl p-2.5 pl-3.5 flex items-center justify-between sm:justify-start space-x-3 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Coupon Code
                </span>
                <span className="font-mono font-black text-xs text-slate-900 tracking-wider">
                  {currentOffer.code}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(currentOffer.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer active:scale-95 ${
                  copiedCode === currentOffer.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                }`}
              >
                {copiedCode === currentOffer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Explore Button */}
            <button
              type="button"
              onClick={() => handleExplore(currentOffer)}
              className="bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer group"
            >
              <span>Explore Kitchens</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

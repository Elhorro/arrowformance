import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { BANNERS } from '../lib/banners';
import { trackBannerImpression, trackBannerClick } from '../lib/supabase';

interface BannerRotatorProps {
  sessionId: string;
  viewType?: string;
}

const ROTATION_INTERVAL = 5000;

export default function BannerRotator({ sessionId, viewType }: BannerRotatorProps) {
  const [current, setCurrent] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const trackedRef = useRef(new Set<string>());

  const banner = BANNERS[current];

  // Impression tracken (einmalig pro Banner pro Session)
  useEffect(() => {
    const id = banner.id;
    if (!trackedRef.current.has(id)) {
      trackedRef.current.add(id);
      trackBannerImpression(id, sessionId, viewType);
    }
  }, [banner.id, sessionId, viewType]);

  // Auto-Rotation — resetKey lässt den Timer neu starten
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % BANNERS.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [resetKey]);

  const handlePrev = () => {
    setCurrent(prev => (prev - 1 + BANNERS.length) % BANNERS.length);
    setResetKey(k => k + 1);
  };

  const handleNext = () => {
    setCurrent(prev => (prev + 1) % BANNERS.length);
    setResetKey(k => k + 1);
  };

  const handleDotClick = (i: number) => {
    setCurrent(i);
    setResetKey(k => k + 1);
  };

  const handleClick = async () => {
    await trackBannerClick(banner.id, sessionId, banner.href);
    window.open(banner.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-8 relative group/banner">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.gradient}`}>
        {/* Content */}
        <div className="px-6 py-5 flex items-center gap-4">
          <span className="text-4xl flex-shrink-0 select-none">{banner.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">{banner.title}</p>
            <p className="text-white/75 text-xs mt-1 leading-relaxed line-clamp-2">{banner.subtitle}</p>
          </div>
          <button
            onClick={handleClick}
            className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            {banner.cta}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 pb-3">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? 'w-4 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Arrow navigation */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-5 opacity-0 group-hover/banner:opacity-100 w-7 h-7 bg-black/25 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-5 opacity-0 group-hover/banner:opacity-100 w-7 h-7 bg-black/25 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

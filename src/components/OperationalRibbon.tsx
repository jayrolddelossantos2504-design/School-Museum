import React from 'react';
import { Clock, MapPin, Ticket, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface OperationalRibbonProps {
  isMuted: boolean;
  onToggleAudio: () => void;
}

export const OperationalRibbon: React.FC<OperationalRibbonProps> = ({
  isMuted,
  onToggleAudio,
}) => {
  return (
    <section className="bg-[#f2ede4] border-b border-[#e2dacf] text-stone-700 text-xs py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6">
        {/* Operational Indicators */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#114232] shrink-0" />
            <span className="font-medium text-stone-900">Visiting Hours:</span>
            <span>Mon–Fri 8:00 AM – 5:00 PM</span>
          </div>

          <span className="hidden sm:inline text-stone-400" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-[#114232] shrink-0" />
            <span className="font-medium text-stone-900">Admission:</span>
            <span>Free (Public & Student Educational Resource)</span>
          </div>

          <span className="hidden md:inline text-stone-400" aria-hidden="true">·</span>

          <div className="hidden md:flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#114232] shrink-0" />
            <span className="font-medium text-stone-900">Location:</span>
            <span>Padolina, General Tinio, Nueva Ecija (DepEd School ID: 300806)</span>
          </div>
        </div>

        {/* Audio Guide Simulation / Quick Reference */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleAudio}
            className="flex items-center gap-1.5 text-stone-600 hover:text-[#114232] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#114232] rounded"
            title={isMuted ? "Enable Ambient Museum Soundscape" : "Mute Soundscape"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[11px]">Audio Guide Soundscape: Off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                <span className="text-[11px] font-medium text-emerald-800">Audio Soundscape: On</span>
              </>
            )}
          </button>
          <span className="text-stone-300" aria-hidden="true">|</span>
          <div className="flex items-center gap-1 text-[11px] text-stone-600">
            <BookOpen className="w-3 h-3 text-[#c68a1a]" />
            <span>Curatorial Archive Vol. 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
};

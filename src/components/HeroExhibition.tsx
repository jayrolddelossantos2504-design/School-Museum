import React from 'react';
import { ArrowRight, QrCode, Sparkles, BookOpen, Search } from 'lucide-react';
import { HERO_IMAGE_PATH } from '../data/mockDatabase';

interface HeroExhibitionProps {
  onExploreCollection: () => void;
  onOpenQrScanner: () => void;
}

export const HeroExhibition: React.FC<HeroExhibitionProps> = ({
  onExploreCollection,
  onOpenQrScanner,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#faf8f5] border-b border-[#e6dfd3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Curatorial Narrative (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Curatorial Header Lead */}
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#185a45] flex items-center gap-2">
                <span>Centennial Heritage Preservation</span>
                <span aria-hidden="true">·</span>
                <span>DepEd Division of Nueva Ecija</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#0c3125] font-bold tracking-tight leading-[1.15] text-balance">
                Preserving the Valor, Memory & Scholastic Spirit of General Tinio
              </h1>
            </div>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              Welcome to the digital sanctuary and physical exhibition hall of 
              <strong className="text-stone-900 font-semibold"> General Tinio National High School</strong>. 
              From the revolutionary courage of young General Manuel Tinio to six decades of scholastic achievements, 
              explore our permanent collection of historical artifacts, vintage photographs, official documents, and cherished school memorabilia.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreCollection}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <span>Browse the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenQrScanner}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#0c3125] bg-[#eef4f0] hover:bg-[#e1ede5] border border-[#bed2c7] rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#185a45]"
              >
                <QrCode className="w-4 h-4 text-[#185a45]" />
                <span>Scan Exhibit QR Code</span>
              </button>
            </div>

            {/* Institutional Metadata & Advisory */}
            <div className="pt-4 border-t border-[#e6dfd3] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-500 font-sans">
              <span>Curator: Historical Heritage Guild</span>
              <span aria-hidden="true">·</span>
              <span>Municipal Archive Registry</span>
              <span aria-hidden="true">·</span>
              <span>Updated Quarterly</span>
            </div>
          </div>

          {/* Right Column: Hero Artwork / Exhibition Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-lg overflow-hidden border border-[#d6cebe] shadow-lg bg-stone-900 group">
              <img
                src={HERO_IMAGE_PATH}
                alt="General Tinio National High School Heritage Museum Exhibition Hall"
                className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Subtle archival caption overlay with measured gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-stone-100">
                <span className="text-[11px] font-sans uppercase tracking-widest text-amber-300 font-semibold mb-1">
                  Exhibition Showcase · Main Wing
                </span>
                <h3 className="font-serif text-lg font-bold text-white leading-snug">
                  The Memorial Hall & Founders Pavilion
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2 mt-1">
                  Display cases housing founding charters, 1960s uniforms, vintage instruments, and General TinioKatipunan revolutionary relics.
                </p>
              </div>
            </div>

            {/* Delicate corner badge */}
            <div className="absolute -bottom-3 -right-3 hidden sm:flex items-center gap-2 bg-[#0c3125] text-amber-300 border border-amber-400/40 text-[11px] font-medium px-3 py-1.5 rounded shadow">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive QR Audio Guides Enabled</span>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Strip in full-width row below hero split */}
        <div className="mt-14 pt-8 border-t border-[#e2dacf] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">Institution Founded</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#0c3125] tabular-nums">1966</p>
            <p className="text-xs text-stone-600">Established in General Tinio, Nueva Ecija</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">Archival Holdings</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#0c3125] tabular-nums">120+</p>
            <p className="text-xs text-stone-600">Physical relics, photos, and legal folios</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">Permanent Galleries</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#0c3125] tabular-nums">4 Wings</p>
            <p className="text-xs text-stone-600">Artifacts, Photos, Documents, Memorabilia</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-stone-500 font-medium">QR Exhibit Guides</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#0c3125] tabular-nums">100%</p>
            <p className="text-xs text-stone-600">Direct mobile smartphone access</p>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Landmark, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-[#08221a] text-stone-300 border-t border-[#144234] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#144234]">
          {/* Col 1: Institutional Identity (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#185a45] border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Landmark className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="font-institutional text-sm font-bold tracking-wider text-amber-200 uppercase block">
                  General Tinio National High School
                </span>
                <span className="text-[10px] font-sans tracking-widest uppercase text-emerald-200/70">
                  School Heritage Museum & Digital Archive
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Dedicated to collecting, conserving, and celebrating the tangible and intangible heritage of General Tinio National High School and the revolutionary legacy of General Manuel Tinio.
            </p>

            <div className="text-[11px] text-stone-400 font-mono space-y-0.5">
              <p>DepEd Region III · Schools Division of Nueva Ecija</p>
              <p>School ID: 300806 · General Tinio, Nueva Ecija</p>
            </div>
          </div>

          {/* Col 2: Navigation (3 cols) */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-serif font-bold text-sm text-amber-300 uppercase tracking-wider">
              Museum Archive
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Exhibition Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collection')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Permanent Collection Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('general-tinio')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Life of General Manuel Tinio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('visitor-guide')}
                  className="hover:text-amber-300 transition-colors"
                >
                  Visitor Guide & Exhibits Map
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Curatorial Pavilions (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="font-serif font-bold text-sm text-amber-300 uppercase tracking-wider">
              Curatorial Pavilions
            </h4>
            <div className="text-xs text-stone-400 space-y-1">
              <p>· General Manuel Tinio Revolutionary Shrine</p>
              <p>· 1966 School Charter & Founding Documents</p>
              <p>· Alumni Photographic Chronicles (1960–Present)</p>
              <p>· Rondalla Musical Arts & School Memorabilia</p>
            </div>

            <div className="pt-3">
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-amber-400/90 hover:text-amber-200 flex items-center gap-1 font-medium transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Authorized Staff & Curator Console</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Quiet Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            © {new Date().getFullYear()} General Tinio National High School Heritage Museum. All rights reserved.
          </p>
          <p className="text-[11px] text-stone-500">
            Official DepEd Public School Heritage & Digitization Initiative.
          </p>
        </div>
      </div>
    </footer>
  );
};

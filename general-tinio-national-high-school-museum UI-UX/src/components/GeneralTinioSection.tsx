import React from 'react';
import { Shield, Award, Landmark, BookOpen, ExternalLink } from 'lucide-react';
import { MuseumItem } from '../types/museum';

interface GeneralTinioSectionProps {
  onSelectTinioArtifact: (item: MuseumItem) => void;
  tinioItem?: MuseumItem;
}

export const GeneralTinioSection: React.FC<GeneralTinioSectionProps> = ({
  onSelectTinioArtifact,
  tinioItem,
}) => {
  return (
    <section className="bg-[#f4efe6] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#e2dacf]">
      <div className="max-w-7xl mx-auto">
        {/* Curatorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-sans uppercase tracking-widest text-[#185a45] font-semibold mb-2">
            Namesake & Revolutionary Patron
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c3125] tracking-tight">
            General Manuel Tinio: The Boy General of the North
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4 mb-4"></div>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            The spirit of General Tinio National High School is anchored in the revolutionary resolve, academic curiosity, 
            and civic integrity exemplified by General Manuel Tinio y Bundoc (1877–1924).
          </p>
        </div>

        {/* Asymmetric Curatorial Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Featured Artifact Showcase (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 rounded-lg overflow-hidden border border-[#d6cebe] shadow-md group">
              <img
                src="/src/assets/images/artifact_tinio_memorabilia_1791999500846.jpg"
                alt="Memorabilia of General Manuel Tinio in GTNHS Museum"
                className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="p-5 bg-[#0c3125] text-stone-100 border-t border-[#1b4d3c]">
                <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
                  <span>Permanent Shrine Exhibit</span>
                  <span>ACC.GTNHS.1966.001</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white mb-2">
                  General Manuel Tinio Revolutionary Sash & Sabre Shrine
                </h4>
                <p className="text-xs text-emerald-100/80 mb-4 leading-relaxed">
                  Ceremonial officer sash and sabre commemorating the youngest general of the Katipunan forces, housed in a velvet wood shadowbox.
                </p>
                {tinioItem && (
                  <button
                    onClick={() => onSelectTinioArtifact(tinioItem)}
                    className="w-full py-2 px-3 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors text-center"
                  >
                    View Archival Accession & QR Guide
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Historical Prose & Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Opening Drop Cap Essay */}
            <div className="space-y-4 text-stone-700 leading-relaxed text-base">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#0c3125]">
                Born in Licab, Nueva Ecija on June 17, 1877, Manuel Tinio came from an illustrious Novo Ecijano lineage. 
                At the youthful age of nineteen, when the flames of the 1896 Philippine Revolution ignited across Central Luzon, 
                Tinio gathered local patriots, demonstrating tactical brilliance and unyielding defense of national sovereignty.
              </p>
              <p>
                Recognizing his courage at the Battle of San Miguel and across the rugged cordilleras, General Emilio Aguinaldo 
                elevated Manuel Tinio to Brigadier General at just twenty years old. He was entrusted with the crucial command 
                of all revolutionary forces in Northern Luzon—becoming affectionately known as the 
                <em className="text-stone-900 font-serif"> "Hero of the North."</em>
              </p>
            </div>

            {/* Key Historical Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e2dacf]">
              <div className="bg-[#faf8f5] p-3.5 rounded border border-[#e6dfd3]">
                <span className="text-xs font-mono font-bold text-amber-600 uppercase">1896 · Katipunan</span>
                <p className="font-serif text-sm font-bold text-stone-900 mt-1">Youth in Arms</p>
                <p className="text-xs text-stone-600 mt-0.5">Organized provincial defense units in Nueva Ecija at 19.</p>
              </div>

              <div className="bg-[#faf8f5] p-3.5 rounded border border-[#e6dfd3]">
                <span className="text-xs font-mono font-bold text-amber-600 uppercase">1898 · General</span>
                <p className="font-serif text-sm font-bold text-stone-900 mt-1">Brigadier General</p>
                <p className="text-xs text-stone-600 mt-0.5">Youngest general officer of the First Philippine Republic.</p>
              </div>

              <div className="bg-[#faf8f5] p-3.5 rounded border border-[#e6dfd3]">
                <span className="text-xs font-mono font-bold text-amber-600 uppercase">1966 · The School</span>
                <p className="font-serif text-sm font-bold text-stone-900 mt-1">Living Heritage</p>
                <p className="text-xs text-stone-600 mt-0.5">General Tinio NHS established to nurture future leaders.</p>
              </div>
            </div>

            {/* Curatorial Citation */}
            <div className="bg-[#eef4f0] p-4 rounded border border-[#c3d9cc] text-xs text-stone-700 space-y-1">
              <span className="font-semibold text-[#0c3125] uppercase tracking-wide">
                Institutional Creed of GTNHS:
              </span>
              <p className="italic font-serif text-sm text-[#0c3125]">
                "Hindi lamang kaalaman ang aming hinuhubog, kundi ang dangal, tapang, at paglilingkod sa bayan na iniwan sa atin ni Heneral Tinio."
              </p>
              <p className="text-[11px] text-stone-500 pt-1">
                — DepEd General Tinio National High School Heritage Archive, Hall of Valor
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

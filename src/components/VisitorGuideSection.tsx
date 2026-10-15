import React from 'react';
import { MapPin, Clock, ShieldCheck, QrCode, Phone, Mail, Award, BookOpen, Users, Compass } from 'lucide-react';

interface VisitorGuideSectionProps {
  onOpenQrScanner: () => void;
}

export const VisitorGuideSection: React.FC<VisitorGuideSectionProps> = ({
  onOpenQrScanner,
}) => {
  return (
    <section id="visitor-guide" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs font-sans uppercase tracking-widest text-[#185a45] font-semibold mb-2">
          Visitor & Educational Guide
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0c3125]">
          Planning Your Visit to the Museum
        </h2>
        <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4 mb-4"></div>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Open to students, alumni, historical researchers, and visiting educators from across the Philippines.
        </p>
      </div>

      {/* 3 Step Interactive QR Guide for Mobile Visitors */}
      <div className="bg-[#f4efe6] rounded-xl p-6 sm:p-8 border border-[#e2dacf] space-y-6">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-wider font-semibold text-[#185a45] font-mono">
            Smart Museum System
          </p>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c3125]">
            How to Use QR Codes on Physical Exhibits
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Every physical display cabinet on campus has an engraved or printed placard with a permanent QR code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-[#e2dacf] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#eef4f0] text-[#114232] font-mono font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900">Locate the Stand Placard</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Find the bronze or acrylic card mounted on the front corner of the physical display cabinet or shadowbox.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#e2dacf] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#eef4f0] text-[#114232] font-mono font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900">Scan with Any Camera</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Open your smartphone camera or use our built-in scanner. No app download or account login is required.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#e2dacf] space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#eef4f0] text-[#114232] font-mono font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="font-serif font-bold text-base text-stone-900">Explore Rich History</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Access audio guides, high-resolution archival photos, historical context, and provenance records in seconds.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <button
            onClick={onOpenQrScanner}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-2 shadow-xs"
          >
            <QrCode className="w-4 h-4 text-stone-950" />
            <span>Launch Exhibit Scanner Demo</span>
          </button>
        </div>
      </div>

      {/* Museum Galleries Directory & Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-[#e2dacf] space-y-3">
          <div className="flex items-center gap-2 text-[#0c3125]">
            <Compass className="w-5 h-5 text-amber-500" />
            <h4 className="font-serif font-bold text-lg">Permanent Exhibition Pavilions</h4>
          </div>
          <ul className="divide-y divide-[#f0eae1] text-xs text-stone-700 space-y-1">
            <li className="py-2.5 flex justify-between items-start">
              <div>
                <strong className="text-stone-900 block font-serif">Pavilion 1: General Manuel Tinio Memorial Shrine</strong>
                <span className="text-stone-500">Katipunan revolutionary relics, sabres, medals, and Northern Luzon campaign history.</span>
              </div>
              <span className="font-mono text-[#185a45] shrink-0 font-semibold ml-2">Ground Flr</span>
            </li>
            <li className="py-2.5 flex justify-between items-start">
              <div>
                <strong className="text-stone-900 block font-serif">Pavilion 2: Founding Charter & Administrative Wing</strong>
                <span className="text-stone-500">1966 municipal charters, vintage typewriters, and handwritten student registries.</span>
              </div>
              <span className="font-mono text-[#185a45] shrink-0 font-semibold ml-2">East Wing</span>
            </li>
            <li className="py-2.5 flex justify-between items-start">
              <div>
                <strong className="text-stone-900 block font-serif">Pavilion 3: Alumni Hall of Fame & Photographs</strong>
                <span className="text-stone-500">Graduating class photos from 1960 to the present, pioneer faculty portraits.</span>
              </div>
              <span className="font-mono text-[#185a45] shrink-0 font-semibold ml-2">West Corridor</span>
            </li>
            <li className="py-2.5 flex justify-between items-start">
              <div>
                <strong className="text-stone-900 block font-serif">Pavilion 4: Performing Arts & Memorabilia</strong>
                <span className="text-stone-500">Rondalla instruments, championship banners, school bells, and sports trophies.</span>
              </div>
              <span className="font-mono text-[#185a45] shrink-0 font-semibold ml-2">North Wing</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#e2dacf] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0c3125] mb-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <h4 className="font-serif font-bold text-lg">Location & DepEd Credentials</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              General Tinio National High School is situated at the foothills of the Sierra Madre mountain range in Nueva Ecija.
            </p>

            <div className="space-y-2 text-xs text-stone-700 bg-[#faf8f5] p-4 rounded border border-[#e6dfd3]">
              <p><strong>School Name:</strong> General Tinio National High School (GTNHS)</p>
              <p><strong>Municipality:</strong> General Tinio (formerly Papaya), Nueva Ecija, 3104</p>
              <p><strong>DepEd Division:</strong> Schools Division of Nueva Ecija (Region III - Central Luzon)</p>
              <p><strong>DepEd School ID:</strong> 300806</p>
              <p><strong>Curatorial Email:</strong> heritage.gtnhs@deped.gov.ph</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f0eae1] text-xs text-stone-500 flex items-center justify-between">
            <span>Free Group & Tour Bookings</span>
            <span className="font-semibold text-[#185a45]">Mon–Fri 8AM–5PM</span>
          </div>
        </div>
      </div>
    </section>
  );
};

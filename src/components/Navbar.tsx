import React, { useState } from 'react';
import { QrCode, Menu, X, Landmark, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenQrScanner: () => void;
  isAdminLoggedIn: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenQrScanner,
  isAdminLoggedIn,
  onToggleAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0c3125] text-stone-100 border-b border-[#1b4d3c] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark (Single text element in display face) */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            <div className="w-10 h-10 rounded-full bg-[#185a45] border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0 group-hover:border-amber-400 transition-colors">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-institutional text-base sm:text-lg font-bold tracking-wider text-amber-200 uppercase whitespace-nowrap shrink-0 group-hover:text-amber-100 transition-colors">
                General Tinio National High School
              </span>
              <span className="text-[11px] font-sans tracking-widest uppercase text-emerald-200/80 -mt-0.5">
                Heritage Museum & Digital Archive
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 ${
                currentView === 'home'
                  ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                  : 'text-stone-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('collection')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 ${
                currentView === 'collection'
                  ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                  : 'text-stone-200'
              }`}
            >
              Collection
            </button>
            <button
              onClick={() => onNavigate('general-tinio')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 ${
                currentView === 'general-tinio'
                  ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                  : 'text-stone-200'
              }`}
            >
              General Tinio Legacy
            </button>
            <button
              onClick={() => onNavigate('visitor-guide')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 ${
                currentView === 'visitor-guide'
                  ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                  : 'text-stone-200'
              }`}
            >
              Visitor Guide
            </button>
            <button
              onClick={onToggleAdmin}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5'
                  : 'text-stone-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Staff Console' : 'Staff Login'}</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenQrScanner}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-stone-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 whitespace-nowrap shrink-0"
              title="Scan QR Code attached to physical museum exhibit or enter token"
            >
              <QrCode className="w-4 h-4 text-stone-950" />
              <span>Scan Exhibit QR</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-300 hover:text-white hover:bg-[#185a45] rounded transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1b4d3c] space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-stone-200 hover:bg-[#185a45] rounded"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('collection');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-stone-200 hover:bg-[#185a45] rounded"
            >
              Collection
            </button>
            <button
              onClick={() => {
                onNavigate('general-tinio');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-stone-200 hover:bg-[#185a45] rounded"
            >
              General Tinio Legacy
            </button>
            <button
              onClick={() => {
                onNavigate('visitor-guide');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-stone-200 hover:bg-[#185a45] rounded"
            >
              Visitor Guide
            </button>
            <button
              onClick={() => {
                onToggleAdmin();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-amber-300 hover:bg-[#185a45] rounded"
            >
              {isAdminLoggedIn ? 'Staff Console' : 'Staff Login'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

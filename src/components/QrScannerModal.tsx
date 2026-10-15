import React, { useState } from 'react';
import { X, QrCode, Search, Camera, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { MuseumItem } from '../types/museum';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MuseumItem[];
  onFoundItem: (item: MuseumItem) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  onFoundItem,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [scannerActive, setScannerActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLookupToken = (tokenToFind: string) => {
    const cleanToken = tokenToFind.trim();
    if (!cleanToken) {
      setErrorMessage('Please enter an exhibit token or QR code payload.');
      return;
    }

    // Handle full URL or plain token
    const token = cleanToken.includes('#item/')
      ? cleanToken.split('#item/')[1]
      : cleanToken.replace(/^.*\/item\//, '');

    const found = items.find((item) => item.publicToken.toLowerCase() === token.toLowerCase());

    if (found) {
      if (!found.isPublished || found.isArchived) {
        setErrorMessage(`Exhibit token "${token}" is currently in curatorial draft and not open to the public.`);
        return;
      }
      setErrorMessage('');
      onClose();
      onFoundItem(found);
    } else {
      setErrorMessage(`Exhibit with token "${token}" was not found in the museum registry. Verify the code on the physical display stand.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#faf8f5] rounded-xl shadow-2xl border border-[#d6cebe] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c3125] text-stone-100 border-b border-[#1b4d3c]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-300" />
            <h3 className="font-institutional text-sm font-bold tracking-wider text-amber-200 uppercase">
              Physical Exhibit QR Scanner
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-300 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Simulated Scanner Viewfinder */}
          <div className="relative aspect-4/3 bg-stone-950 rounded-lg overflow-hidden border-2 border-dashed border-amber-400/50 flex flex-col items-center justify-center text-center p-6 text-stone-200">
            {/* Viewfinder Target Reticle */}
            <div className="relative w-48 h-48 border-2 border-amber-400 rounded-lg flex items-center justify-center">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-300 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-300 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-300 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-300 -mb-1 -mr-1"></div>

              {/* Animated Laser Scanning Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>

              <Camera className="w-8 h-8 text-stone-400 opacity-40 absolute" />
            </div>

            <p className="text-xs text-stone-400 mt-4 max-w-xs">
              Point your camera at any museum display QR placard located on physical exhibit stands.
            </p>
          </div>

          {/* Direct Token Input Option */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
              Or Enter Permanent Exhibit Token Manually:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setErrorMessage('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupToken(tokenInput)}
                  placeholder="e.g. gtnhs-tok-1898-tinio"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-2 focus:ring-[#185a45] font-mono"
                />
              </div>
              <button
                onClick={() => handleLookupToken(tokenInput)}
                className="px-4 py-2.5 text-xs font-semibold uppercase text-stone-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded transition-colors whitespace-nowrap"
              >
                Resolve Exhibit
              </button>
            </div>
          </div>

          {/* Error Message if token not found */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Clickable Sample Exhibit Placards for Rapid Demo */}
          <div className="pt-2 border-t border-[#e2dacf] space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Quick Test: Select a Physical Museum Token</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.slice(0, 4).map((item) => (
                <button
                  key={item.itemId}
                  onClick={() => handleLookupToken(item.publicToken)}
                  className="p-2.5 bg-white border border-[#d8d1c5] hover:border-[#185a45] rounded text-left transition-colors group flex flex-col"
                >
                  <span className="font-serif font-bold text-xs text-stone-900 group-hover:text-[#114232] truncate">
                    {item.itemName}
                  </span>
                  <span className="font-mono text-[10px] text-stone-500 truncate">
                    {item.publicToken}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

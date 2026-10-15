import React, { useState, useEffect } from 'react';
import { X, QrCode, Download, Printer, MapPin, Calendar, Landmark, BookOpen, Volume2, VolumeX, Share2, Check, ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';
import { MuseumItem } from '../types/museum';

interface ItemDetailModalProps {
  item: MuseumItem;
  onClose: () => void;
  onSelectRelated?: (item: MuseumItem) => void;
  allItems: MuseumItem[];
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onSelectRelated,
  allItems,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showPrintPlacard, setShowPrintPlacard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  // Generate authentic scannable QR Code for the permanent public token
  useEffect(() => {
    const publicUrl = `${window.location.origin}/#item/${item.publicToken}`;
    QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0c3125', // GTNHS deep heritage green
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR generation failed:', err));
  }, [item.publicToken]);

  // Audio guide simulation using browser SpeechSynthesis
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${item.itemName}. Category: ${item.categoryName}. Accession number: ${item.accessionNumber}. ${item.description} Historical notes: ${item.historicalDetails}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/#item/${item.publicToken}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `GTNHS-QR-${item.accessionNumber}-${item.publicToken}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeImage = item.images[selectedImageIndex] || item.images[0];
  const relatedItems = allItems
    .filter((i) => i.itemId !== item.itemId && (i.categoryId === item.categoryId || i.era === item.era))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl bg-[#faf8f5] rounded-xl shadow-2xl border border-[#d6cebe] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Operational Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c3125] text-stone-100 border-b border-[#1b4d3c] shrink-0">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-300" />
            <span className="font-institutional text-xs tracking-wider uppercase text-amber-200">
              General Tinio NHS Museum Archive · {item.accessionNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleNarration}
              className={`p-1.5 rounded transition-colors text-xs flex items-center gap-1.5 ${
                isNarrating
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'text-stone-300 hover:text-amber-300 hover:bg-[#185a45]'
              }`}
              title="Listen to Curatorial Audio Guide"
            >
              {isNarrating ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isNarrating ? 'Reading Guide...' : 'Audio Guide'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 text-stone-300 hover:text-amber-300 hover:bg-[#185a45] rounded transition-colors text-xs flex items-center gap-1"
              title="Copy Public Item URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setShowPrintPlacard(!showPrintPlacard)}
              className="p-1.5 text-stone-300 hover:text-amber-300 hover:bg-[#185a45] rounded transition-colors text-xs flex items-center gap-1"
              title="Print Physical Museum Placard"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Placard</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-[#185a45] rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Printable Placard Preview Mode if toggled */}
          {showPrintPlacard && (
            <div className="p-6 bg-amber-50/70 border-2 border-dashed border-amber-600/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    Physical Museum Display Placard (Ready for Stand Display)
                  </h4>
                  <p className="text-xs text-stone-600">
                    Designed to be printed on cardstock and mounted beside the physical artifact in the GTNHS glass cases.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#0c3125] text-amber-300 rounded hover:bg-[#185a45] flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Placard</span>
                  </button>
                  <button
                    onClick={() => setShowPrintPlacard(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-300 rounded bg-white"
                  >
                    Hide
                  </button>
                </div>
              </div>

              {/* Museum Stand Physical Placard Layout */}
              <div className="max-w-md mx-auto bg-white p-6 rounded border border-stone-300 shadow-md text-stone-900 print:shadow-none print:border-stone-900 print:m-0">
                <div className="text-center border-b border-stone-300 pb-3 mb-4">
                  <p className="font-institutional text-xs tracking-wider font-bold text-[#0c3125]">
                    GENERAL TINIO NATIONAL HIGH SCHOOL
                  </p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                    Heritage Museum & Archival Collection
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] font-mono font-bold text-[#185a45]">{item.accessionNumber}</p>
                    <h5 className="font-serif font-bold text-base leading-tight text-stone-900">{item.itemName}</h5>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-snug">{item.description}</p>
                    <div className="pt-2 text-[10px] text-stone-500 font-sans space-y-0.5">
                      <p><strong>Era:</strong> {item.era}</p>
                      <p><strong>Location:</strong> {item.locationInMuseum}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center justify-center p-2 bg-[#faf8f5] border border-stone-200 rounded">
                    {qrCodeDataUrl && (
                      <img
                        src={qrCodeDataUrl}
                        alt={`QR Code for ${item.itemName}`}
                        className="w-24 h-24"
                      />
                    )}
                    <span className="text-[9px] font-mono text-stone-500 mt-1">Scan for Guide</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 text-center text-[9px] text-stone-400 uppercase tracking-widest">
                  DepEd Division of Nueva Ecija · School ID: 300806
                </div>
              </div>
            </div>
          )}

          {/* Exhibition Viewer: Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Section: Main Artwork & Thumbnails (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-4/3 bg-stone-900 rounded-lg overflow-hidden border border-[#d6cebe] shadow-inner flex items-center justify-center group">
                <img
                  src={activeImage?.imageUrl || '/src/assets/images/gtnhs_museum_hero_1791999499631.jpg'}
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {activeImage?.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-stone-950/80 p-3 text-xs text-stone-200 backdrop-blur-xs font-serif italic text-center">
                    {activeImage.caption}
                  </div>
                )}
              </div>

              {/* Multi-image thumbnail gallery strip if multiple photos exist */}
              {item.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {item.images.map((img, idx) => (
                    <button
                      key={img.imageId || idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-16 rounded overflow-hidden border-2 shrink-0 transition-colors ${
                        selectedImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-stone-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {img.isCover && (
                        <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-stone-950 text-[9px] font-bold text-center">
                          COVER
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Scannable Exhibit QR Code Box (Permanent UUID Token) */}
              <div className="bg-[#f4efe6] p-4 rounded-lg border border-[#e2dacf] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {qrCodeDataUrl ? (
                    <div className="bg-white p-2 rounded border border-stone-300 shrink-0 shadow-xs">
                      <img
                        src={qrCodeDataUrl}
                        alt="Scannable QR Code"
                        className="w-20 h-20"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-stone-200 rounded flex items-center justify-center text-stone-400">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs uppercase tracking-wider font-semibold text-[#0c3125] flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      <span>Permanent Exhibit QR Code</span>
                    </p>
                    <p className="font-mono text-xs text-stone-600 select-all">
                      UUID Token: <strong className="text-stone-900">{item.publicToken}</strong>
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Scannable with any smartphone camera or GTNHS QR scanner.
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadQr}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={() => setShowPrintPlacard(true)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-950" />
                    <span>Print Stand Placard</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Curatorial Prose & Accession Metadata (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Title and Unboxed Header Metadata */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                  <span className="font-semibold text-[#185a45]">{item.categoryName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.era}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
                  {item.itemName}
                </h2>
              </div>

              {/* Accession Definition List with Hairline Dividers */}
              <div className="bg-white rounded-lg border border-[#e2dacf] p-4 text-xs divide-y divide-[#f0eae1]">
                <div className="py-2 flex justify-between">
                  <span className="font-medium text-stone-500 uppercase tracking-wide">Accession Number</span>
                  <span className="font-mono font-bold text-[#185a45] tabular-nums">{item.accessionNumber}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-medium text-stone-500 uppercase tracking-wide">Physical Gallery Location</span>
                  <span className="font-medium text-stone-900 text-right">{item.locationInMuseum}</span>
                </div>
                {item.mediumMaterials && (
                  <div className="py-2 flex justify-between">
                    <span className="font-medium text-stone-500 uppercase tracking-wide">Medium / Materials</span>
                    <span className="text-stone-800 text-right max-w-[60%]">{item.mediumMaterials}</span>
                  </div>
                )}
                {item.dimensions && (
                  <div className="py-2 flex justify-between">
                    <span className="font-medium text-stone-500 uppercase tracking-wide">Dimensions</span>
                    <span className="text-stone-800 text-right">{item.dimensions}</span>
                  </div>
                )}
                <div className="py-2 flex flex-col gap-0.5">
                  <span className="font-medium text-stone-500 uppercase tracking-wide">Provenance & Acquisition</span>
                  <span className="text-stone-700 italic">{item.provenance}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-stone-900 text-sm uppercase tracking-wide">
                  Exhibit Overview
                </h4>
                <p className="text-stone-700 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Historical Context Essay with Drop Cap */}
              <div className="space-y-2 pt-2 border-t border-[#e2dacf]">
                <h4 className="font-serif font-bold text-stone-900 text-sm uppercase tracking-wide">
                  Historical Significance
                </h4>
                <div className="text-stone-700 text-sm leading-relaxed">
                  <p className="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-[#0c3125]">
                    {item.historicalDetails}
                  </p>
                </div>
              </div>

              {/* Curator Notes if present */}
              {item.curatorNotes && (
                <div className="p-3 bg-[#f7f4ee] rounded border border-[#e6dfd3] text-xs text-stone-600 space-y-1">
                  <span className="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">
                    Curatorial Preservation Note:
                  </span>
                  <p className="italic">{item.curatorNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Artifacts Row */}
          {relatedItems.length > 0 && onSelectRelated && (
            <div className="pt-8 border-t border-[#e2dacf] space-y-4">
              <h4 className="font-serif font-bold text-stone-900 text-base">
                Related Holdings in this Collection
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedItems.map((rel) => {
                  const relCover = rel.images.find((i) => i.isCover) || rel.images[0];
                  return (
                    <div
                      key={rel.itemId}
                      onClick={() => onSelectRelated(rel)}
                      className="cursor-pointer group bg-white p-3 rounded-lg border border-[#e2dacf] hover:border-[#185a45] transition-colors flex gap-3 items-center"
                    >
                      <div className="w-14 h-14 bg-stone-100 rounded overflow-hidden shrink-0">
                        {relCover && (
                          <img
                            src={relCover.imageUrl}
                            alt={rel.itemName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-stone-500 font-mono">{rel.accessionNumber}</p>
                        <h5 className="font-serif font-bold text-xs text-stone-900 truncate group-hover:text-[#114232]">
                          {rel.itemName}
                        </h5>
                        <p className="text-[11px] text-stone-500 truncate">{rel.categoryName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Image as ImageIcon, QrCode, ArrowUpRight, Clock, MapPin, Eye } from 'lucide-react';
import { MuseumCategory, MuseumItem } from '../types/museum';

interface CollectionBrowserProps {
  items: MuseumItem[];
  categories: MuseumCategory[];
  onSelectItem: (item: MuseumItem) => void;
  isAdmin: boolean;
}

export const CollectionBrowser: React.FC<CollectionBrowserProps> = ({
  items,
  categories,
  onSelectItem,
  isAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'accession'>('accession');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'gallery'>('grid');
  const [showArchivedAndDrafts, setShowArchivedAndDrafts] = useState(false);

  // Filter items based on publication status (public visitors only see published, non-archived items)
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Public visibility rule
        if (!isAdmin || !showArchivedAndDrafts) {
          if (!item.isPublished || item.isArchived) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
          return false;
        }

        // Search filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = item.itemName.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchAccession = item.accessionNumber.toLowerCase().includes(q);
          const matchEra = item.era.toLowerCase().includes(q);
          const matchProvenance = item.provenance.toLowerCase().includes(q);
          return matchName || matchDesc || matchAccession || matchEra || matchProvenance;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        if (sortBy === 'oldest') return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        if (sortBy === 'title') return a.itemName.localeCompare(b.itemName);
        if (sortBy === 'accession') return a.accessionNumber.localeCompare(b.accessionNumber);
        return 0;
      });
  }, [items, selectedCategory, searchQuery, sortBy, isAdmin, showArchivedAndDrafts]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<number | string, number> = { all: 0 };
    items.forEach((item) => {
      if (!isAdmin || !showArchivedAndDrafts) {
        if (!item.isPublished || item.isArchived) return;
      }
      counts['all'] = (counts['all'] || 0) + 1;
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [items, isAdmin, showArchivedAndDrafts]);

  return (
    <section id="collection" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#e2dacf]">
        <div>
          <p className="text-xs font-sans uppercase tracking-widest text-[#185a45] font-semibold mb-1">
            Permanent Museum Catalog
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0c3125]">
            Explore the School Heritage Archives
          </h2>
          <p className="text-stone-600 text-sm mt-1 max-w-xl">
            Each artifact is indexed with its historical accession credentials and scannable QR token.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#ede8df] rounded-lg border border-[#ded7cb] self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Curatorial Card Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Archival Register Table"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Register</span>
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-3 py-1.5 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
              viewMode === 'gallery'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Visual Gallery Wall"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gallery</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artifact title, era, accession no. (e.g. ACC.GTNHS), or donor..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-2 focus:ring-[#185a45] focus:border-transparent placeholder:text-stone-400 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2.5 px-3 text-xs bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-2 focus:ring-[#185a45] text-stone-800"
            >
              <option value="accession">Accession Number</option>
              <option value="newest">Recently Catalogued</option>
              <option value="oldest">Oldest Catalogued</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons (Functional Segmented Control) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#0c3125] text-amber-300 font-semibold shadow-xs'
                : 'bg-[#ede8df] text-stone-700 hover:bg-[#e2dacf]'
            }`}
          >
            All Collections ({categoryCounts['all'] || 0})
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.categoryId;
            return (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategory(cat.categoryId)}
                className={`px-3.5 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0c3125] text-amber-300 font-semibold shadow-xs'
                    : 'bg-[#ede8df] text-stone-700 hover:bg-[#e2dacf]'
                }`}
              >
                {cat.categoryName} ({categoryCounts[cat.categoryId] || 0})
              </button>
            );
          })}

          {isAdmin && (
            <div className="ml-auto flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900">
                <input
                  type="checkbox"
                  checked={showArchivedAndDrafts}
                  onChange={(e) => setShowArchivedAndDrafts(e.target.checked)}
                  className="rounded border-stone-300 text-[#185a45] focus:ring-[#185a45]"
                />
                <span>Include Drafts & Archived (Staff View)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Result Count and Active Filters Notice */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-6 font-sans">
        <div>
          Showing <span className="font-semibold text-stone-800">{filteredItems.length}</span> curated items
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </div>
        {filteredItems.length > 0 && (
          <span className="hidden sm:inline">Click any card to inspect full provenance & QR placard</span>
        )}
      </div>

      {/* Render Items: Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const coverImage = item.images.find((img) => img.isCover) || item.images[0];
            return (
              <article
                key={item.itemId}
                onClick={() => onSelectItem(item)}
                className="group cursor-pointer bg-white rounded-lg border border-[#e2dacf] overflow-hidden hover:border-[#185a45] hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image Container with Fallback */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage.imageUrl}
                      alt={item.itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}

                  {/* QR Quick Indicator Overlay on Hover */}
                  <div className="absolute top-3 right-3 bg-stone-950/75 backdrop-blur-xs text-amber-300 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <QrCode className="w-4 h-4" />
                  </div>

                  {/* Staff Draft Notice if applicable */}
                  {!item.isPublished && (
                    <div className="absolute top-3 left-3 bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Draft Exhibit
                    </div>
                  )}
                  {item.isArchived && (
                    <div className="absolute top-3 left-3 bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Archived
                    </div>
                  )}
                </div>

                {/* Card Content (Zero-Pill Metadata Discipline) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Unboxed Metadata with Typographic Separators */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                      <span className="font-semibold text-[#185a45]">{item.categoryName || 'General Exhibit'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-stone-600">{item.accessionNumber}</span>
                    </div>

                    {/* Headline */}
                    <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#114232] transition-colors leading-snug">
                      {item.itemName}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer: Location & Era */}
                  <div className="pt-4 mt-4 border-t border-[#f0eae1] flex items-center justify-between text-[11px] text-stone-500">
                    <div className="flex items-center gap-1 truncate max-w-[70%]">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{item.locationInMuseum}</span>
                    </div>
                    <span className="text-amber-800 font-medium group-hover:underline flex items-center gap-0.5">
                      Inspect <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Render Items: Archival Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-[#e2dacf] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f4ee] border-b border-[#e2dacf] text-xs font-semibold text-stone-700 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5">Accession No.</th>
                  <th scope="col" className="px-4 py-3.5">Artifact Name</th>
                  <th scope="col" className="px-4 py-3.5">Category</th>
                  <th scope="col" className="px-4 py-3.5">Era / Period</th>
                  <th scope="col" className="px-4 py-3.5">Museum Location</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eae1]">
                {filteredItems.map((item) => (
                  <tr
                    key={item.itemId}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-[#faf8f5] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-[#185a45] font-semibold whitespace-nowrap">
                      {item.accessionNumber}
                    </td>
                    <td className="px-4 py-3.5 font-serif font-bold text-stone-900 group-hover:text-[#114232]">
                      <div className="flex items-center gap-2">
                        <span>{item.itemName}</span>
                        {!item.isPublished && (
                          <span className="text-[10px] font-sans font-bold text-amber-700 bg-amber-50 px-1 rounded">
                            DRAFT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-stone-600 whitespace-nowrap">
                      {item.categoryName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-stone-600 whitespace-nowrap">
                      {item.era}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                      {item.locationInMuseum}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#114232] hover:text-amber-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Render Items: Gallery Wall View */}
      {viewMode === 'gallery' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const coverImage = item.images.find((img) => img.isCover) || item.images[0];
            return (
              <div
                key={item.itemId}
                onClick={() => onSelectItem(item)}
                className="group relative h-72 rounded-lg overflow-hidden border border-[#d6cebe] cursor-pointer shadow-xs bg-stone-900"
              >
                <img
                  src={coverImage?.imageUrl || '/src/assets/images/gtnhs_museum_hero_1791999499631.jpg'}
                  alt={item.itemName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-sans mb-1">
                    <span>{item.categoryName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.accessionNumber}</span>
                  </div>
                  <h4 className="font-serif text-base font-bold leading-tight group-hover:text-amber-200 transition-colors">
                    {item.itemName}
                  </h4>
                  <p className="text-xs text-stone-300 line-clamp-1 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-lg border border-dashed border-[#d8d1c5] my-6">
          <Filter className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-900">No Museum Relics Found</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto mt-1 mb-4">
            We could not find any exhibit matching your current filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold uppercase text-stone-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};

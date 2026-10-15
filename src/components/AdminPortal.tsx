import React, { useState } from 'react';
import { 
  Shield, Plus, Edit3, Trash2, Eye, EyeOff, Archive, CheckCircle, 
  AlertTriangle, QrCode, Printer, Image as ImageIcon, History, 
  FolderTree, LogOut, ArrowLeft, Search, Save, X, ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import { MuseumItem, MuseumCategory, AdminUser, ActivityLog, MuseumImage } from '../types/museum';

interface AdminPortalProps {
  currentUser: AdminUser | null;
  items: MuseumItem[];
  categories: MuseumCategory[];
  logs: ActivityLog[];
  onSaveItem: (item: Partial<MuseumItem>) => void;
  onDeleteItem: (itemId: number) => void;
  onTogglePublish: (itemId: number) => void;
  onToggleArchive: (itemId: number) => void;
  onLogout: () => void;
  onLogin: (role: 'admin' | 'editor') => void;
  onBackToPublic: () => void;
  onPreviewItem: (item: MuseumItem) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  items,
  categories,
  logs,
  onSaveItem,
  onDeleteItem,
  onTogglePublish,
  onToggleArchive,
  onLogout,
  onLogin,
  onBackToPublic,
  onPreviewItem,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'placards' | 'logs' | 'categories'>('items');
  const [editingItem, setEditingItem] = useState<MuseumItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'all'>('all');

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<number>(1);
  const [formAccession, setFormAccession] = useState('');
  const [formEra, setFormEra] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formProvenance, setFormProvenance] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHistoricalDetails, setFormHistoricalDetails] = useState('');
  const [formCuratorNotes, setFormCuratorNotes] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsArchived, setFormIsArchived] = useState(false);

  // Placards print batch state
  const [selectedPlacardIds, setSelectedPlacardIds] = useState<number[]>([]);
  const [placardQrMap, setPlacardQrMap] = useState<Record<string, string>>({});

  // Generate QR codes for placards
  React.useEffect(() => {
    const generateAllQrs = async () => {
      const map: Record<string, string> = {};
      for (const item of items) {
        try {
          const publicUrl = `${window.location.origin}/#item/${item.publicToken}`;
          const qr = await QRCode.toDataURL(publicUrl, {
            width: 200,
            margin: 1,
            color: { dark: '#0c3125', light: '#ffffff' },
          });
          map[item.publicToken] = qr;
        } catch (e) {
          console.error(e);
        }
      }
      setPlacardQrMap(map);
    };
    generateAllQrs();
  }, [items]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(categories[0]?.categoryId || 1);
    setFormAccession(`ACC.GTNHS.${new Date().getFullYear()}.${String(items.length + 1).padStart(3, '0')}`);
    setFormEra('Mid-Century Philippine School Heritage');
    setFormLocation('Central Gallery, Case 01');
    setFormMaterials('');
    setFormProvenance('Donated to General Tinio NHS Heritage Archives');
    setFormDescription('');
    setFormHistoricalDetails('');
    setFormCuratorNotes('');
    setFormImageUrl('/src/assets/images/gtnhs_museum_hero_1791999499631.jpg');
    setFormIsPublished(true);
    setFormIsArchived(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MuseumItem) => {
    setEditingItem(item);
    setFormName(item.itemName);
    setFormCategory(item.categoryId);
    setFormAccession(item.accessionNumber);
    setFormEra(item.era);
    setFormLocation(item.locationInMuseum);
    setFormMaterials(item.mediumMaterials || '');
    setFormProvenance(item.provenance);
    setFormDescription(item.description);
    setFormHistoricalDetails(item.historicalDetails);
    setFormCuratorNotes(item.curatorNotes || '');
    const cover = item.images.find((img) => img.isCover) || item.images[0];
    setFormImageUrl(cover?.imageUrl || '');
    setFormIsPublished(item.isPublished);
    setFormIsArchived(item.isArchived);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      alert('Please fill out the artifact name and description.');
      return;
    }

    const categoryObj = categories.find((c) => c.categoryId === Number(formCategory));

    if (editingItem) {
      // Editing item: preserve permanent publicToken!
      onSaveItem({
        itemId: editingItem.itemId,
        publicToken: editingItem.publicToken, // Permanent Token Rule!
        itemName: formName,
        categoryId: Number(formCategory),
        categoryName: categoryObj?.categoryName || 'General Artifact',
        accessionNumber: formAccession,
        era: formEra,
        locationInMuseum: formLocation,
        mediumMaterials: formMaterials,
        provenance: formProvenance,
        description: formDescription,
        historicalDetails: formHistoricalDetails,
        curatorNotes: formCuratorNotes,
        isPublished: formIsPublished,
        isArchived: formIsArchived,
        updatedBy: currentUser?.adminId || 1,
        updatedAt: new Date().toISOString(),
        images: [
          {
            imageId: editingItem.images[0]?.imageId || Date.now(),
            itemId: editingItem.itemId,
            imageUrl: formImageUrl || '/src/assets/images/gtnhs_museum_hero_1791999499631.jpg',
            imagePublicId: 'gtnhs/user_upload_' + Date.now(),
            isCover: true,
            caption: formName,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });
    } else {
      // Create new item
      const newUUID = 'gtnhs-tok-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
      onSaveItem({
        itemId: Date.now(),
        publicToken: newUUID,
        itemName: formName,
        categoryId: Number(formCategory),
        categoryName: categoryObj?.categoryName || 'General Artifact',
        accessionNumber: formAccession,
        era: formEra,
        locationInMuseum: formLocation,
        mediumMaterials: formMaterials,
        provenance: formProvenance,
        description: formDescription,
        historicalDetails: formHistoricalDetails,
        curatorNotes: formCuratorNotes,
        isPublished: formIsPublished,
        isArchived: formIsArchived,
        createdBy: currentUser?.adminId || 1,
        updatedBy: currentUser?.adminId || 1,
        dateAdded: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: [
          {
            imageId: Date.now(),
            itemId: Date.now(),
            imageUrl: formImageUrl || '/src/assets/images/gtnhs_museum_hero_1791999499631.jpg',
            imagePublicId: 'gtnhs/user_upload_' + Date.now(),
            isCover: true,
            caption: formName,
            uploadedAt: new Date().toISOString(),
          },
        ],
      });
    }

    setIsFormOpen(false);
  };

  // If user is not logged in, render secure staff login screen
  if (!currentUser) {
    return (
      <div className="py-16 px-4 max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-[#e2dacf] overflow-hidden">
          <div className="p-6 bg-[#0c3125] text-stone-100 text-center">
            <Shield className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="font-institutional text-base font-bold text-amber-200 tracking-wider uppercase">
              GTNHS Staff & Curatorial Portal
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              General Tinio National High School Heritage Archive Management
            </p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Authorized school staff can manage the museum collection, generate permanent QR codes, update catalog records, and review audit activity logs.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => onLogin('admin')}
                className="w-full py-3 px-4 bg-[#0c3125] text-amber-300 font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#185a45] transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Log in as Administrator (Dr. Ramos)</span>
              </button>

              <button
                onClick={() => onLogin('editor')}
                className="w-full py-3 px-4 bg-[#ede8df] text-stone-800 font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#e2dacf] transition-colors flex items-center justify-center gap-2 border border-stone-300"
              >
                <Edit3 className="w-4 h-4 text-stone-600" />
                <span>Log in as Curatorial Editor (Prof. Del Rosario)</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#f0eae1] text-center">
              <button
                onClick={onBackToPublic}
                className="text-xs text-stone-500 hover:text-[#114232] inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Museum Website</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Items for Admin Management
  const filteredAdminItems = items.filter((item) => {
    if (selectedCategoryFilter !== 'all' && item.categoryId !== selectedCategoryFilter) return false;
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      return (
        item.itemName.toLowerCase().includes(q) ||
        item.accessionNumber.toLowerCase().includes(q) ||
        item.publicToken.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Staff Navigation Header */}
      <div className="bg-[#0c3125] text-stone-100 rounded-xl p-6 border border-[#1b4d3c] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-mono mb-1">
            <span className="uppercase tracking-widest">General Tinio NHS Museum Console</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{currentUser.role} Mode</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Curatorial Management System
          </h2>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Logged in as <strong>{currentUser.name}</strong> (@{currentUser.username})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-stone-950" />
            <span>Catalogue New Exhibit</span>
          </button>

          <button
            onClick={onBackToPublic}
            className="px-3.5 py-2 text-xs font-medium text-stone-200 bg-[#185a45] hover:bg-[#1f6e55] rounded transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Gallery</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2 text-xs font-medium text-stone-300 hover:text-white hover:bg-red-950/60 rounded transition-colors flex items-center gap-1"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Module Tabs (Segmented Control) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e2dacf] pb-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-2 ${
            activeTab === 'items'
              ? 'bg-[#0c3125] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#ede8df]'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Artifact Catalog ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('placards')}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-2 ${
            activeTab === 'placards'
              ? 'bg-[#0c3125] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#ede8df]'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>QR Display Cards & Placards</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-[#0c3125] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#ede8df]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Activity Audit Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#0c3125] text-amber-300 shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#ede8df]'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: ITEMS MANAGEMENT */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search catalog by title or token..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-1 focus:ring-[#185a45]"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-stone-500 font-medium">Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="py-1.5 px-2.5 text-xs bg-white border border-[#d8d1c5] rounded text-stone-800"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-[#e2dacf] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f4ee] border-b border-[#e2dacf] font-semibold text-stone-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Accession / Token</th>
                    <th className="px-4 py-3">Artifact Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Public Status</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {filteredAdminItems.map((item) => (
                    <tr key={item.itemId} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#185a45]">{item.accessionNumber}</div>
                        <div className="text-[10px] font-mono text-stone-400 truncate max-w-[140px]">
                          {item.publicToken}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-serif font-bold text-stone-900">{item.itemName}</div>
                        <div className="text-[11px] text-stone-500 truncate max-w-xs">{item.description}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{item.categoryName}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => onTogglePublish(item.itemId)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${
                              item.isPublished
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {item.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{item.isPublished ? 'Published' : 'Draft'}</span>
                          </button>

                          {item.isArchived && (
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded uppercase font-semibold">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{item.locationInMuseum}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewItem(item)}
                            className="p-1.5 text-stone-500 hover:text-[#114232] rounded hover:bg-stone-100"
                            title="Preview Public Exhibit Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-stone-500 hover:text-amber-700 rounded hover:bg-stone-100"
                            title="Edit Artifact Metadata"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onToggleArchive(item.itemId)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-100"
                            title={item.isArchived ? 'Unarchive Exhibit' : 'Archive Exhibit'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>

                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove "${item.itemName}" from the database?`)) {
                                  onDeleteItem(item.itemId);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-700 rounded hover:bg-red-50"
                              title="Delete Item (Admin Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLACARDS AND QR PRINTING */}
      {activeTab === 'placards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2dacf]">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Museum Display Stand QR Placards
              </h3>
              <p className="text-xs text-stone-600">
                Print standardized display cards to mount beside physical glass cases. Visitors scan them with phones.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-semibold bg-[#0c3125] text-amber-300 rounded hover:bg-[#185a45] flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Placards</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="bg-white p-5 rounded-lg border border-stone-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                    <span className="font-institutional text-[11px] font-bold text-[#0c3125]">
                      GENERAL TINIO NATIONAL HIGH SCHOOL
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 font-bold">{item.accessionNumber}</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-serif font-bold text-sm text-stone-900 leading-tight">
                        {item.itemName}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-3 leading-snug">
                        {item.description}
                      </p>
                      <div className="pt-2 text-[10px] text-stone-500 space-y-0.5">
                        <p><strong>Period:</strong> {item.era}</p>
                        <p><strong>Physical Stand:</strong> {item.locationInMuseum}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center p-2 bg-[#faf8f5] border border-stone-200 rounded">
                      {placardQrMap[item.publicToken] ? (
                        <img
                          src={placardQrMap[item.publicToken]}
                          alt="Exhibit QR"
                          className="w-20 h-20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-stone-100 flex items-center justify-center text-stone-400">
                          <QrCode className="w-8 h-8" />
                        </div>
                      )}
                      <span className="text-[9px] font-mono text-stone-500 mt-1">Scan for Guide</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span>UUID: {item.publicToken}</span>
                  <span>DepEd ID: 300806</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border border-[#e2dacf] overflow-hidden shadow-xs">
          <div className="p-4 bg-[#f7f4ee] border-b border-[#e2dacf]">
            <h3 className="font-serif font-bold text-sm text-stone-900">
              System Audit Trail & Curatorial History
            </h3>
            <p className="text-xs text-stone-500">
              Immutable record of staff actions, uploads, and state changes as defined in `activity_logs`.
            </p>
          </div>
          <div className="divide-y divide-[#f0eae1] text-xs">
            {logs.map((log) => (
              <div key={log.logId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#faf8f5]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0c3125]">@{log.adminUsername}</span>
                    <span className="text-stone-400" aria-hidden="true">·</span>
                    <span className="font-mono text-[10px] uppercase bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                      {log.action}
                    </span>
                    <span className="text-stone-400" aria-hidden="true">·</span>
                    <span className="text-stone-500 font-mono text-[11px]">{log.entityId}</span>
                  </div>
                  <p className="text-stone-700">{log.details}</p>
                </div>
                <div className="text-[11px] text-stone-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div key={cat.categoryId} className="bg-white p-5 rounded-lg border border-[#e2dacf] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-base text-stone-900">{cat.categoryName}</h4>
                <span className="font-mono text-xs text-[#185a45] font-semibold">CAT-0{cat.categoryId}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{cat.description}</p>
              <div className="pt-2 text-xs text-stone-500 font-medium">
                Holds {items.filter((i) => i.categoryId === cat.categoryId).length} catalogued items
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ITEM FORM (CREATE / EDIT) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#faf8f5] rounded-xl shadow-2xl border border-[#d6cebe] overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0c3125] text-stone-100 border-b border-[#1b4d3c] shrink-0">
              <h3 className="font-institutional text-sm font-bold text-amber-200 uppercase tracking-wider">
                {editingItem ? 'Edit Museum Artifact Record' : 'Catalogue New Historical Relic'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-stone-300 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {editingItem && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-stone-800">
                  <p className="font-mono text-[11px]">
                    <strong>Permanent QR Public Token:</strong> {editingItem.publicToken} (Immutable per specifications)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Artifact / Exhibit Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Founding Graduation Diploma Class of 1960"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-1 focus:ring-[#185a45] text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded text-stone-900"
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Accession Number
                  </label>
                  <input
                    type="text"
                    value={formAccession}
                    onChange={(e) => setFormAccession(e.target.value)}
                    placeholder="ACC.GTNHS.1966.001"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded font-mono text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Historical Era / Time Period
                  </label>
                  <input
                    type="text"
                    value={formEra}
                    onChange={(e) => setFormEra(e.target.value)}
                    placeholder="e.g. Revolutionary Era (1898) or Post-War 1960s"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Physical Museum Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Main Hall, Glass Cabinet 02"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Medium / Materials
                  </label>
                  <input
                    type="text"
                    value={formMaterials}
                    onChange={(e) => setFormMaterials(e.target.value)}
                    placeholder="e.g. Cast iron, parchment, narra wood"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Provenance / Donor Acquisition
                  </label>
                  <input
                    type="text"
                    value={formProvenance}
                    onChange={(e) => setFormProvenance(e.target.value)}
                    placeholder="e.g. Donated by Alumni Class of 1968"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded text-stone-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Cover Image URL (Cloudinary / Local Path)
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="/src/assets/images/artifact_tinio_memorabilia_1791999500846.jpg"
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded font-mono text-stone-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Public Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                    placeholder="Concise public overview of the artifact for museum visitors..."
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-1 focus:ring-[#185a45] text-stone-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Historical Details & Scholastic Significance
                  </label>
                  <textarea
                    rows={4}
                    value={formHistoricalDetails}
                    onChange={(e) => setFormHistoricalDetails(e.target.value)}
                    placeholder="In-depth historical narrative, biographical connections, and context..."
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded focus:outline-none focus:ring-1 focus:ring-[#185a45] text-stone-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wide">
                    Curatorial Preservation Notes
                  </label>
                  <input
                    type="text"
                    value={formCuratorNotes}
                    onChange={(e) => setFormCuratorNotes(e.target.value)}
                    placeholder="e.g. Stored at 50% RH under UV-protective glazing."
                    className="w-full px-3 py-2 bg-white border border-[#d8d1c5] rounded text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="rounded border-stone-300 text-[#185a45] focus:ring-[#185a45]"
                    />
                    <span>Publish Immediately (Visible to Public Visitors)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={formIsArchived}
                      onChange={(e) => setFormIsArchived(e.target.checked)}
                      className="rounded border-stone-300 text-[#185a45] focus:ring-[#185a45]"
                    />
                    <span>Archive (Hide from public search but retain record)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2dacf] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-stone-950 font-semibold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 rounded shadow-xs"
                >
                  {editingItem ? 'Save Updates' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OperationalRibbon } from './components/OperationalRibbon';
import { HeroExhibition } from './components/HeroExhibition';
import { GeneralTinioSection } from './components/GeneralTinioSection';
import { CollectionBrowser } from './components/CollectionBrowser';
import { ItemDetailModal } from './components/ItemDetailModal';
import { QrScannerModal } from './components/QrScannerModal';
import { AdminPortal } from './components/AdminPortal';
import { VisitorGuideSection } from './components/VisitorGuideSection';
import { Footer } from './components/Footer';
import { 
  INITIAL_ITEMS, 
  INITIAL_CATEGORIES, 
  INITIAL_ADMINS, 
  INITIAL_LOGS 
} from './data/mockDatabase';
import { MuseumItem, MuseumCategory, AdminUser, ActivityLog } from './types/museum';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [items, setItems] = useState<MuseumItem[]>(INITIAL_ITEMS);
  const [categories] = useState<MuseumCategory[]>(INITIAL_CATEGORIES);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  
  // Modals
  const [selectedItem, setSelectedItem] = useState<MuseumItem | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Check URL hash for direct QR token scan landing: e.g. /#item/gtnhs-tok-1898-tinio
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#item/')) {
        const token = hash.replace('#item/', '');
        const found = items.find((i) => i.publicToken === token);
        if (found) {
          setSelectedItem(found);
        }
      } else if (hash === '#collection') {
        setCurrentView('collection');
      } else if (hash === '#general-tinio') {
        setCurrentView('general-tinio');
      } else if (hash === '#visitor-guide') {
        setCurrentView('visitor-guide');
      } else if (hash === '#admin') {
        setCurrentView('admin');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [items]);

  // Audio guide soundscape generator using Web Audio API
  useEffect(() => {
    if (isMuted) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Create a soft, warm ambient chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3);

      return () => {
        ctx.close();
      };
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  }, [isMuted]);

  // Navigation Handler
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.location.hash = view === 'home' ? '' : `#${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Item Detail
  const handleSelectItem = (item: MuseumItem) => {
    setSelectedItem(item);
    window.location.hash = `#item/${item.publicToken}`;
  };

  // Close Item Detail
  const handleCloseItem = () => {
    setSelectedItem(null);
    if (window.location.hash.startsWith('#item/')) {
      window.location.hash = currentView === 'home' ? '' : `#${currentView}`;
    }
  };

  // Admin Actions
  const handleLogin = (role: 'admin' | 'editor') => {
    const user = INITIAL_ADMINS.find((a) => a.role === role) || INITIAL_ADMINS[0];
    setCurrentUser(user);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleSaveItem = (updatedItem: Partial<MuseumItem>) => {
    const isNew = !items.some((i) => i.itemId === updatedItem.itemId);
    
    if (isNew) {
      const newItem = updatedItem as MuseumItem;
      setItems((prev) => [newItem, ...prev]);
      
      // Log Action
      const newLog: ActivityLog = {
        logId: Date.now(),
        adminId: currentUser?.adminId || 1,
        adminUsername: currentUser?.username || 'admin_gtnhs',
        action: 'CREATE',
        entityType: 'MUSEUM_ITEM',
        entityId: newItem.publicToken,
        details: `Catalogued new exhibit: "${newItem.itemName}" in ${newItem.categoryName}`,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.itemId === updatedItem.itemId ? ({ ...i, ...updatedItem } as MuseumItem) : i))
      );

      // Log Action
      const newLog: ActivityLog = {
        logId: Date.now(),
        adminId: currentUser?.adminId || 1,
        adminUsername: currentUser?.username || 'admin_gtnhs',
        action: 'UPDATE',
        entityType: 'MUSEUM_ITEM',
        entityId: updatedItem.publicToken || 'unknown',
        details: `Updated metadata for exhibit: "${updatedItem.itemName}"`,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleDeleteItem = (itemId: number) => {
    const itemToDelete = items.find((i) => i.itemId === itemId);
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));

    if (itemToDelete) {
      const newLog: ActivityLog = {
        logId: Date.now(),
        adminId: currentUser?.adminId || 1,
        adminUsername: currentUser?.username || 'admin_gtnhs',
        action: 'DELETE',
        entityType: 'MUSEUM_ITEM',
        entityId: itemToDelete.publicToken,
        details: `Deleted exhibit: "${itemToDelete.itemName}"`,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleTogglePublish = (itemId: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.itemId === itemId) {
          const newStatus = !i.isPublished;
          const newLog: ActivityLog = {
            logId: Date.now(),
            adminId: currentUser?.adminId || 1,
            adminUsername: currentUser?.username || 'admin_gtnhs',
            action: newStatus ? 'PUBLISH' : 'UNPUBLISH',
            entityType: 'MUSEUM_ITEM',
            entityId: i.publicToken,
            details: `${newStatus ? 'Published' : 'Unpublished'} exhibit: "${i.itemName}"`,
            timestamp: new Date().toISOString(),
          };
          setLogs((l) => [newLog, ...l]);
          return { ...i, isPublished: newStatus };
        }
        return i;
      })
    );
  };

  const handleToggleArchive = (itemId: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.itemId === itemId) {
          const newArchive = !i.isArchived;
          const newLog: ActivityLog = {
            logId: Date.now(),
            adminId: currentUser?.adminId || 1,
            adminUsername: currentUser?.username || 'admin_gtnhs',
            action: newArchive ? 'ARCHIVE' : 'UNARCHIVE',
            entityType: 'MUSEUM_ITEM',
            entityId: i.publicToken,
            details: `${newArchive ? 'Archived' : 'Unarchived'} exhibit: "${i.itemName}"`,
            timestamp: new Date().toISOString(),
          };
          setLogs((l) => [newLog, ...l]);
          return { ...i, isArchived: newArchive };
        }
        return i;
      })
    );
  };

  const tinioItem = items.find((i) => i.publicToken === 'gtnhs-tok-1898-tinio');

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-[#0c3125] selection:text-amber-200">
      {/* Strict 3-Zone Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        isAdminLoggedIn={!!currentUser}
        onToggleAdmin={() => {
          if (currentUser) {
            handleNavigate('admin');
          } else {
            handleLogin('admin');
          }
        }}
      />

      {/* Operational Utility Ribbon */}
      <OperationalRibbon
        isMuted={isMuted}
        onToggleAudio={() => setIsMuted(!isMuted)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroExhibition
              onExploreCollection={() => handleNavigate('collection')}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />
            <GeneralTinioSection
              onSelectTinioArtifact={handleSelectItem}
              tinioItem={tinioItem}
            />
            <CollectionBrowser
              items={items}
              categories={categories}
              onSelectItem={handleSelectItem}
              isAdmin={!!currentUser}
            />
            <VisitorGuideSection
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />
          </>
        )}

        {currentView === 'collection' && (
          <div className="py-4">
            <CollectionBrowser
              items={items}
              categories={categories}
              onSelectItem={handleSelectItem}
              isAdmin={!!currentUser}
            />
          </div>
        )}

        {currentView === 'general-tinio' && (
          <div className="py-6">
            <GeneralTinioSection
              onSelectTinioArtifact={handleSelectItem}
              tinioItem={tinioItem}
            />
          </div>
        )}

        {currentView === 'visitor-guide' && (
          <div className="py-6">
            <VisitorGuideSection
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <AdminPortal
            currentUser={currentUser}
            items={items}
            categories={categories}
            logs={logs}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
            onTogglePublish={handleTogglePublish}
            onToggleArchive={handleToggleArchive}
            onLogout={handleLogout}
            onLogin={handleLogin}
            onBackToPublic={() => handleNavigate('home')}
            onPreviewItem={handleSelectItem}
          />
        )}
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={handleCloseItem}
          onSelectRelated={handleSelectItem}
          allItems={items}
        />
      )}

      {/* QR Scanner / Exhibit Token Resolver Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        items={items}
        onFoundItem={handleSelectItem}
      />

      {/* Quiet Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={() => {
          if (!currentUser) handleLogin('admin');
          else handleNavigate('admin');
        }}
      />
    </div>
  );
}

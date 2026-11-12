import React, { useEffect, useId, useRef, useState } from 'react';
import { Bookmark, Trash2, Compass, Plus, X } from 'lucide-react';
import type { CosmicSnapshot } from '../../engines/astronomy';
import type { HebrewMysticalTime } from '../../engines/hebrewTime';

export interface SavedTimeBookmark {
  id: string;
  title: string;
  note: string;
  isoTimestamp: string;
  hebrewDateStr: string;
  moonPhaseStr: string;
  rulingPlanetStr: string;
}

interface TimeBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  cosmic: CosmicSnapshot;
  hebrewTime: HebrewMysticalTime;
  bookmarks: SavedTimeBookmark[];
  onAddBookmark: (title: string, note: string) => void;
  onDeleteBookmark: (id: string) => void;
  onJumpToBookmark: (isoTimestamp: string) => void;
}

export const TimeBookmarkModal: React.FC<TimeBookmarkModalProps> = ({
  isOpen,
  onClose,
  cosmic,
  hebrewTime,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  onJumpToBookmark,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      onClose();
    };
    dialog.addEventListener('close', handleNativeClose);

    let handleBackdropClick: ((event: MouseEvent) => void) | null = null;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('close', handleNativeClose);
      if (handleBackdropClick) {
        dialog.removeEventListener('click', handleBackdropClick);
      }
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label =
      title.trim() ||
      `${hebrewTime.hebrewDay} ${hebrewTime.hebrewMonthName} ${hebrewTime.hebrewYear}`;
    onAddBookmark(label, note.trim());
    setTitle('');
    setNote('');
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby={titleId}
      className="olam-panel mixed-script-container m-auto w-[34rem] max-w-[94vw] rounded-2xl border backdrop-blur-2xl shadow-2xl p-0 overflow-hidden"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 olam-accent" />
            <h2
              id={titleId}
              className="display-title text-sm font-semibold olam-text-primary"
            >
              Saved Cosmic Moments
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close Tracker Dialog"
            className="olam-pill p-1.5 rounded-lg border olam-text-muted hover:olam-text-primary cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="olam-card p-3.5 rounded-xl border space-y-2.5"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="olam-text-primary font-medium">
              Active: {hebrewTime.hebrewDay} {hebrewTime.hebrewMonthName}{' '}
              {hebrewTime.hebrewYear} ({hebrewTime.fullHebrewString})
            </span>
            <span className="mono-telemetry text-xs olam-text-muted">
              {cosmic.lunar.phaseNameTranslit} •{' '}
              {hebrewTime.planetaryHours.current.planet.translit}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Moment title (e.g., Natal Gate, Rosh Chodesh)..."
              className="olam-pill px-3 py-1.5 rounded-lg border text-xs olam-text-primary placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Personal observation note..."
              className="olam-pill px-3 py-1.5 rounded-lg border text-xs olam-text-primary placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="olam-btn-primary w-full py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" /> Save Active Moment
          </button>
        </form>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div className="text-xs font-medium olam-text-muted">
            Saved Alignments ({bookmarks.length})
          </div>
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="olam-card p-3 rounded-xl border flex items-center justify-between gap-3 transition-all"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs olam-text-primary truncate">
                    {bm.title}
                  </span>
                  <span className="hebrew-glyph text-xs olam-accent">
                    {bm.hebrewDateStr}
                  </span>
                </div>
                <div className="mono-telemetry text-xs olam-text-muted">
                  {new Date(bm.isoTimestamp).toLocaleString()} •{' '}
                  {bm.moonPhaseStr} • Hour of {bm.rulingPlanetStr}
                </div>
                {bm.note && (
                  <p className="text-xs olam-text-secondary">{bm.note}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToBookmark(bm.isoTimestamp);
                    dialogRef.current?.close();
                  }}
                  className="olam-pill px-2.5 py-1.5 rounded-lg border text-xs font-medium olam-text-primary flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Compass className="w-3 h-3" /> Jump
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteBookmark(bm.id)}
                  aria-label={`Delete ${bm.title}`}
                  className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-400/30 text-rose-600 hover:bg-rose-500/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
};

import React, { useState } from 'react';
import { Bookmark, Clock, Plus, CheckCircle2, HelpCircle, AlertCircle, ThumbsUp, Scissors } from 'lucide-react';
import { Meeting, MeetingHighlight, HighlightCategory } from '../types';

interface HighlightsViewProps {
  meeting: Meeting;
  onSeek: (seconds: number) => void;
  onOpenClipModal: (startSeconds: number, endSeconds: number) => void;
  onAddHighlight: (category: HighlightCategory, note: string, timestamp: number) => void;
  currentTime: number;
}

export const HighlightsView: React.FC<HighlightsViewProps> = ({
  meeting,
  onSeek,
  onOpenClipModal,
  onAddHighlight,
  currentTime,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<HighlightCategory>('decision');
  const [newNote, setNewNote] = useState('');

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getCategoryBadge = (category: HighlightCategory) => {
    switch (category) {
      case 'action_item':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
          label: 'Action Item',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'decision':
        return {
          icon: <Bookmark className="h-3.5 w-3.5 text-indigo-600" />,
          label: 'Decision',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'key_question':
        return {
          icon: <HelpCircle className="h-3.5 w-3.5 text-amber-600" />,
          label: 'Key Question',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'positive_feedback':
        return {
          icon: <ThumbsUp className="h-3.5 w-3.5 text-purple-600" />,
          label: 'Positive Feedback',
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'concern':
        return {
          icon: <AlertCircle className="h-3.5 w-3.5 text-rose-600" />,
          label: 'Risk / Concern',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
        };
    }
  };

  const filteredHighlights = meeting.highlights.filter((hl) => {
    if (selectedFilter === 'all') return true;
    return hl.category === selectedFilter;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddHighlight(newCategory, newNote.trim(), Math.floor(currentTime));
    setNewNote('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Meeting Highlights & Bookmarks</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pinned moments during live call, tagged by category
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Bookmark at {formatTime(currentTime)}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`rounded-full px-2.5 py-1 font-medium transition ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({meeting.highlights.length})
          </button>
          <button
            onClick={() => setSelectedFilter('decision')}
            className={`rounded-full px-2.5 py-1 font-medium transition ${
              selectedFilter === 'decision'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Decisions
          </button>
          <button
            onClick={() => setSelectedFilter('action_item')}
            className={`rounded-full px-2.5 py-1 font-medium transition ${
              selectedFilter === 'action_item'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Action Items
          </button>
          <button
            onClick={() => setSelectedFilter('key_question')}
            className={`rounded-full px-2.5 py-1 font-medium transition ${
              selectedFilter === 'key_question'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setSelectedFilter('concern')}
            className={`rounded-full px-2.5 py-1 font-medium transition ${
              selectedFilter === 'concern'
                ? 'bg-rose-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Risks
          </button>
        </div>
      </div>

      {/* Highlights List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredHighlights.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No highlights found for this category.
          </div>
        ) : (
          filteredHighlights.map((hl) => {
            const badge = getCategoryBadge(hl.category);
            return (
              <div
                key={hl.id}
                onClick={() => onSeek(hl.timestamp)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badge.bg}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {hl.speakerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenClipModal(Math.max(0, hl.timestamp - 10), Math.min(meeting.duration, hl.timestamp + 30));
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      title="Create clip of this highlight"
                    >
                      <Scissors className="h-3 w-3" />
                      <span>Clip</span>
                    </button>

                    <span className="flex items-center gap-1 font-mono text-xs font-semibold text-indigo-600 group-hover:underline">
                      <Clock className="h-3 w-3" />
                      {formatTime(hl.timestamp)}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-900 leading-snug">
                  {hl.note}
                </p>

                {hl.quote && (
                  <p className="mt-2 text-xs italic text-slate-500 border-l-2 border-slate-300 pl-2.5 py-0.5">
                    "{hl.quote}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Bookmark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Bookmark at {formatTime(currentTime)}
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Highlight Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as HighlightCategory)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="decision">Decision</option>
                  <option value="action_item">Action Item</option>
                  <option value="key_question">Key Question</option>
                  <option value="concern">Risk / Concern</option>
                  <option value="positive_feedback">Positive Feedback</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Note
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Agreement on Frankfurt disaster recovery cluster encryption"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

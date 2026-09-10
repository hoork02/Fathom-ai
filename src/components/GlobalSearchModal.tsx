import React, { useState, useMemo } from 'react';
import { Search, X, MessageSquare, CheckSquare, Bookmark, Calendar, ArrowRight, User } from 'lucide-react';
import { Meeting } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
  onSelectResult: (meetingId: string, timestamp?: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  meetings,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'transcript' | 'action_items' | 'highlights'>('all');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const hits: Array<{
      type: 'transcript' | 'action_item' | 'highlight' | 'meeting';
      meeting: Meeting;
      title: string;
      snippet: string;
      timestamp?: number;
      speakerName?: string;
    }> = [];

    meetings.forEach((m) => {
      // Check title or summary overview
      if (m.title.toLowerCase().includes(q) || m.summary.overview.toLowerCase().includes(q)) {
        if (filterType === 'all') {
          hits.push({
            type: 'meeting',
            meeting: m,
            title: m.title,
            snippet: m.summary.overview.slice(0, 140) + '...',
          });
        }
      }

      // Check transcripts
      if (filterType === 'all' || filterType === 'transcript') {
        m.transcript.forEach((t) => {
          if (t.text.toLowerCase().includes(q)) {
            hits.push({
              type: 'transcript',
              meeting: m,
              title: `${t.speakerName} at ${formatTime(t.startTime)}`,
              snippet: t.text,
              timestamp: t.startTime,
              speakerName: t.speakerName,
            });
          }
        });
      }

      // Check action items
      if (filterType === 'all' || filterType === 'action_items') {
        m.actionItems.forEach((ai) => {
          if (ai.title.toLowerCase().includes(q) || ai.assigneeName.toLowerCase().includes(q)) {
            hits.push({
              type: 'action_item',
              meeting: m,
              title: `Action Item: ${ai.assigneeName}`,
              snippet: ai.title,
              timestamp: ai.timestamp,
              speakerName: ai.assigneeName,
            });
          }
        });
      }

      // Check highlights
      if (filterType === 'all' || filterType === 'highlights') {
        m.highlights.forEach((hl) => {
          if (hl.note.toLowerCase().includes(q) || (hl.quote && hl.quote.toLowerCase().includes(q))) {
            hits.push({
              type: 'highlight',
              meeting: m,
              title: `Highlight (${hl.category.replace('_', ' ')})`,
              snippet: hl.note,
              timestamp: hl.timestamp,
              speakerName: hl.speakerName,
            });
          }
        });
      }
    });

    return hits.slice(0, 20); // Cap at top 20 hits
  }, [query, meetings, filterType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-16 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3.5 gap-3">
          <Search className="h-5 w-5 text-indigo-600" />
          <input
            type="text"
            placeholder="Search all meeting transcripts, decisions, action items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-base text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-600">
          <span className="text-slate-400 mr-1">Filter by:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-full px-2.5 py-1 transition ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('transcript')}
            className={`rounded-full px-2.5 py-1 transition ${
              filterType === 'transcript'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Transcripts
          </button>
          <button
            onClick={() => setFilterType('action_items')}
            className={`rounded-full px-2.5 py-1 transition ${
              filterType === 'action_items'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Action Items
          </button>
          <button
            onClick={() => setFilterType('highlights')}
            className={`rounded-full px-2.5 py-1 transition ${
              filterType === 'highlights'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Highlights
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">Search across your entire call history</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for <span className="text-indigo-600">"Postgres"</span>, <span className="text-indigo-600">"SLA"</span>, <span className="text-indigo-600">"Kafka"</span>, or <span className="text-indigo-600">"pilot"</span>
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or change your filter.</p>
            </div>
          ) : (
            results.map((hit, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectResult(hit.meeting.id, hit.timestamp);
                  onClose();
                }}
                className="group flex cursor-pointer items-start justify-between rounded-xl p-3 hover:bg-indigo-50/50 transition pt-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition">
                    {hit.type === 'transcript' && <MessageSquare className="h-3.5 w-3.5" />}
                    {hit.type === 'action_item' && <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />}
                    {hit.type === 'highlight' && <Bookmark className="h-3.5 w-3.5 text-amber-500" />}
                    {hit.type === 'meeting' && <Calendar className="h-3.5 w-3.5 text-indigo-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-700">
                        {hit.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        in <span className="text-slate-600 font-medium">{hit.meeting.title}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {hit.snippet}
                    </p>
                  </div>
                </div>
                {hit.timestamp !== undefined && (
                  <div className="flex items-center gap-1 pl-2 text-[11px] font-mono text-slate-400 group-hover:text-indigo-600 shrink-0">
                    <span>{formatTime(hit.timestamp)}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

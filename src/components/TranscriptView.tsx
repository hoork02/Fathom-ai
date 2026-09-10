import React, { useState, useEffect, useRef } from 'react';
import { Search, Scissors, Bookmark, Copy, Check, Filter } from 'lucide-react';
import { Meeting, TranscriptUtterance, HighlightCategory } from '../types';

interface TranscriptViewProps {
  meeting: Meeting;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onOpenClipModal: (startSeconds: number, endSeconds: number) => void;
  onAddHighlight: (category: HighlightCategory, note: string, timestamp: number) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  meeting,
  currentTime,
  onSeek,
  onOpenClipModal,
  onAddHighlight,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const activeUtteranceRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Find active utterance
  const activeUtterance = meeting.transcript.find(
    (t) => currentTime >= t.startTime && currentTime <= t.endTime
  );

  // Auto-scroll when playhead progresses
  useEffect(() => {
    if (activeUtteranceRef.current && containerRef.current) {
      activeUtteranceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeUtterance?.id]);

  const uniqueSpeakers = Array.from(
    new Set(meeting.transcript.map((t) => t.speakerName))
  );

  const filteredTranscript = meeting.transcript.filter((t) => {
    const matchesSpeaker = selectedSpeaker === 'all' || t.speakerName === selectedSpeaker;
    const matchesSearch = !searchQuery.trim() || t.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  const handleCopyQuote = (t: TranscriptUtterance) => {
    navigator.clipboard.writeText(`"${t.text}" — ${t.speakerName} (${formatTime(t.startTime)})`);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Transcript Header & Filters */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Synchronized Transcript</h3>
            <span className="text-xs text-slate-500 font-medium">
              ({meeting.transcript.length} turns)
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
            Click any line to seek video
          </span>
        </div>

        {/* Search & Speaker Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="appearance-none pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Speakers</option>
              {uniqueSpeakers.map((spk) => (
                <option key={spk} value={spk}>
                  {spk}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transcript Stream */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
        {filteredTranscript.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No dialogue matches "{searchQuery}"
          </div>
        ) : (
          filteredTranscript.map((utterance) => {
            const isActive = activeUtterance?.id === utterance.id;
            const attendee = meeting.attendees.find(
              (a) => a.name.toLowerCase() === utterance.speakerName.toLowerCase()
            );

            return (
              <div
                key={utterance.id}
                ref={isActive ? activeUtteranceRef : null}
                onClick={() => onSeek(utterance.startTime)}
                className={`group relative rounded-xl p-3 pt-3.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/70 border-l-4 border-indigo-600 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Speaker meta & Timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={attendee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={utterance.speakerName}
                      className="h-5 w-5 rounded-full object-cover border border-slate-200"
                    />
                    <span className={`text-xs font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {utterance.speakerName}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-400 group-hover:text-indigo-600 font-medium">
                    {formatTime(utterance.startTime)}
                  </span>
                </div>

                {/* Utterance Text */}
                <p className={`text-xs sm:text-sm leading-relaxed ${isActive ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                  {utterance.text}
                </p>

                {/* Hover Action Floating Bar */}
                <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenClipModal(utterance.startTime, utterance.endTime);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-md px-2 py-0.5 shadow-2xs"
                  >
                    <Scissors className="h-3 w-3 text-indigo-500" />
                    <span>Clip</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddHighlight('decision', utterance.text, utterance.startTime);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-md px-2 py-0.5 shadow-2xs"
                  >
                    <Bookmark className="h-3 w-3 text-amber-500" />
                    <span>Bookmark</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyQuote(utterance);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-md px-2 py-0.5 shadow-2xs"
                  >
                    {copiedId === utterance.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-400" />
                        <span>Copy Quote</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

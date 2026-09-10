import React, { useState } from 'react';
import { ShareClip } from '../types';
import { Scissors, Copy, Check, ExternalLink, X, Trash2, Calendar, Clock } from 'lucide-react';

interface ClipsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: ShareClip[];
  onSelectClip: (clip: ShareClip) => void;
  onDeleteClip: (clipId: string) => void;
}

export const ClipsListModal: React.FC<ClipsListModalProps> = ({
  isOpen,
  onClose,
  clips,
  onSelectClip,
  onDeleteClip,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopy = (clip: ShareClip) => {
    navigator.clipboard.writeText(clip.shareUrl);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Shared Video Clips</h2>
              <p className="text-xs text-slate-500">Public snippets created from call recordings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {clips.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No clips created yet. Hover over any dialogue in the transcript or tap "Clip Moment" to create one!
            </div>
          ) : (
            clips.map((clip) => (
              <div
                key={clip.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-xs transition"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{clip.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">from {clip.meetingTitle}</p>
                  
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                      <Clock className="h-3 w-3" />
                      {formatTime(clip.startTime)} – {formatTime(clip.endTime)} ({Math.round(clip.endTime - clip.startTime)}s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {clip.createdDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(clip)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    {copiedId === clip.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteClip(clip.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete clip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

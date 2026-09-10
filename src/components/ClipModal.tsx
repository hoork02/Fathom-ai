import React, { useState } from 'react';
import { Scissors, Copy, Check, ExternalLink, Play, Pause, X, Share2, Globe } from 'lucide-react';
import { Meeting, ShareClip } from '../types';

interface ClipModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  initialStart: number;
  initialEnd: number;
  onSaveClip: (clip: ShareClip) => void;
}

export const ClipModal: React.FC<ClipModalProps> = ({
  isOpen,
  onClose,
  meeting,
  initialStart,
  initialEnd,
  onSaveClip,
}) => {
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [clipTitle, setClipTitle] = useState(`${meeting.title} - Key Moment`);
  const [isCopied, setIsCopied] = useState(false);
  const [isPlayingClip, setIsPlayingClip] = useState(false);
  const [createdClip, setCreatedClip] = useState<ShareClip | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const clipDuration = Math.max(1, Math.round(endTime - startTime));

  // Snippets of dialogue included in this clip window
  const snippetDialogue = meeting.transcript.filter(
    (t) => (t.startTime >= startTime && t.startTime <= endTime) ||
           (t.endTime >= startTime && t.endTime <= endTime) ||
           (t.startTime <= startTime && t.endTime >= endTime)
  );

  const handleGenerateShareLink = () => {
    const clipId = `clip-${Date.now().toString(36)}`;
    const newClip: ShareClip = {
      id: clipId,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      title: clipTitle,
      startTime: startTime,
      endTime: endTime,
      createdDate: 'Today',
      authorName: 'Sarah Chen',
      shareUrl: `https://fathom.video/share/${clipId}`,
      isPublic: true,
    };

    onSaveClip(newClip);
    setCreatedClip(newClip);
    navigator.clipboard.writeText(newClip.shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share Meeting Clip</h2>
              <p className="text-xs text-slate-500">
                Share a specific moment with colleagues who were not on the call
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Clip Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Clip Title
            </label>
            <input
              type="text"
              value={clipTitle}
              onChange={(e) => setClipTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              placeholder="e.g. Sarah explaining the Strangler Fig migration"
            />
          </div>

          {/* Time Range Selector */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Clip Boundaries</span>
              <span className="text-indigo-600 font-mono">
                Duration: {clipDuration}s ({formatTime(startTime)} – {formatTime(endTime)})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Start (Seconds: {Math.round(startTime)})
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.min(meeting.duration, endTime - 1)}
                  step={1}
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  End (Seconds: {Math.round(endTime)})
                </label>
                <input
                  type="range"
                  min={startTime + 1}
                  max={meeting.duration}
                  step={1}
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Transcript Dialogue in this Clip */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Included Dialogue Preview
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs divide-y divide-slate-100">
              {snippetDialogue.length === 0 ? (
                <p className="text-slate-400 italic">No speech detected in this time range.</p>
              ) : (
                snippetDialogue.map((d) => (
                  <div key={d.id} className="pt-2 first:pt-0">
                    <span className="font-bold text-slate-800">{d.speakerName}: </span>
                    <span className="text-slate-600">{d.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Generated Shareable Link Card */}
          {createdClip ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Globe className="h-4 w-4" />
                <span>Public Share Link Created!</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdClip.shareUrl}
                  className="flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-mono text-emerald-900"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdClip.shareUrl);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700">
                Anyone with this link can watch this exact {clipDuration}-second clip without needing a login.
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerateShareLink}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Share2 className="h-4 w-4" />
              <span>Generate Public Clip Link</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

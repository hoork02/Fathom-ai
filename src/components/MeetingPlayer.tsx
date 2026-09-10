import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Scissors, 
  Maximize2, 
  Bookmark, 
  Users,
  Video
} from 'lucide-react';
import { Meeting, MeetingHighlight } from '../types';

interface MeetingPlayerProps {
  meeting: Meeting;
  currentTime: number;
  onTimeChange: (newTime: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenClipModal: (startSeconds: number, endSeconds: number) => void;
}

export const MeetingPlayer: React.FC<MeetingPlayerProps> = ({
  meeting,
  currentTime,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  onOpenClipModal,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hoveredHighlight, setHoveredHighlight] = useState<MeetingHighlight | null>(null);

  // Derive current speaker based on transcript timestamps
  const activeUtterance = meeting.transcript.find(
    (t) => currentTime >= t.startTime && currentTime <= t.endTime
  ) || meeting.transcript[0];

  const activeSpeaker = meeting.attendees.find(
    (a) => a.name.toLowerCase() === activeUtterance?.speakerName.toLowerCase()
  ) || meeting.attendees[0];

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    onTimeChange(target);
  };

  const skipSeconds = (amount: number) => {
    const newTime = Math.min(Math.max(0, currentTime + amount), meeting.duration);
    onTimeChange(newTime);
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-900 text-white overflow-hidden shadow-lg">
      {/* Speaker Stage / Video Viewport */}
      <div className="relative aspect-video w-full bg-linear-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        {/* Subtle animated ambient glow when playing */}
        {isPlaying && (
          <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent opacity-60 animate-pulse pointer-events-none" />
        )}

        {/* Current Active Speaker Spotlight */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={activeSpeaker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={activeSpeaker?.name}
              className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 object-cover transition-all duration-300 ${
                isPlaying
                  ? 'border-indigo-400 ring-4 ring-indigo-500/30 scale-105'
                  : 'border-slate-600'
              }`}
            />
            {isPlaying && (
              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 ring-2 ring-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {activeSpeaker?.name || 'Active Speaker'}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {activeSpeaker?.role || 'Attendee'}
          </p>

          {/* Subtitle preview of current dialogue */}
          <div className="mt-4 max-w-lg rounded-xl bg-black/60 backdrop-blur-md px-4 py-2 text-xs sm:text-sm text-slate-200 border border-white/10 shadow-md">
            "{activeUtterance?.text.slice(0, 120)}..."
          </div>
        </div>

        {/* Top-left meeting tag & platform badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md text-slate-300 border border-white/10">
            <Video className="h-3 w-3 text-indigo-400" />
            {meeting.platform}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-black/40 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur-md border border-white/5">
            <Users className="h-3 w-3 text-slate-400" />
            {meeting.attendees.length} participants
          </span>
        </div>

        {/* Top-right "Create Clip" shortcut button */}
        <button
          onClick={() => onOpenClipModal(Math.max(0, currentTime - 15), Math.min(meeting.duration, currentTime + 30))}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10 transition text-white"
          title="Clip this moment to share"
        >
          <Scissors className="h-3.5 w-3.5 text-indigo-300" />
          <span>Clip Moment</span>
        </button>

        {/* Hovered Highlight Tooltip Overlay */}
        {hoveredHighlight && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 max-w-sm rounded-lg bg-slate-900/95 border border-slate-700 p-2.5 text-xs shadow-xl text-left">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] mb-1">
              <Bookmark className="h-3 w-3" />
              <span>{hoveredHighlight.category.replace('_', ' ').toUpperCase()} at {formatTime(hoveredHighlight.timestamp)}</span>
            </div>
            <p className="text-slate-200">{hoveredHighlight.note}</p>
          </div>
        )}
      </div>

      {/* Scrubber & Timeline Bar */}
      <div className="px-5 pt-3 pb-1 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-center w-full group py-1">
          {/* Progress track slider */}
          <input
            type="range"
            min={0}
            max={meeting.duration}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-hidden"
          />

          {/* Highlight markers positioned accurately along the progress bar */}
          {meeting.highlights.map((hl) => {
            const leftPercent = (hl.timestamp / meeting.duration) * 100;
            return (
              <div
                key={hl.id}
                onClick={() => onTimeChange(hl.timestamp)}
                onMouseEnter={() => setHoveredHighlight(hl)}
                onMouseLeave={() => setHoveredHighlight(null)}
                style={{ left: `${leftPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-2 cursor-pointer rounded-xs z-10 transition-transform hover:scale-150 hover:z-20"
                title={`${hl.category}: ${hl.note}`}
              >
                <div
                  className={`h-full w-full rounded-xs ${
                    hl.category === 'action_item'
                      ? 'bg-emerald-400'
                      : hl.category === 'decision'
                      ? 'bg-indigo-400'
                      : hl.category === 'concern'
                      ? 'bg-rose-400'
                      : hl.category === 'key_question'
                      ? 'bg-amber-400'
                      : 'bg-purple-400'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between px-5 pb-4 pt-2 bg-slate-900 text-slate-300">
        {/* Left: Playback toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => skipSeconds(-10)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Rewind 10s"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(10)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Forward 10s"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Time text */}
          <div className="ml-2 font-mono text-xs text-slate-400">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(meeting.duration)}</span>
          </div>
        </div>

        {/* Right: Audio, Speed & Clip controls */}
        <div className="flex items-center gap-3">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 text-xs font-semibold">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`rounded-md px-2 py-1 transition ${
                  playbackSpeed === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

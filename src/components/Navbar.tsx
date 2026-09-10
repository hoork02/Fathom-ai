import React from 'react';
import { 
  Search, 
  Calendar, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  Settings, 
  Share2, 
  Layers
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCalendar: () => void;
  onStartLiveCall: () => void;
  onOpenClips: () => void;
  totalMeetingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenCalendar,
  onStartLiveCall,
  onOpenClips,
  totalMeetingsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-md">
      {/* Brand & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">fathom</span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                AI Notetaker
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Connected to Google & Zoom
            </p>
          </div>
        </div>

        {/* Calendar Bot Status Pill */}
        <button
          onClick={onOpenCalendar}
          className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100/70"
          title="Fathom Bot is scheduled to join your upcoming meetings"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Bot auto-recording next call</span>
          <span className="text-[10px] text-emerald-600 font-normal ml-1">Today, 10 AM</span>
        </button>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenSearch}
          className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white hover:shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="font-normal text-xs sm:text-sm">Search transcripts, speakers, action items...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Clips manager */}
        <button
          onClick={onOpenClips}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Share2 className="h-3.5 w-3.5 text-slate-500" />
          <span>Shared Clips</span>
        </button>

        {/* Calendar Sync button */}
        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden md:inline">Calendar</span>
        </button>

        {/* Record Now / Launch Test Call Button */}
        <button
          onClick={onStartLiveCall}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
        >
          <Video className="h-4 w-4" />
          <span>Record Call</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative ml-2">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
            alt="Sarah Chen"
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
          />
        </div>
      </div>
    </header>
  );
};

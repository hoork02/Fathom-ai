import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  INITIAL_MEETINGS, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_CLIPS 
} from './data/mockMeetings';
import { Meeting, MeetingHighlight, MeetingSummary, ShareClip, CalendarEvent, HighlightCategory } from './types';
import { 
  parseCurrentRoute, 
  resolveMeetingOrFallback, 
  getPublicMeetingShareUrl, 
  updateBrowserUrl 
} from './utils/routeHelper';
import { Navbar } from './components/Navbar';
import { MeetingSidebar } from './components/MeetingSidebar';
import { MeetingPlayer } from './components/MeetingPlayer';
import { SummaryView } from './components/SummaryView';
import { TranscriptView } from './components/TranscriptView';
import { ActionItemsView } from './components/ActionItemsView';
import { HighlightsView } from './components/HighlightsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CalendarModal } from './components/CalendarModal';
import { LiveRecorderModal } from './components/LiveRecorderModal';
import { ClipModal } from './components/ClipModal';
import { ClipsListModal } from './components/ClipsListModal';
import { 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Bookmark, 
  Share2, 
  Video, 
  Calendar, 
  Clock, 
  Users,
  Copy, 
  Check,
  Info,
  Scissors,
  X,
  Download,
  ChevronDown,
  ListChecks,
  FileCode
} from 'lucide-react';

export function App() {
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [clips, setClips] = useState<ShareClip[]>(INITIAL_CLIPS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

  // Post-meeting action bar states
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [hasCopiedActions, setHasCopiedActions] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Initialize selected meeting based on route
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(() => {
    const route = parseCurrentRoute();
    const resolution = resolveMeetingOrFallback(route.id, INITIAL_MEETINGS, INITIAL_CLIPS);
    return resolution.meeting.id;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'actions' | 'highlights'>('summary');
  
  // Playback state
  const [currentTime, setCurrentTime] = useState<number>(() => {
    const route = parseCurrentRoute();
    if (route.timestamp !== null) return route.timestamp;
    const resolution = resolveMeetingOrFallback(route.id, INITIAL_MEETINGS, INITIAL_CLIPS);
    return resolution.initialTimestamp;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Route & Clip indicators
  const [activeSharedClip, setActiveSharedClip] = useState<ShareClip | null>(() => {
    const route = parseCurrentRoute();
    const resolution = resolveMeetingOrFallback(route.id, INITIAL_MEETINGS, INITIAL_CLIPS);
    return resolution.activeClip;
  });
  const [showFallbackNotice, setShowFallbackNotice] = useState<boolean>(() => {
    const route = parseCurrentRoute();
    const resolution = resolveMeetingOrFallback(route.id, INITIAL_MEETINGS, INITIAL_CLIPS);
    return resolution.isFallback;
  });

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLiveRecorderOpen, setIsLiveRecorderOpen] = useState(false);
  const [isClipModalOpen, setIsClipModalOpen] = useState(false);
  const [isClipsListOpen, setIsClipsListOpen] = useState(false);
  const [clipRange, setClipRange] = useState<{ start: number; end: number }>({ start: 0, end: 60 });
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Active meeting object
  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  // Sync route on popstate (browser back/forward or programmatic navigation)
  const syncRouteState = useCallback(() => {
    const route = parseCurrentRoute();
    const resolution = resolveMeetingOrFallback(route.id, meetings, clips);
    setSelectedMeetingId(resolution.meeting.id);
    setActiveSharedClip(resolution.activeClip);
    setShowFallbackNotice(resolution.isFallback);
    if (route.timestamp !== null) {
      setCurrentTime(route.timestamp);
    } else if (resolution.initialTimestamp > 0) {
      setCurrentTime(resolution.initialTimestamp);
    }
  }, [meetings, clips]);

  useEffect(() => {
    window.addEventListener('popstate', syncRouteState);
    return () => window.removeEventListener('popstate', syncRouteState);
  }, [syncRouteState]);

  // Auto-dismiss the sample meeting notice toast after 6 seconds
  useEffect(() => {
    if (showFallbackNotice) {
      const timer = setTimeout(() => {
        setShowFallbackNotice(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showFallbackNotice]);

  // Playback timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentMeeting.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentMeeting.duration]);

  // Global Keyboard shortcuts: Cmd+K for search, Space for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectMeeting = (id: string, jumpTimestamp?: number) => {
    setSelectedMeetingId(id);
    setActiveSharedClip(null);
    setShowFallbackNotice(false);
    setIsPlaying(false);
    updateBrowserUrl(`/recording/${id}`);
    if (jumpTimestamp !== undefined) {
      setCurrentTime(jumpTimestamp);
    } else {
      setCurrentTime(0);
    }
  };

  const handleToggleActionItem = (actionItemId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== currentMeeting.id) return m;
        return {
          ...m,
          actionItems: m.actionItems.map((ai) =>
            ai.id === actionItemId ? { ...ai, completed: !ai.completed } : ai
          ),
        };
      })
    );
  };

  const handleAddActionItem = (title: string, assigneeName: string, dueDate?: string) => {
    const newAi = {
      id: `ai-${Date.now()}`,
      title,
      assigneeName,
      completed: false,
      timestamp: Math.floor(currentTime),
      dueDate,
    };
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== currentMeeting.id) return m;
        return {
          ...m,
          actionItems: [newAi, ...m.actionItems],
        };
      })
    );
  };

  const handleAddHighlight = (category: HighlightCategory, note: string, timestamp: number) => {
    const colorMap: Record<HighlightCategory, string> = {
      action_item: 'emerald',
      decision: 'indigo',
      key_question: 'amber',
      positive_feedback: 'purple',
      concern: 'rose',
    };

    const newHl: MeetingHighlight = {
      id: `hl-${Date.now()}`,
      timestamp,
      speakerName: 'Sarah Chen',
      category,
      note,
      color: colorMap[category] || 'indigo',
    };

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== currentMeeting.id) return m;
        return {
          ...m,
          highlights: [...m.highlights, newHl],
        };
      })
    );
  };

  const handleUpdateSummary = (newSummary: MeetingSummary) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== currentMeeting.id) return m;
        return {
          ...m,
          summary: newSummary,
        };
      })
    );
  };

  const handleCompleteRecordedMeeting = (newMeeting: Meeting) => {
    setMeetings((prev) => [newMeeting, ...prev]);
    setSelectedMeetingId(newMeeting.id);
    setActiveSharedClip(null);
    setShowFallbackNotice(false);
    setCurrentTime(0);
    setIsPlaying(false);
    updateBrowserUrl(`/recording/${newMeeting.id}`);
  };

  const handleOpenClipModal = (start: number, end: number) => {
    setClipRange({ start, end });
    setIsClipModalOpen(true);
  };

  const handleSaveClip = (clip: ShareClip) => {
    setClips((prev) => [clip, ...prev]);
  };

  const handleDeleteClip = (clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
  };

  const handleToggleAutoRecord = (eventId: string) => {
    setCalendarEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, autoRecord: !evt.autoRecord } : evt
      )
    );
  };

  const handleCopyMeetingLink = () => {
    const publicUrl = getPublicMeetingShareUrl(currentMeeting.id);
    navigator.clipboard.writeText(publicUrl);
    setShareNotice('Public meeting share link copied to clipboard!');
    setTimeout(() => setShareNotice(null), 3500);
  };

  // Click-outside handler for Export Transcript dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExportMenuOpen]);

  // Formats all action items & key decisions as markdown and copies with visual confirmation
  const handleCopyActionItemsMarkdown = () => {
    const keyDecisions = currentMeeting.summary.keyDecisions || [];
    let md = `# Action Items & Key Decisions\n`;
    md += `**Meeting:** ${currentMeeting.title}\n`;
    md += `**Date:** ${currentMeeting.date} | **Platform:** ${currentMeeting.platform.toUpperCase()} | **Duration:** ${Math.round(currentMeeting.duration / 60)} min\n\n`;

    if (keyDecisions.length > 0) {
      md += `## 🎯 Key Decisions\n`;
      keyDecisions.forEach((decision) => {
        md += `- ${decision}\n`;
      });
      md += `\n`;
    }

    md += `## ✅ Action Items\n`;
    if (!currentMeeting.actionItems || currentMeeting.actionItems.length === 0) {
      md += `_No action items recorded for this call._\n`;
    } else {
      currentMeeting.actionItems.forEach((ai) => {
        const check = ai.completed ? '[x]' : '[ ]';
        const time = ai.timestamp
          ? ` (at ${Math.floor(ai.timestamp / 60)}:${String(Math.floor(ai.timestamp % 60)).padStart(2, '0')})`
          : '';
        md += `- ${check} **${ai.title}** (@${ai.assigneeName}) — Due: ${ai.dueDate || 'Unscheduled'}${time}\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setHasCopiedActions(true);
    setShareNotice('Action items & decisions copied to clipboard as Markdown!');
    setTimeout(() => setHasCopiedActions(false), 2500);
    setTimeout(() => setShareNotice(null), 3500);
  };

  // Exports meeting transcript directly as .txt or .json without backend calls
  const handleExportTranscript = (format: 'txt' | 'json') => {
    setIsExportMenuOpen(false);
    const safeSlug = currentMeeting.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'meeting';

    if (format === 'txt') {
      const attendeesList = currentMeeting.attendees.map((a) => `${a.name} (${a.role})`).join(', ');
      let content = `================================================================================\n`;
      content += `TRANSCRIPT: ${currentMeeting.title}\n`;
      content += `Date: ${currentMeeting.date}\n`;
      content += `Duration: ${Math.round(currentMeeting.duration / 60)} minutes\n`;
      content += `Platform: ${currentMeeting.platform.toUpperCase()}\n`;
      content += `Attendees: ${attendeesList}\n`;
      content += `================================================================================\n\n`;

      currentMeeting.transcript.forEach((t) => {
        const mins = Math.floor(t.startTime / 60);
        const secs = Math.floor(t.startTime % 60);
        const timeFormatted = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
        content += `${timeFormatted} ${t.speakerName}:\n${t.text}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeSlug}-transcript.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShareNotice('Transcript exported as plain text (.txt)');
      setTimeout(() => setShareNotice(null), 3500);
    } else {
      const exportData = {
        meetingId: currentMeeting.id,
        title: currentMeeting.title,
        date: currentMeeting.date,
        durationSeconds: currentMeeting.duration,
        platform: currentMeeting.platform,
        exportedAt: new Date().toISOString(),
        attendees: currentMeeting.attendees,
        summary: currentMeeting.summary,
        transcript: currentMeeting.transcript.map((t) => ({
          id: t.id,
          speakerName: t.speakerName,
          speakerId: t.speakerId,
          startTime: t.startTime,
          endTime: t.endTime,
          formattedTimestamp: `${Math.floor(t.startTime / 60)}:${String(Math.floor(t.startTime % 60)).padStart(2, '0')}`,
          text: t.text,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeSlug}-transcript.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShareNotice('Transcript exported as JSON (.json)');
      setTimeout(() => setShareNotice(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onStartLiveCall={() => setIsLiveRecorderOpen(true)}
        onOpenClips={() => setIsClipsListOpen(true)}
        totalMeetingsCount={meetings.length}
      />

      {/* Share Toast */}
      {shareNotice && (
        <div className="fixed top-16 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Fallback Mock Data Notification */}
      {showFallbackNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 text-xs font-medium shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-400">
            <Info className="h-3.5 w-3.5" />
          </div>
          <span>Displaying sample meeting recording.</span>
          <button
            onClick={() => setShowFallbackNotice(false)}
            className="rounded p-0.5 text-slate-400 hover:text-white transition"
            aria-label="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Meeting Directory */}
        <MeetingSidebar
          meetings={meetings}
          selectedMeetingId={selectedMeetingId}
          onSelectMeeting={(id) => handleSelectMeeting(id)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onNewMeeting={() => setIsLiveRecorderOpen(true)}
        />

        {/* Right Main Surface */}
        <main className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-y-auto bg-slate-100">
          {/* Active Shared Clip Banner */}
          {activeSharedClip && (
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-300">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                      Shared Clip
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">
                      {activeSharedClip.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 mt-0.5">
                    Clip window: {Math.floor(activeSharedClip.startTime / 60)}:{String(Math.floor(activeSharedClip.startTime % 60)).padStart(2, '0')} – {Math.floor(activeSharedClip.endTime / 60)}:{String(Math.floor(activeSharedClip.endTime % 60)).padStart(2, '0')} • Shared by {activeSharedClip.authorName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => {
                    setCurrentTime(activeSharedClip.startTime);
                    setIsPlaying(true);
                  }}
                  className="rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                >
                  ▶ Play Clip
                </button>
                <button
                  onClick={() => {
                    setActiveSharedClip(null);
                    updateBrowserUrl(`/recording/${currentMeeting.id}`);
                  }}
                  className="rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 px-3 py-1.5 text-xs font-semibold transition"
                >
                  View Full Meeting
                </button>
              </div>
            </div>
          )}

          {/* Meeting Banner / Header */}
          <div className="border-b border-slate-200 bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    currentMeeting.platform === 'zoom'
                      ? 'bg-blue-50 text-blue-700'
                      : currentMeeting.platform === 'meet'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  <Video className="h-3 w-3" />
                  {currentMeeting.platform} Call
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentMeeting.date}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {currentMeeting.title}
              </h1>

              {/* Attendees Pills Bar */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex -space-x-1 overflow-hidden">
                  {currentMeeting.attendees.map((att) => (
                    <img
                      key={att.id}
                      src={att.avatar}
                      alt={att.name}
                      title={`${att.name} (${att.role})`}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {currentMeeting.attendees.map((a) => a.name).join(', ')}
                </span>
              </div>
            </div>

            {/* Actions: Export Transcript, Copy Action Items, Clip & Share */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
              {/* Copy Action Items Button */}
              <button
                onClick={handleCopyActionItemsMarkdown}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition shadow-2xs ${
                  hasCopiedActions
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                title="Format and copy all action items & key decisions as Markdown"
              >
                {hasCopiedActions ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied Markdown!</span>
                  </>
                ) : (
                  <>
                    <ListChecks className="h-3.5 w-3.5 text-slate-500" />
                    <span>Copy Action Items</span>
                  </>
                )}
              </button>

              {/* Export Transcript Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                  title="Download transcript as Plain Text or JSON"
                  aria-expanded={isExportMenuOpen}
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Export Transcript</span>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Choose Export Format
                    </div>
                    <button
                      onClick={() => handleExportTranscript('txt')}
                      className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-semibold leading-none text-slate-800">Plain Text (.txt)</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Speaker names & timestamps</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded">TXT</span>
                    </button>
                    <button
                      onClick={() => handleExportTranscript('json')}
                      className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-semibold leading-none text-slate-800">JSON Format (.json)</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Structured diarized objects</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded">JSON</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Clip Moment */}
              <button
                onClick={() => handleOpenClipModal(Math.max(0, currentTime - 15), Math.min(currentMeeting.duration, currentTime + 30))}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>✂ Clip Moment</span>
              </button>

              {/* Share Recording */}
              <button
                onClick={handleCopyMeetingLink}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Recording</span>
              </button>
            </div>
          </div>

          {/* 50/50 Split View Surface */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
            {/* Left Column: Synchronized Video Player & Timeline Scrubber (5 columns on lg) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <MeetingPlayer
                meeting={currentMeeting}
                currentTime={currentTime}
                onTimeChange={setCurrentTime}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onOpenClipModal={handleOpenClipModal}
              />

              {/* Quick Info / Call Stats Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Call Metadata & Diarization
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-slate-400 text-[11px]">Total Talk Time</p>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                      {Math.round(currentMeeting.duration / 60)} min
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-slate-400 text-[11px]">Attendees Diarized</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {currentMeeting.attendees.length} people
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-slate-400 text-[11px]">Key Highlights</p>
                    <p className="text-sm font-bold text-amber-600 mt-0.5">
                      {currentMeeting.highlights.length} bookmarked
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <p className="text-slate-400 text-[11px]">Action Items</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      {currentMeeting.actionItems.length} extracted
                    </p>
                  </div>
                </div>

                {/* Call Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentMeeting.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tabbed Workspace: Summary / Transcript / Action Items / Highlights (7 columns on lg) */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 mb-3 bg-slate-200/70 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'summary'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>AI Summary</span>
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'transcript'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Transcript</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                    {currentMeeting.transcript.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'actions'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Action Items</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                    {currentMeeting.actionItems.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('highlights')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    activeTab === 'highlights'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                  <span>Highlights</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                    {currentMeeting.highlights.length}
                  </span>
                </button>
              </div>

              {/* Active Tab View */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'summary' && (
                  <SummaryView
                    meeting={currentMeeting}
                    onUpdateSummary={handleUpdateSummary}
                    onSeek={setCurrentTime}
                  />
                )}

                {activeTab === 'transcript' && (
                  <TranscriptView
                    meeting={currentMeeting}
                    currentTime={currentTime}
                    onSeek={setCurrentTime}
                    onOpenClipModal={handleOpenClipModal}
                    onAddHighlight={handleAddHighlight}
                  />
                )}

                {activeTab === 'actions' && (
                  <ActionItemsView
                    meeting={currentMeeting}
                    onToggleActionItem={handleToggleActionItem}
                    onAddActionItem={handleAddActionItem}
                    onSeek={setCurrentTime}
                  />
                )}

                {activeTab === 'highlights' && (
                  <HighlightsView
                    meeting={currentMeeting}
                    onSeek={setCurrentTime}
                    onOpenClipModal={handleOpenClipModal}
                    onAddHighlight={handleAddHighlight}
                    currentTime={currentTime}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        meetings={meetings}
        onSelectResult={(meetingId, timestamp) => handleSelectMeeting(meetingId, timestamp)}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        events={calendarEvents}
        onToggleAutoRecord={handleToggleAutoRecord}
        onStartMeetingFromEvent={(event) => {
          setIsCalendarOpen(false);
          setIsLiveRecorderOpen(true);
        }}
      />

      <LiveRecorderModal
        isOpen={isLiveRecorderOpen}
        onClose={() => setIsLiveRecorderOpen(false)}
        onCompleteMeeting={handleCompleteRecordedMeeting}
      />

      <ClipModal
        isOpen={isClipModalOpen}
        onClose={() => setIsClipModalOpen(false)}
        meeting={currentMeeting}
        initialStart={clipRange.start}
        initialEnd={clipRange.end}
        onSaveClip={handleSaveClip}
      />

      <ClipsListModal
        isOpen={isClipsListOpen}
        onClose={() => setIsClipsListOpen(false)}
        clips={clips}
        onSelectClip={(c) => {
          handleSelectMeeting(c.meetingId, c.startTime);
          setIsClipsListOpen(false);
        }}
        onDeleteClip={handleDeleteClip}
      />
    </div>
  );
}
export default App;

import React, { useState, useEffect, useCallback } from 'react';
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
  X
} from 'lucide-react';

export function App() {
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [clips, setClips] = useState<ShareClip[]>(INITIAL_CLIPS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);

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

            {/* Actions: Share & Clip */}
            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <button
                onClick={() => handleOpenClipModal(Math.max(0, currentTime - 15), Math.min(currentMeeting.duration, currentTime + 30))}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>✂ Clip Moment</span>
              </button>

              <button
                onClick={handleCopyMeetingLink}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
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

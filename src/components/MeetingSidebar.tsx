import React from 'react';
import { Meeting } from '../types';
import { Calendar, Clock, Bookmark, CheckSquare, Video, Filter, Plus } from 'lucide-react';

interface MeetingSidebarProps {
  meetings: Meeting[];
  selectedMeetingId: string;
  onSelectMeeting: (meetingId: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onNewMeeting: () => void;
}

export const MeetingSidebar: React.FC<MeetingSidebarProps> = ({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  selectedCategory,
  onSelectCategory,
  onNewMeeting,
}) => {
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.round(totalSeconds / 60);
    return `${mins}m`;
  };

  const categories = [
    { id: 'all', label: 'All Calls' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'sales', label: 'Sales' },
    { id: '1on1', label: '1-on-1' },
    { id: 'test', label: 'Test Calls' },
  ];

  const filteredMeetings = meetings.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  return (
    <aside className="w-full md:w-80 shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col h-[calc(100vh-61px)]">
      {/* Sidebar Header & New Call Button */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Meeting Library
          </h2>
          <span className="text-xs font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
            {meetings.length} calls
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMeetings.map((meeting) => {
          const isSelected = meeting.id === selectedMeetingId;

          return (
            <div
              key={meeting.id}
              onClick={() => onSelectMeeting(meeting.id)}
              className={`group cursor-pointer rounded-xl border p-3.5 transition text-left ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-600/10 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Platform & Date */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    meeting.platform === 'zoom'
                      ? 'bg-blue-50 text-blue-700'
                      : meeting.platform === 'meet'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  <Video className="h-2.5 w-2.5" />
                  {meeting.platform}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(meeting.duration)}</span>
                </div>
              </div>

              {/* Title */}
              <h3
                className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                  isSelected ? 'text-indigo-950' : 'text-slate-900'
                }`}
              >
                {meeting.title}
              </h3>

              {/* Date */}
              <p className="text-[11px] text-slate-400 mt-1">{meeting.date}</p>

              {/* Bottom Row: Attendees Stack & Stats */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                {/* Avatar Stack */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  {meeting.attendees.slice(0, 4).map((att) => (
                    <img
                      key={att.id}
                      src={att.avatar}
                      alt={att.name}
                      title={att.name}
                      className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                  {meeting.attendees.length > 4 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 ring-2 ring-white">
                      +{meeting.attendees.length - 4}
                    </span>
                  )}
                </div>

                {/* Counts */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-0.5 text-amber-600" title="Highlights">
                    <Bookmark className="h-3 w-3" />
                    {meeting.highlights.length}
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-600" title="Action Items">
                    <CheckSquare className="h-3 w-3" />
                    {meeting.actionItems.length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={onNewMeeting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Call</span>
        </button>
      </div>
    </aside>
  );
};

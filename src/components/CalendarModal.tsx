import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Video, X, ExternalLink, Settings2, ShieldCheck, Plus } from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  onToggleAutoRecord: (eventId: string) => void;
  onStartMeetingFromEvent: (event: CalendarEvent) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  events,
  onToggleAutoRecord,
  onStartMeetingFromEvent,
}) => {
  const [googleConnected, setGoogleConnected] = useState(true);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [notifyAttendees, setNotifyAttendees] = useState(true);
  const [onlyHostCalls, setOnlyHostCalls] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Calendar & Notetaker Integration</h2>
              <p className="text-xs text-slate-500">Manage automated meeting recording and bot attendance</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Connected Calendar Accounts */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Connected Calendars
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-xs border border-emerald-100 flex items-center justify-center text-xs font-bold text-red-600">
                    G
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Google Calendar</p>
                    <p className="text-[11px] text-emerald-700 font-medium">sarah.chen@acme.corp</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xs font-bold text-blue-600">
                    O
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Microsoft Outlook</p>
                    <p className="text-[11px] text-slate-400">Office 365 Exchange</p>
                  </div>
                </div>
                <button
                  onClick={() => setOutlookConnected(!outlookConnected)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                    outlookConnected
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {outlookConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          {/* Global Recording Preferences */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-slate-500" />
              Notetaker Automation Rules
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-800">Notify attendees Fathom is joining</p>
                <p className="text-[11px] text-slate-500">Sends polite disclaimer email or chat note with recording consent</p>
              </div>
              <input
                type="checkbox"
                checked={notifyAttendees}
                onChange={(e) => setNotifyAttendees(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-800">Only record meetings I host</p>
                <p className="text-[11px] text-slate-500">Prevents bot from joining calls where you are merely an attendee</p>
              </div>
              <input
                type="checkbox"
                checked={onlyHostCalls}
                onChange={(e) => setOnlyHostCalls(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Upcoming Synced Meetings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Upcoming Meetings
              </label>
              <span className="text-[11px] text-slate-500">
                {events.filter((e) => e.autoRecord).length} of {events.length} set to auto-record
              </span>
            </div>

            <div className="space-y-2.5">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-indigo-200 hover:shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold uppercase ${
                        evt.platform === 'zoom'
                          ? 'bg-blue-100 text-blue-700'
                          : evt.platform === 'meet'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {evt.platform}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{evt.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">{evt.date}</span>
                        <span>•</span>
                        <span>{evt.timeRange}</span>
                        <span>•</span>
                        <span>{evt.attendeesCount} attendees</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={evt.autoRecord}
                        onChange={() => onToggleAutoRecord(evt.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="hidden sm:inline">Auto-record</span>
                    </label>

                    <button
                      onClick={() => {
                        onStartMeetingFromEvent(evt);
                        onClose();
                      }}
                      className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition flex items-center gap-1"
                    >
                      <Video className="h-3 w-3" />
                      <span>Start Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Fathom Bot adheres to SOC2 & GDPR privacy protocols</span>
          </div>
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

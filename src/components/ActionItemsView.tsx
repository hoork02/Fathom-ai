import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  Calendar, 
  User, 
  Send,
  ExternalLink
} from 'lucide-react';
import { Meeting, ActionItem } from '../types';

interface ActionItemsViewProps {
  meeting: Meeting;
  onToggleActionItem: (actionItemId: string) => void;
  onAddActionItem: (title: string, assignee: string, dueDate?: string) => void;
  onSeek: (seconds: number) => void;
}

export const ActionItemsView: React.FC<ActionItemsViewProps> = ({
  meeting,
  onToggleActionItem,
  onAddActionItem,
  onSeek,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState(meeting.attendees[0]?.name || 'You');
  const [newDueDate, setNewDueDate] = useState('Friday');
  const [copied, setCopied] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddActionItem(newTitle.trim(), newAssignee, newDueDate);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleCopyActionItems = () => {
    const keyDecisions = meeting.summary.keyDecisions || [];
    let text = `# Action Items & Key Decisions\n`;
    text += `**Meeting:** ${meeting.title}\n`;
    text += `**Date:** ${meeting.date} | **Platform:** ${meeting.platform.toUpperCase()} | **Duration:** ${Math.round(meeting.duration / 60)} min\n\n`;

    if (keyDecisions.length > 0) {
      text += `## 🎯 Key Decisions\n`;
      keyDecisions.forEach((d) => {
        text += `- ${d}\n`;
      });
      text += `\n`;
    }

    text += `## ✅ Action Items\n`;
    if (!meeting.actionItems || meeting.actionItems.length === 0) {
      text += `_No action items recorded for this call._\n`;
    } else {
      meeting.actionItems.forEach((ai) => {
        text += `- [${ai.completed ? 'x' : ' '}] **${ai.title}** (@${ai.assigneeName}) — Due: ${ai.dueDate || 'Unscheduled'}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExport = (platform: 'Slack' | 'Notion' | 'Salesforce') => {
    setExportNotice(`Exported ${meeting.actionItems.length} action items directly to ${platform}!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const completedCount = meeting.actionItems.filter((a) => a.completed).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Extracted Action Items</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {completedCount} of {meeting.actionItems.length} completed
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click any timestamp to hear the assignment in the audio recording
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Item</span>
          </button>

          <button
            onClick={handleCopyActionItems}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy List</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Notification */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Action Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
        {meeting.actionItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No action items identified for this call.
          </div>
        ) : (
          meeting.actionItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between rounded-xl p-3 pt-3 transition ${
                item.completed ? 'bg-slate-50/70 opacity-70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleActionItem(item.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <p
                    className={`text-xs sm:text-sm font-medium leading-relaxed ${
                      item.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                    }`}
                  >
                    {item.title}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      <User className="h-3 w-3 text-slate-400" />
                      {item.assigneeName}
                    </span>

                    {item.dueDate && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Due {item.dueDate}
                      </span>
                    )}

                    {item.timestamp > 0 && (
                      <button
                        onClick={() => onSeek(item.timestamp)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline font-mono"
                        title="Seek player to when this task was assigned"
                      >
                        <Clock className="h-3 w-3" />
                        <span>Spoken at {formatTime(item.timestamp)}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sync Integrations Bar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium text-[11px] text-slate-500 uppercase tracking-wider">
          Sync Action Items To:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('Slack')}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1"
          >
            <span>#slack</span>
          </button>
          <button
            onClick={() => handleExport('Notion')}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1"
          >
            <span>Notion</span>
          </button>
          <button
            onClick={() => handleExport('Salesforce')}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1"
          >
            <span>Salesforce Tasks</span>
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Action Item</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule follow-up demo with Tom Wu"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    Assignee
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  >
                    {meeting.attendees.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="e.g. Next Tuesday"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

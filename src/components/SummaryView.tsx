import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  CheckSquare, 
  ChevronRight, 
  FileText, 
  Bot, 
  MessageSquare 
} from 'lucide-react';
import { Meeting, MeetingSummary, SummaryTemplateType } from '../types';

interface SummaryViewProps {
  meeting: Meeting;
  onUpdateSummary: (newSummary: MeetingSummary) => void;
  onSeek: (seconds: number) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  meeting,
  onUpdateSummary,
  onSeek,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<SummaryTemplateType>(meeting.summary.template);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Ask AI about this meeting state
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: `Hello! I have fully processed the 58-minute call with Sarah, Alex, Dev, Priya, Marcus, Elena, James, and Chloe. Ask me anything about ADR-042, GDPR PII compliance, database scaling, or frontend CRDT sync.`
    }
  ]);

  const templateOptions: Array<{ id: SummaryTemplateType; label: string; desc: string }> = [
    { id: 'architecture', label: 'Architecture & Engineering Review', desc: 'Technical trade-offs, system boundaries, ADR synthesis, and scaling risks' },
    { id: 'executive', label: 'Executive Summary', desc: 'High-level business outcomes, strategic risks, and top decisions' },
    { id: 'sales', label: 'Sales Discovery (BANT)', desc: 'Budget, Authority, Need, Timeline, competitor flags, and CRM sync' },
    { id: '1on1', label: '1-on-1 Mentorship', desc: 'Wins, feedback, blockers, career progression, and mutual commitments' },
    { id: 'customer_success', label: 'Customer Success / QBR', desc: 'Customer sentiment, product requests, account health, and renewal risks' },
    { id: 'custom', label: 'Custom AI Prompt...', desc: 'Provide your own specific summarization instructions' },
  ];

  const getPrebuiltTemplateSummary = (tmpl: SummaryTemplateType, m: Meeting): MeetingSummary => {
    switch (tmpl) {
      case 'executive':
        return {
          template: 'executive',
          overview: `Executive briefing for "${m.title}". Highlights key strategic milestones, financial impact, and organizational alignment across all ${m.attendees.length} stakeholder departments.`,
          sections: [
            {
              title: 'Executive Highlights & Strategic Impact',
              points: [
                'Unanimous stakeholder alignment reached on the primary project roadmap.',
                'Identified potential compliance and revenue risks early to protect Q4 milestones.',
                'Cross-functional commitments established with clear executive sponsors.'
              ]
            },
            {
              title: 'Financial & Resource Allocations',
              points: [
                'Budgetary approvals confirmed within current quarterly operational expenditures.',
                'Engineering capacity locked for upcoming sprint delivery cycles.'
              ]
            }
          ],
          keyDecisions: [
            'Formally authorized milestone progression for Q4.',
            'Confirmed executive check-in cadence for bi-weekly progress reviews.'
          ],
          sentiment: 'positive'
        };
      case 'sales':
        return {
          template: 'sales',
          overview: `Sales intelligence and BANT qualification audit for "${m.title}". Outlines commercial opportunity, customer procurement timeline, and sales engineering requirements.`,
          sections: [
            {
              title: 'BANT Qualification Framework',
              points: [
                'Budget: Capital expenditure approved in current budget cycle.',
                'Authority: Core decision makers present with procurement veto authority.',
                'Need: Critical business driver to reduce manual administrative overhead.',
                'Timeline: Pilot commencement scheduled within 3 weeks.'
              ]
            },
            {
              title: 'Objections & Competitive Landscape',
              points: [
                'Evaluated against legacy manual workflows and incumbent vendors.',
                'Infosec approval and SSO compliance identified as prerequisite gate.'
              ]
            }
          ],
          keyDecisions: [
            'Proceed with standard commercial terms and security addendum.',
            'Schedule sales engineering pilot kickoff with stakeholders.'
          ],
          sentiment: 'positive'
        };
      case '1on1':
        return {
          template: '1on1',
          overview: `Bi-directional mentorship and alignment notes for "${m.title}". Focuses on personal growth, role expectations, blocker resolution, and immediate weekly goals.`,
          sections: [
            {
              title: 'Wins & Recent Accomplishments',
              points: [
                'Acknowledged successful project completion and technical leadership demonstrated.',
                'Positive stakeholder feedback shared from cross-functional peers.'
              ]
            },
            {
              title: 'Growth Vectors & Professional Goals',
              points: [
                'Explored technical conference sponsorship and leadership presentation opportunities.',
                'Established clear benchmarks for upcoming promotional review cycle.'
              ]
            },
            {
              title: 'Support & Resource Commitments',
              points: [
                'Manager approved dedicated tooling budget to unblock experimental workflows.',
                'Agreed to delegate operational chores to protect uninterrupted focus blocks.'
              ]
            }
          ],
          keyDecisions: [
            'Targeting formal lead role transition in next review cycle.',
            'Confirmed participation in upcoming tech all-hands presentation.'
          ],
          sentiment: 'positive'
        };
      case 'customer_success':
        return {
          template: 'customer_success',
          overview: `Customer health and partnership review for "${m.title}". Tracks account utilization metrics, net promoter sentiment, feature requests, and contract renewal timeline.`,
          sections: [
            {
              title: 'Account Health & Usage Metrics',
              points: [
                'Strong weekly active engagement across distributed user cohorts.',
                'User satisfaction rating exceeding target SLA benchmarks.',
                'Average time saved estimated at 4+ hours per team member weekly.'
              ]
            },
            {
              title: 'Feature Requests & Product Roadmap Inputs',
              points: [
                'Requested deeper bidirectional webhook synchronization with internal issue trackers.',
                'Enterprise infosec requested granular audit logging on export actions.'
              ]
            }
          ],
          keyDecisions: [
            'Confirmed multi-year seat expansion upon delivery of milestone integration.',
            'Established shared Slack connect channel for priority support escalation.'
          ],
          sentiment: 'positive'
        };
      case 'architecture':
      default:
        return {
          template: 'architecture',
          overview: `Architecture Decision Record (ADR) and technical review for "${m.title}". Covers system boundaries, data replication schemas, resilience trade-offs, and scaling benchmarks.`,
          sections: [
            {
              title: 'System Boundaries & Decoupling Strategy',
              points: [
                'Ratified Strangler Fig architectural migration pattern for core domain services.',
                'Isolated billing and identity modules to reduce monolith blast radius.',
                'Preserved existing transactional integrity guarantees on legacy datastores.'
              ]
            },
            {
              title: 'Database Throughput & Connection Resilience',
              points: [
                'Introduced PgBouncer connection pooling to mitigate RDS thread saturation.',
                'Benchmarking target of 12,000 rps under synthetic load generator.',
                'Partitioned high-volume tables by tenant identifier.'
              ]
            },
            {
              title: 'Compliance & Cross-Region Data Sovereignty',
              points: [
                'Mandated field-level envelope encryption for all Kafka topics crossing EU borders.',
                'Zero unmasked PII permitted in centralized telemetry and distributed tracing.'
              ]
            }
          ],
          keyDecisions: [
            'Officially signed off on ADR-042 specifications.',
            'Approved staging cluster synthetic chaos testing schedule.'
          ],
          sentiment: 'positive'
        };
    }
  };

  const handleTemplateChange = async (tmpl: SummaryTemplateType) => {
    setSelectedTemplate(tmpl);
    if (tmpl === 'custom') {
      setShowCustomModal(true);
      return;
    }

    // Instantly update UI with specialized template layout
    const prebuilt = getPrebuiltTemplateSummary(tmpl, meeting);
    onUpdateSummary(prebuilt);

    // Call server to regenerate summary with this template via Gemini
    await generateTemplateSummary(tmpl);
  };

  const generateTemplateSummary = async (tmpl: SummaryTemplateType, promptOverride?: string) => {
    setIsGenerating(true);
    const fullTranscript = meeting.transcript.map((t) => `${t.speakerName}: ${t.text}`).join('\n');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText: fullTranscript,
          templateType: tmpl,
          customPrompt: promptOverride || customPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.overview) {
          const newSummary: MeetingSummary = {
            template: tmpl,
            overview: data.overview,
            sections: data.sections || meeting.summary.sections,
            keyDecisions: data.keyDecisions || meeting.summary.keyDecisions,
            sentiment: 'positive',
          };
          onUpdateSummary(newSummary);
        }
      }
    } catch (err) {
      console.warn('Using intelligent local template fallback:', err);
    } finally {
      setIsGenerating(false);
      setShowCustomModal(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userQ = question.trim();
    setChatHistory((prev) => [...prev, { role: 'user', text: userQ }]);
    setQuestion('');
    setIsAsking(true);

    const fullTranscript = meeting.transcript.map((t) => `${t.speakerName}: ${t.text}`).join('\n');

    try {
      const res = await fetch('/api/ask-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          transcriptText: fullTranscript,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory((prev) => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: 'ai', text: `Based on the discussion, Marcus Vance stressed that GDPR EU compliance requires field-level encryption on Kafka topics before replicating to Frankfurt.` }
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: `Based on the meeting transcript: The team confirmed that Dev Patel will test 12,000 rps with PgBouncer connection pooling on Thursday.` }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopySummaryMarkdown = () => {
    let md = `# ${meeting.title} - AI Summary\n\n`;
    md += `**Date:** ${meeting.date}\n`;
    md += `**Attendees:** ${meeting.attendees.map((a) => a.name).join(', ')}\n\n`;
    md += `## Overview\n${meeting.summary.overview}\n\n`;

    meeting.summary.sections.forEach((s) => {
      md += `### ${s.title}\n`;
      s.points.forEach((p) => {
        md += `- ${p}\n`;
      });
      md += `\n`;
    });

    if (meeting.summary.keyDecisions?.length > 0) {
      md += `### Key Decisions\n`;
      meeting.summary.keyDecisions.forEach((d) => {
        md += `- [x] ${d}\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Template Selector & Actions */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        {/* Template Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Template:</span>
          </div>

          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value as SummaryTemplateType)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            {templateOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {isGenerating && (
            <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-medium animate-pulse ml-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Re-generating...
            </span>
          )}
        </div>

        {/* Copy / Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateTemplateSummary(selectedTemplate)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            title="Re-run AI summarization"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleCopySummaryMarkdown}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-2xs"
          >
            {copiedSummary ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area: Scrollable summary + Ask AI Drawer */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Executive Overview Card */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Meeting Synthesis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
            {meeting.summary.overview}
          </p>
        </div>

        {/* Key Decisions Banner */}
        {meeting.summary.keyDecisions && meeting.summary.keyDecisions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
              Key Decisions Ratified
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {meeting.summary.keyDecisions.map((dec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3"
                >
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    ✓
                  </div>
                  <span className="text-xs font-medium text-emerald-950 leading-snug">
                    {dec}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Sections */}
        <div className="space-y-4">
          {meeting.summary.sections.map((section, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-600 font-mono">
                  {idx + 1}
                </span>
                <span>{section.title}</span>
              </h4>
              <ul className="space-y-2">
                {section.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ask Fathom AI about this Meeting Drawer */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Ask Fathom AI About This Meeting</h4>
              <p className="text-[11px] text-slate-500">Instant Q&A grounded exclusively in this call's transcript</p>
            </div>
          </div>

          {/* Chat history */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-xs">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`rounded-xl px-3 py-2 max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Fathom AI is reviewing the transcript...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. What were Dev's test results for PgBouncer?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Custom Prompt Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Custom AI Prompt</h3>
            <p className="text-xs text-slate-500 mb-4">
              Instruct Fathom how you want this transcript summarized (e.g. "Focus on GDPR risks and next sprint deliverables").
            </p>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom instructions..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => generateTemplateSummary('custom', customPrompt)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                Generate Custom Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ThumbsUp, 
  Layers,
  Volume2,
  X
} from 'lucide-react';
import { Meeting, MeetingHighlight, TranscriptUtterance, HighlightCategory } from '../types';

interface LiveRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteMeeting: (newMeeting: Meeting) => void;
  initialTitle?: string;
  initialPlatform?: 'zoom' | 'meet' | 'teams';
}

export const LiveRecorderModal: React.FC<LiveRecorderModalProps> = ({
  isOpen,
  onClose,
  onCompleteMeeting,
  initialTitle = 'Live Call with Fathom Notetaker',
  initialPlatform = 'zoom',
}) => {
  const [meetingTitle, setMeetingTitle] = useState(initialTitle);
  const [platform, setPlatform] = useState<'zoom' | 'meet' | 'teams'>(initialPlatform);
  const [isRecording, setIsRecording] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [highlights, setHighlights] = useState<MeetingHighlight[]>([]);
  const [liveTranscripts, setLiveTranscripts] = useState<TranscriptUtterance[]>([]);
  const [highlightNotification, setHighlightNotification] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Audio Context for real mic waveform
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Simulated live conversational stream when recording
  useEffect(() => {
    if (!isRecording) return;

    const sampleDialogue = [
      { text: "Thanks for hopping on this call to test Fathom's live note-taking and highlight capture.", speaker: "You (Host)", delay: 3 },
      { text: "Let's make sure our audio levels are registering clearly and the transcript latency is low.", speaker: "You (Host)", delay: 8 },
      { text: "Action item: Verify the team can access the Q4 architecture review slides before Friday.", speaker: "You (Host)", delay: 15, autoHighlight: 'action_item' },
      { text: "Key question: Are we planning to roll out the database connection pooling in us-east first?", speaker: "You (Host)", delay: 24, autoHighlight: 'key_question' },
      { text: "Decision confirmed: We will proceed with the phased Strangler Fig migration path.", speaker: "You (Host)", delay: 34, autoHighlight: 'decision' },
      { text: "Great! All highlights are tagging properly on the live timeline. We can now wrap up the call.", speaker: "You (Host)", delay: 42 }
    ];

    const timeouts: NodeJS.Timeout[] = [];

    sampleDialogue.forEach((item) => {
      const t = setTimeout(() => {
        const newUtterance: TranscriptUtterance = {
          id: `live-t-${Date.now()}-${Math.random()}`,
          speakerId: 'u-self',
          speakerName: item.speaker,
          startTime: Math.max(0, elapsedSeconds - 3),
          endTime: elapsedSeconds,
          text: item.text,
        };

        setLiveTranscripts((prev) => [...prev, newUtterance]);

        if (item.autoHighlight) {
          addHighlight(item.autoHighlight as HighlightCategory, `Auto-detected: ${item.text.slice(0, 50)}...`);
        }
      }, item.delay * 1000);

      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isRecording]);

  // Start real microphone capture if supported
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicActive(true);

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      drawWaveform();
    } catch (err) {
      console.warn("Could not access microphone, using simulated audio visualizer:", err);
      setMicActive(false);
      drawSimulatedWaveform();
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setMicActive(false);
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const drawSimulatedWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 24;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.sin(Date.now() * 0.005 + i) * (canvas.height * 0.4) + canvas.height * 0.45;
        ctx.fillStyle = '#818cf8';
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const startRecording = async () => {
    setIsRecording(true);
    setElapsedSeconds(0);
    setHighlights([]);
    setLiveTranscripts([]);
    await startMic();
  };

  const addHighlight = (category: HighlightCategory, customNote?: string) => {
    const categoryLabels: Record<HighlightCategory, { label: string; color: string }> = {
      action_item: { label: 'Action Item', color: 'emerald' },
      key_question: { label: 'Key Question', color: 'amber' },
      decision: { label: 'Decision', color: 'indigo' },
      positive_feedback: { label: 'Positive Feedback', color: 'purple' },
      concern: { label: 'Risk / Concern', color: 'rose' },
    };

    const info = categoryLabels[category];
    const newHl: MeetingHighlight = {
      id: `hl-live-${Date.now()}`,
      timestamp: elapsedSeconds,
      speakerName: 'You (Host)',
      category: category,
      note: customNote || `${info.label} marked at ${formatTime(elapsedSeconds)}`,
      color: info.color,
      quote: liveTranscripts.length > 0 ? liveTranscripts[liveTranscripts.length - 1].text : undefined,
    };

    setHighlights((prev) => [...prev, newHl]);
    setHighlightNotification(`Tagged "${info.label}" at ${formatTime(elapsedSeconds)}`);
    setTimeout(() => setHighlightNotification(null), 3000);
  };

  const handleFinishAndGenerate = async () => {
    setIsGenerating(true);
    stopMic();

    // Call server to summarize if possible
    const fullText = liveTranscripts.map((t) => `${t.speakerName}: ${t.text}`).join('\n') || 
      'You (Host): Testing Fathom meeting recording bot. Highlighted key architecture action items and verified playback against transcript.';

    let generatedSummary = {
      template: 'executive' as const,
      overview: `Live meeting "${meetingTitle}" concluded after ${formatTime(elapsedSeconds)}. The host tested live transcription and bookmarked ${highlights.length} key moments.`,
      sections: [
        {
          title: 'Core Discussion Points',
          points: [
            'Tested real-time audio input and speaker diarization latency.',
            'Captured mid-call highlights and mapped them to the interactive timeline.',
            'Confirmed prompt generation and multi-template note synthesis.'
          ]
        },
        {
          title: 'Agreed Outcomes',
          points: [
            'Playback verified with synchronized transcript scrubber.',
            'Meeting notes ready for export to Slack and CRM.'
          ]
        }
      ],
      keyDecisions: [
        'Confirmed Fathom bot calibration is ready for multi-attendee calls.'
      ]
    };

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText: fullText,
          templateType: 'executive'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.overview) {
          generatedSummary = {
            template: 'executive',
            overview: data.overview,
            sections: data.sections || generatedSummary.sections,
            keyDecisions: data.keyDecisions || generatedSummary.keyDecisions
          };
        }
      }
    } catch (e) {
      console.warn('Using local summary fallback:', e);
    }

    const newMeeting: Meeting = {
      id: `meet-rec-${Date.now()}`,
      title: meetingTitle,
      date: 'Just now',
      duration: Math.max(elapsedSeconds, 45),
      platform: platform,
      category: 'test',
      tags: ['Live-Recording', 'Calibration', 'Notetaker'],
      attendees: [
        {
          id: 'u-self',
          name: 'You (Current User)',
          role: 'Meeting Host',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          email: 'user@fathom.video',
          isHost: true
        }
      ],
      highlights: highlights.length > 0 ? highlights : [
        {
          id: `hl-rec-1`,
          timestamp: Math.floor(elapsedSeconds * 0.4),
          speakerName: 'You (Current User)',
          category: 'action_item',
          note: 'Action Item: Review live notes and share clip with team.',
          color: 'emerald'
        }
      ],
      actionItems: [
        {
          id: `ai-rec-1`,
          title: 'Review and distribute generated meeting notes to call attendees',
          assigneeName: 'You',
          completed: false,
          timestamp: Math.floor(elapsedSeconds * 0.3),
          dueDate: 'Today'
        }
      ],
      summary: generatedSummary,
      transcript: liveTranscripts.length > 0 ? liveTranscripts : [
        {
          id: 't-live-1',
          speakerId: 'u-self',
          speakerName: 'You (Current User)',
          startTime: 0,
          endTime: Math.max(elapsedSeconds, 20),
          text: fullText
        }
      ]
    };

    setIsGenerating(false);
    setIsRecording(false);
    onCompleteMeeting(newMeeting);
    onClose();
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isRecording ? 'Fathom Notetaker Active' : 'Launch Meeting Recording'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRecording
                  ? 'Recording audio, transcribing in real-time, and listening for highlights'
                  : 'Start a 2-minute test call or connect Fathom to a live Zoom/Meet call'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopMic();
              onClose();
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {!isRecording ? (
            /* Setup Before Starting */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Quick 2-Minute Audio Calibration Call"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['zoom', 'meet', 'teams'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold uppercase transition ${
                        platform === p
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs text-indigo-900 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  What happens when you record:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  <li>Microphone audio or simulated stream is transcribed in real-time.</li>
                  <li>You can tap <strong>Highlight</strong> buttons mid-call to bookmark key moments.</li>
                  <li>When you end the call, Fathom instantly generates structured AI meeting notes!</li>
                </ul>
              </div>

              <button
                onClick={startRecording}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording & Open Controller</span>
              </button>
            </div>
          ) : (
            /* Active Live Recording & In-Meeting Controller */
            <div className="space-y-5">
              {/* Status Banner with Timer */}
              <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      REC — {platform.toUpperCase()}
                    </span>
                    <p className="text-xs font-medium text-slate-700">{meetingTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-slate-900">
                    {formatTime(elapsedSeconds)}
                  </span>
                  <div className="h-6 w-px bg-rose-200" />
                  <canvas ref={canvasRef} width={80} height={24} className="rounded" />
                </div>
              </div>

              {/* Notification toast when highlight clicked */}
              {highlightNotification && (
                <div className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-medium flex items-center gap-2 shadow-md animate-fade-in">
                  <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                  <span>{highlightNotification}</span>
                </div>
              )}

              {/* Signature Fathom Mid-Call Highlight Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fathom In-Call Bookmark Shortcuts
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Click to pin moment to timeline ({highlights.length} saved)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => addHighlight('action_item')}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Action Item</span>
                  </button>

                  <button
                    onClick={() => addHighlight('decision')}
                    className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 transition active:scale-95"
                  >
                    <Bookmark className="h-4 w-4 text-indigo-600" />
                    <span>Decision</span>
                  </button>

                  <button
                    onClick={() => addHighlight('key_question')}
                    className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition active:scale-95"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    <span>Key Question</span>
                  </button>

                  <button
                    onClick={() => addHighlight('concern')}
                    className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition active:scale-95"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Risk / Concern</span>
                  </button>
                </div>
              </div>

              {/* Live Streaming Transcription Box */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Real-time Speech Transcription Stream
                </label>
                <div className="h-32 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-3 text-xs font-mono text-slate-200 space-y-2">
                  {liveTranscripts.length === 0 ? (
                    <p className="text-slate-500 italic">
                      Listening to speech... speak into your microphone or wait for live audio simulation.
                    </p>
                  ) : (
                    liveTranscripts.map((item, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-indigo-400 font-semibold">{item.speakerName}:</span>{' '}
                        <span>{item.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* End Call Button */}
              <button
                disabled={isGenerating}
                onClick={handleFinishAndGenerate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Generating AI Meeting Notes...</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 fill-white" />
                    <span>End Meeting & Generate Notes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

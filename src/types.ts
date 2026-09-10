export type MeetingPlatform = 'zoom' | 'meet' | 'teams';

export type HighlightCategory = 
  | 'action_item'
  | 'key_question'
  | 'decision'
  | 'positive_feedback'
  | 'concern';

export interface Attendee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  isHost?: boolean;
}

export interface TranscriptUtterance {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerAvatar?: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  highlightCategory?: HighlightCategory;
  highlightNote?: string;
}

export interface MeetingHighlight {
  id: string;
  timestamp: number; // in seconds
  speakerName: string;
  category: HighlightCategory;
  note: string;
  color: string;
  quote?: string;
}

export type SummaryTemplateType = 
  | 'executive'
  | 'sales'
  | '1on1'
  | 'architecture'
  | 'customer_success'
  | 'custom';

export interface SummarySection {
  title: string;
  points: string[];
}

export interface MeetingSummary {
  template: SummaryTemplateType;
  overview: string;
  sections: SummarySection[];
  keyDecisions: string[];
  sentiment?: 'positive' | 'neutral' | 'mixed';
}

export interface ActionItem {
  id: string;
  title: string;
  assigneeName: string;
  assigneeAvatar?: string;
  completed: boolean;
  timestamp: number; // time in call where it was spoken
  dueDate?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number; // seconds
  platform: MeetingPlatform;
  attendees: Attendee[];
  category: 'architecture' | 'sales' | 'product' | '1on1' | 'test';
  transcript: TranscriptUtterance[];
  highlights: MeetingHighlight[];
  summary: MeetingSummary;
  actionItems: ActionItem[];
  tags: string[];
  videoThumbnail?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  platform: MeetingPlatform;
  meetingLink: string;
  attendeesCount: number;
  attendeeNames: string[];
  autoRecord: boolean;
  isHost: boolean;
}

export interface ShareClip {
  id: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  startTime: number;
  endTime: number;
  createdDate: string;
  authorName: string;
  shareUrl: string;
  isPublic: boolean;
}

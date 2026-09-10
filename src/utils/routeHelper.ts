import { Meeting, ShareClip } from '../types';

export interface RouteResolution {
  meeting: Meeting;
  isFallback: boolean;
  activeClip: ShareClip | null;
  initialTimestamp: number;
  routeType: 'recording' | 'share' | 'clip' | 'root';
  rawId: string | null;
}

/**
 * Parses the current window location to extract route parameters.
 * Supports:
 *   /recording/:id
 *   /share/:id
 *   /clip/:id
 *   /?meeting=:id or /?recording=:id or /?clip=:id or /?share=:id
 *   ?t=120 or #t=120 for timestamp seeking
 */
export function parseCurrentRoute(): {
  routeType: 'recording' | 'share' | 'clip' | 'root';
  id: string | null;
  timestamp: number | null;
} {
  if (typeof window === 'undefined') {
    return { routeType: 'root', id: null, timestamp: null };
  }

  const pathname = window.location.pathname.replace(/\/+$/, ''); // remove trailing slash
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  // Extract timestamp if provided: ?t=120 or #t=120
  let timestamp: number | null = null;
  const tParam = searchParams.get('t') || searchParams.get('time');
  if (tParam && !isNaN(Number(tParam))) {
    timestamp = Math.max(0, Number(tParam));
  } else if (hash.startsWith('#t=')) {
    const hashVal = hash.replace('#t=', '');
    if (!isNaN(Number(hashVal))) {
      timestamp = Math.max(0, Number(hashVal));
    }
  }

  // Check query parameter overrides (e.g. in iframes or query redirects)
  const queryId = searchParams.get('meeting') || searchParams.get('recording') || searchParams.get('share') || searchParams.get('id');
  const queryClipId = searchParams.get('clip');
  if (queryClipId) {
    return { routeType: 'clip', id: decodeURIComponent(queryClipId), timestamp };
  }
  if (queryId) {
    return { routeType: 'share', id: decodeURIComponent(queryId), timestamp };
  }

  // Parse path segments: /recording/:id, /share/:id, /clip/:id
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const prefix = segments[0].toLowerCase();
    const id = decodeURIComponent(segments[1]);

    if (prefix === 'recording' || prefix === 'recordings') {
      return { routeType: 'recording', id, timestamp };
    }
    if (prefix === 'share' || prefix === 'shares') {
      return { routeType: 'share', id, timestamp };
    }
    if (prefix === 'clip' || prefix === 'clips') {
      return { routeType: 'clip', id, timestamp };
    }
  } else if (segments.length === 1) {
    // e.g. /meet-8person-arch or /clip-strangler-fig
    const segment = decodeURIComponent(segments[0]);
    if (segment !== '' && segment !== 'index.html') {
      return { routeType: 'share', id: segment, timestamp };
    }
  }

  return { routeType: 'root', id: null, timestamp };
}

/**
 * Fallback Mock Data Strategy:
 * 1. Checks if `rawId` directly matches a meeting id.
 * 2. Checks if `rawId` matches a clip id; if so, resolves the meeting and bounds.
 * 3. If unknown, unindexed, or missing, falls back cleanly to the flagship 8-person 1-hour call.
 * NEVER throws or returns 404.
 */
export function resolveMeetingOrFallback(
  rawId: string | null,
  meetings: Meeting[],
  clips: ShareClip[]
): RouteResolution {
  const flagshipMeeting = meetings[0]; // Flagship: 8-person 1-hour architecture call

  if (!rawId || rawId.trim() === '') {
    return {
      meeting: flagshipMeeting,
      isFallback: false,
      activeClip: null,
      initialTimestamp: 0,
      routeType: 'root',
      rawId: null,
    };
  }

  const cleanId = rawId.trim().toLowerCase();

  // 1. Check exact or slug match in meetings
  const matchedMeeting = meetings.find(
    (m) => m.id.toLowerCase() === cleanId || m.id.toLowerCase().includes(cleanId)
  );
  if (matchedMeeting) {
    return {
      meeting: matchedMeeting,
      isFallback: false,
      activeClip: null,
      initialTimestamp: 0,
      routeType: 'recording',
      rawId,
    };
  }

  // 2. Check if it's a clip ID
  const matchedClip = clips.find(
    (c) => c.id.toLowerCase() === cleanId || c.id.toLowerCase().includes(cleanId)
  );
  if (matchedClip) {
    const parentMeeting = meetings.find((m) => m.id === matchedClip.meetingId) || flagshipMeeting;
    return {
      meeting: parentMeeting,
      isFallback: false,
      activeClip: matchedClip,
      initialTimestamp: matchedClip.startTime,
      routeType: 'clip',
      rawId,
    };
  }

  // 3. Fallback gracefully to flagship 8-person meeting without 404
  return {
    meeting: flagshipMeeting,
    isFallback: true,
    activeClip: null,
    initialTimestamp: 0,
    routeType: 'share',
    rawId,
  };
}

/**
 * Helper to build public share links using the active domain root
 */
export function getPublicMeetingShareUrl(meetingId: string): string {
  if (typeof window === 'undefined') return `/share/${meetingId}`;
  return `${window.location.origin}/share/${meetingId}`;
}

export function getPublicClipShareUrl(clipId: string): string {
  if (typeof window === 'undefined') return `/clip/${clipId}`;
  return `${window.location.origin}/clip/${clipId}`;
}

/**
 * Push state to browser history and notify listeners
 */
export function updateBrowserUrl(path: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
    // Dispatch synthetic popstate so components can react
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOGS_DIR = path.join(process.cwd(), '.agent-logs');
const STATE_FILE = path.join(LOGS_DIR, '.session-state.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTimestamp() {
  return new Date().toISOString();
}

function formatDate(isoString) {
  return isoString.split('T')[0];
}

function formatFilenameDate(isoString) {
  // YYYY-MM-DD_HH-MM-SS
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const timePart = `${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}`;
  return `${datePart}_${timePart}`;
}

function loadState() {
  ensureDir(LOGS_DIR);
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      // Fallback
    }
  }
  return null;
}

function saveState(state) {
  ensureDir(LOGS_DIR);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function initSession(options = {}) {
  ensureDir(LOGS_DIR);
  const now = getTimestamp();
  const sessionId = options.sessionId || crypto.randomUUID();
  const shortId = sessionId.slice(0, 8);
  const dateStr = formatDate(now);
  const filename = `${formatFilenameDate(now)}_${sessionId}.md`;
  const filePath = path.join(LOGS_DIR, filename);

  const state = {
    session_id: sessionId,
    short_id: shortId,
    file_path: filePath,
    filename: filename,
    date: dateStr,
    author: options.author || 'hoork2002',
    model: options.model || 'gemini-3.8-flash',
    tool: options.tool || 'google-ai-studio-build',
    project: options.project || 'fathom-notetaker',
    total_exchanges: 0,
    first_prompt_time: now,
    last_prompt_time: now,
    pending_prompt: null
  };

  saveState(state);
  writeSessionFile(state, []);
  return state;
}

function writeSessionFile(state, entries = []) {
  const frontmatter = `---
session_id: ${state.session_id}
date: ${state.date}
author: ${state.author}
model: ${state.model}
tool: ${state.tool}
project: ${state.project}
total_exchanges: ${state.total_exchanges}
first_prompt_time: ${state.first_prompt_time}
last_prompt_time: ${state.last_prompt_time}
---

# Session Log - ${state.date}

Session: \`${state.short_id}\` | Project: \`${state.project}\` | Author: \`${state.author}\`

---
`;

  let content = frontmatter;
  if (entries.length > 0) {
    content += '\n' + entries.join('\n\n') + '\n';
  }

  fs.writeFileSync(state.file_path, content, 'utf-8');
}

function appendEntry(state, entryText) {
  // Read current file, strip or keep, append entry
  let content = fs.readFileSync(state.file_path, 'utf-8');
  // Update header with updated exchanges count and last prompt time
  const updatedFrontmatter = `---
session_id: ${state.session_id}
date: ${state.date}
author: ${state.author}
model: ${state.model}
tool: ${state.tool}
project: ${state.project}
total_exchanges: ${state.total_exchanges}
first_prompt_time: ${state.first_prompt_time}
last_prompt_time: ${state.last_prompt_time}
---`;

  content = content.replace(/^---[\s\S]*?---/, updatedFrontmatter);
  content = content.trimEnd() + '\n\n' + entryText + '\n';
  fs.writeFileSync(state.file_path, content, 'utf-8');
}

function logPrompt(promptText, options = {}) {
  let state = loadState();
  const now = getTimestamp();
  if (!state || options.newSession) {
    state = initSession(options);
  }

  const exchangeNum = state.total_exchanges + 1;
  const entryText = `[LOG_ENTRY type=PROMPT num=${exchangeNum} session=${state.short_id}]
timestamp: ${now}
model: ${state.model}

${promptText.trim()}`;

  state.pending_prompt = {
    num: exchangeNum,
    prompt: promptText,
    timestamp: now
  };
  state.last_prompt_time = now;
  saveState(state);
  appendEntry(state, entryText);
  return { state, exchangeNum };
}

function logResponse(responseText, options = {}) {
  let state = loadState();
  if (!state) {
    state = initSession(options);
  }
  const now = getTimestamp();
  const exchangeNum = state.pending_prompt ? state.pending_prompt.num : (state.total_exchanges + 1);

  const entryText = `[LOG_ENTRY type=RESPONSE num=${exchangeNum} session=${state.short_id}]
timestamp: ${now}
model: ${state.model}

${responseText.trim()}`;

  state.total_exchanges = exchangeNum;
  state.pending_prompt = null;
  saveState(state);
  appendEntry(state, entryText);
  return { state, exchangeNum };
}

function logTurn(promptText, responseText, options = {}) {
  let state = loadState();
  const nowPrompt = options.promptTime || getTimestamp();
  const nowResponse = options.responseTime || getTimestamp();

  if (!state || options.newSession) {
    state = initSession(options);
  }

  const exchangeNum = state.total_exchanges + 1;
  state.total_exchanges = exchangeNum;
  state.last_prompt_time = nowPrompt;

  const promptBlock = `[LOG_ENTRY type=PROMPT num=${exchangeNum} session=${state.short_id}]
timestamp: ${nowPrompt}
model: ${state.model}

${promptText.trim()}`;

  const responseBlock = `[LOG_ENTRY type=RESPONSE num=${exchangeNum} session=${state.short_id}]
timestamp: ${nowResponse}
model: ${state.model}

${responseText.trim()}`;

  saveState(state);
  appendEntry(state, promptBlock + '\n\n' + responseBlock);
  return { state, exchangeNum };
}

// CLI handler
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'init-session') {
    const s = initSession();
    console.log(`Initialized session: ${s.session_id} -> ${s.file_path}`);
  } else if (command === 'log-turn') {
    const promptIdx = args.indexOf('--prompt');
    const responseIdx = args.indexOf('--response');
    const newSession = args.includes('--new-session');
    if (promptIdx === -1 || responseIdx === -1) {
      console.error('Usage: node scripts/agent-logger.cjs log-turn --prompt "<text>" --response "<text>" [--new-session]');
      process.exit(1);
    }
    const prompt = args[promptIdx + 1];
    const response = args[responseIdx + 1];
    const res = logTurn(prompt, response, { newSession });
    console.log(`Logged turn ${res.exchangeNum} in session ${res.state.session_id}`);
  } else {
    console.log('Available commands: init-session, log-turn');
  }
}

module.exports = {
  initSession,
  logPrompt,
  logResponse,
  logTurn,
  loadState,
  LOGS_DIR
};

// Every possible command Nova understands
// TypeScript union type — a command is exactly ONE of these shapes
export type ParsedCommand =
  | { type: 'CALL'; name: string }
  | { type: 'SET_ALARM'; hour: number; minute: number }
  | { type: 'SET_TIMER'; seconds: number }
  | { type: 'TELL_TIME' }
  | { type: 'TELL_DATE' }
  | { type: 'TELL_BATTERY' }
  | { type: 'READ_NOTIFICATIONS' }
  | { type: 'OPEN_CAMERA' }
  | { type: 'TOGGLE_FLASHLIGHT' }
  | { type: 'PLAY_MUSIC' }
  | { type: 'PAUSE_MUSIC' }
  | { type: 'NEXT_TRACK' }
  | { type: 'VOLUME_UP' }
  | { type: 'VOLUME_DOWN' }
  | { type: 'UNKNOWN'; raw: string };

export function parseCommand(input: string): ParsedCommand {
  // Normalize — lowercase and remove punctuation
  // "Call Mom!" becomes "call mom"
  const t = input.toLowerCase().replace(/[.,!?]/g, '').trim();

  // ── CALL ────────────────────────────────────────────────
  // Matches: "call mom", "call john", "phone sarah", "dial dad"
  const callMatch = t.match(/\b(call|phone|dial|ring)\b\s+(.+)/);
  if (callMatch) {
    return { type: 'CALL', name: callMatch[2].trim() };
  }

  // ── ALARM ────────────────────────────────────────────────
  // Matches: "set alarm for 7am", "wake me at 6 30", "alarm at 9"
  const alarmMatch = t.match(
    /\b(set alarm|alarm|wake me)\b.*?(\d{1,2})(?:[: ](\d{2}))?\s*(am|pm)?/
  );
  if (alarmMatch) {
    let hour = parseInt(alarmMatch[2], 10);
    const minute = alarmMatch[3] ? parseInt(alarmMatch[3], 10) : 0;
    const period = alarmMatch[4];
    // Convert to 24 hour format
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    return { type: 'SET_ALARM', hour, minute };
  }

  // ── TIMER ────────────────────────────────────────────────
  // Matches: "set timer for 5 minutes", "timer 30 seconds"
  const timerMin = t.match(/timer.*?(\d+)\s*min/);
  if (timerMin) {
    return { type: 'SET_TIMER', seconds: parseInt(timerMin[1], 10) * 60 };
  }
  const timerSec = t.match(/timer.*?(\d+)\s*sec/);
  if (timerSec) {
    return { type: 'SET_TIMER', seconds: parseInt(timerSec[1], 10) };
  }

  // ── TIME & DATE ──────────────────────────────────────────
  // Matches: "what time is it", "what's the time"
  if (/\btime\b/.test(t) && !/alarm|timer/.test(t)) {
    return { type: 'TELL_TIME' };
  }
  // Matches: "what day is it", "today's date", "what is today"
  if (/\b(date|day|today)\b/.test(t)) {
    return { type: 'TELL_DATE' };
  }

  // ── BATTERY ──────────────────────────────────────────────
  // Matches: "battery", "how is my battery", "battery level"
  if (/\bbattery\b/.test(t)) {
    return { type: 'TELL_BATTERY' };
  }

  // ── NOTIFICATIONS ────────────────────────────────────────
  // Matches: "read notifications", "any messages", "what did i miss"
  if (/\b(notification|notifications|messages|alerts)\b/.test(t)) {
    return { type: 'READ_NOTIFICATIONS' };
  }

  // ── CAMERA ───────────────────────────────────────────────
  // Matches: "open camera", "take photo", "take a picture"
  if (/\b(camera|photo|picture|selfie)\b/.test(t)) {
    return { type: 'OPEN_CAMERA' };
  }

  // ── FLASHLIGHT ───────────────────────────────────────────
  // Matches: "flashlight", "toggle torch", "turn on torch"
  if (/\b(flashlight|torch)\b/.test(t)) {
    return { type: 'TOGGLE_FLASHLIGHT' };
  }

  // ── MUSIC ────────────────────────────────────────────────
  if (/\b(play|resume)\b.*music/.test(t) || t === 'play music') {
    return { type: 'PLAY_MUSIC' };
  }
  if (/\b(pause|stop)\b.*music/.test(t)) {
    return { type: 'PAUSE_MUSIC' };
  }
  if (/\b(next|skip)\b/.test(t)) {
    return { type: 'NEXT_TRACK' };
  }

  // ── VOLUME ───────────────────────────────────────────────
  if (/volume.*(up|higher|louder)/.test(t)) {
    return { type: 'VOLUME_UP' };
  }
  if (/volume.*(down|lower|quieter)/.test(t)) {
    return { type: 'VOLUME_DOWN' };
  }

  // Nothing matched — return unknown with the original text
  return { type: 'UNKNOWN', raw: input };
}
import type { Meeting } from '../types/f1';
import { CIRCUIT_IMAGES } from '../types/f1';

interface RaceDetailViewProps {
  meeting: Meeting;
  isSprintWeekend?: boolean;
  isPreviousRace?: boolean;
}

interface SessionResult {
  position: number;
  driver: string;
  team: string;
  time?: string;
}

// Stubbed session results - will be replaced with API data
const STUB_RESULTS: SessionResult[] = [
  { position: 1, driver: 'L. NORRIS', team: 'McLaren', time: '1:23.456' },
  { position: 2, driver: 'M. VERSTAPPEN', team: 'Red Bull Racing', time: '+0.123' },
  { position: 3, driver: 'O. PIASTRI', team: 'McLaren', time: '+0.456' },
];

function getCircuitImage(meeting: Meeting): string | null {
  const fieldsToTry = [
    meeting.country_name,
    meeting.circuit_short_name,
    meeting.location,
  ];

  for (const field of fieldsToTry) {
    if (field && CIRCUIT_IMAGES[field]) {
      return CIRCUIT_IMAGES[field];
    }
  }

  return null;
}

function formatDateRange(dateStart: string): string {
  const start = new Date(dateStart);
  const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const startDay = start.getDate();
  const endDay = startDay + 2;
  return `${month} ${startDay}-${endDay}`;
}

interface SessionCardProps {
  title: string;
  results: SessionResult[];
  isComplete?: boolean;
}

function SessionRow({ title, results, isComplete = false }: SessionCardProps) {
  return (
    <div className="flex items-center h-12 px-4 bg-f1-bg-secondary/80 rounded border-l-2 border-l-f1-accent-red border-y border-r border-f1-border/50">
      <div className={`text-sm font-bold tracking-wide w-28 ${isComplete ? 'text-f1-text-primary' : 'text-f1-text-muted'}`}>
        {title}
      </div>
      {isComplete ? (
        <div className="flex-1 flex gap-6">
          {results.slice(0, 3).map((result) => (
            <div key={result.position} className="flex items-center text-sm">
              <span className="text-f1-accent-red font-bold w-5">{result.position}.</span>
              <span className="text-f1-text-primary font-medium">{result.driver}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-f1-text-secondary">Upcoming</div>
      )}
    </div>
  );
}

export function RaceDetailView({ meeting, isSprintWeekend = false, isPreviousRace = false }: RaceDetailViewProps) {
  const circuitImage = getCircuitImage(meeting);
  const gpName = meeting.meeting_name.replace('Grand Prix', 'GP');
  const headerLabel = isPreviousRace ? 'LAST RACE' : 'UP NEXT';

  // Regular weekend sessions - show as complete for previous race
  const regularSessions = [
    { title: 'FP1', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'FP2', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'FP3', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'QUALIFYING', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'RACE', results: STUB_RESULTS, isComplete: isPreviousRace },
  ];

  // Sprint weekend sessions
  const sprintSessions = [
    { title: 'FP1', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'SPRINT QUALI', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'SPRINT', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'QUALIFYING', results: STUB_RESULTS, isComplete: isPreviousRace },
    { title: 'RACE', results: STUB_RESULTS, isComplete: isPreviousRace },
  ];

  const sessions = isSprintWeekend ? sprintSessions : regularSessions;

  return (
    <div className="h-full flex flex-col p-3">
      {/* Header with label, GP name and date */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-f1-accent-red mb-0.5">
            {headerLabel}
          </div>
          <div className="text-lg font-bold text-f1-text-primary">{gpName}</div>
          <div className="text-xs text-f1-text-secondary">
            {meeting.location}, {meeting.country_name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-f1-accent-red font-semibold">
            {formatDateRange(meeting.date_start)}
          </div>
          {isSprintWeekend && (
            <div className="text-[10px] bg-f1-accent-red text-white px-1.5 py-0.5 rounded inline-block mt-1">
              SPRINT
            </div>
          )}
        </div>
      </div>

      {/* Track image - maximized, no extra wrapper */}
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        {circuitImage ? (
          <img
            src={circuitImage}
            alt={`${meeting.circuit_short_name} circuit`}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="text-f1-text-muted text-sm">
            {meeting.circuit_short_name}
          </div>
        )}
      </div>

      {/* Session results as styled rows */}
      <div className="flex-shrink-0 space-y-1 mt-1">
        {sessions.map((session) => (
          <SessionRow
            key={session.title}
            title={session.title}
            results={session.results}
            isComplete={session.isComplete}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to check if a meeting is during race weekend (Fri-Sun of race week)
export function isRaceWeekend(meeting: Meeting): boolean {
  const now = new Date();
  const raceStart = new Date(meeting.date_start);
  const raceEnd = new Date(raceStart);
  raceEnd.setDate(raceEnd.getDate() + 2); // Race day is typically Sunday

  // Consider race weekend as Friday through Sunday
  const weekendStart = new Date(raceStart);
  weekendStart.setDate(weekendStart.getDate() - 1); // Start from Thursday night

  return now >= weekendStart && now <= raceEnd;
}

// Placeholder - sprint weekends for 2026 (to be updated)
const SPRINT_ROUNDS_2026 = [
  'Chinese GP',
  'Miami GP',
  'Belgian GP',
  'United States GP',
  'São Paulo GP',
  'Qatar GP',
];

export function isSprintWeekend(meetingName: string): boolean {
  return SPRINT_ROUNDS_2026.some(sprint =>
    meetingName.toLowerCase().includes(sprint.toLowerCase().replace(' gp', ''))
  );
}

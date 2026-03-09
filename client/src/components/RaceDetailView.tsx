import { useState, useEffect } from 'react';
import type { Meeting, Driver } from '../types/f1';
import { CIRCUIT_IMAGES } from '../types/f1';
import { getSessions, getRaceResults, getDriversBySession } from '../services/openf1';

// Cache results per meeting_key with 6-hour TTL
const resultsCache = new Map<number, { data: SessionData[]; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface RaceDetailViewProps {
  meeting: Meeting;
  isSprintWeekend?: boolean;
  isPreviousRace?: boolean;
}

interface SessionResult {
  position: number;
  driver: string;
  team: string;
}

interface SessionData {
  title: string;
  results: SessionResult[];
  isComplete: boolean;
}

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

// Map API session_name to display title
function getSessionTitle(sessionName: string): string {
  const map: Record<string, string> = {
    'Practice 1': 'FP1',
    'Practice 2': 'FP2',
    'Practice 3': 'FP3',
    'Qualifying': 'QUALIFYING',
    'Race': 'RACE',
    'Sprint': 'SPRINT',
    'Sprint Qualifying': 'SPRINT QUALI',
    'Sprint Shootout': 'SPRINT QUALI',
  };
  return map[sessionName] || sessionName.toUpperCase();
}

function formatDriverName(driver: Driver): string {
  if (driver.name_acronym) return driver.name_acronym;
  if (driver.last_name) return driver.last_name.toUpperCase().slice(0, 3);
  return `#${driver.driver_number}`;
}

interface SessionRowProps {
  title: string;
  results: SessionResult[];
  isComplete?: boolean;
}

function SessionRow({ title, results, isComplete = false }: SessionRowProps) {
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
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(isPreviousRace);
  const circuitImage = getCircuitImage(meeting);
  const gpName = meeting.meeting_name.replace('Grand Prix', 'GP');
  const headerLabel = isPreviousRace ? 'LAST RACE' : 'UP NEXT';

  useEffect(() => {
    if (!isPreviousRace) {
      // For upcoming races, just show session titles with "Upcoming"
      const titles = isSprintWeekend
        ? ['FP1', 'SPRINT QUALI', 'SPRINT', 'QUALIFYING', 'RACE']
        : ['FP1', 'FP2', 'FP3', 'QUALIFYING', 'RACE'];
      setSessionData(titles.map(title => ({ title, results: [], isComplete: false })));
      return;
    }

    // Check cache first
    const cached = resultsCache.get(meeting.meeting_key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setSessionData(cached.data);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchResults() {
      setLoading(true);
      try {
        const sessions = await getSessions(meeting.meeting_key);
        const now = new Date();
        const completedSessions = sessions
          .filter(s => new Date(s.date_end) < now)
          .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

        // Fetch drivers once for the whole meeting
        await delay(300);
        const drivers = await getDriversBySession(completedSessions[0]?.session_key ?? sessions[0]?.session_key);
        const driverMap = new Map<number, Driver>();
        for (const d of drivers) {
          driverMap.set(d.driver_number, d);
        }

        const results: SessionData[] = [];

        for (const session of completedSessions) {
          try {
            await delay(300);
            const positions = await getRaceResults(session.session_key);

            const top3: SessionResult[] = positions.slice(0, 3).map(pos => {
              const driver = driverMap.get(pos.driver_number);
              return {
                position: pos.position,
                driver: driver ? formatDriverName(driver) : `#${pos.driver_number}`,
                team: driver?.team_name || '',
              };
            });

            results.push({
              title: getSessionTitle(session.session_name),
              results: top3,
              isComplete: true,
            });
          } catch {
            results.push({
              title: getSessionTitle(session.session_name),
              results: [],
              isComplete: false,
            });
          }
        }

        if (!cancelled) {
          setSessionData(results);
          resultsCache.set(meeting.meeting_key, { data: results, timestamp: Date.now() });
        }
      } catch (e) {
        console.error('Failed to fetch race results:', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchResults();
    return () => { cancelled = true; };
  }, [meeting.meeting_key, isPreviousRace, isSprintWeekend]);

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
        {loading ? (
          <div className="text-center text-f1-text-muted text-sm py-4">Loading results...</div>
        ) : (
          sessionData.map((session) => (
            <SessionRow
              key={session.title}
              title={session.title}
              results={session.results}
              isComplete={session.isComplete}
            />
          ))
        )}
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

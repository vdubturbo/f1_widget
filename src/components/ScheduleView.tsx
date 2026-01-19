import type { Meeting } from '../types/f1';

interface ScheduleViewProps {
  meetings: Meeting[];
  startIndex?: number;
  itemsPerPage?: number;
  globalNextRaceIndex: number;
}

// Convert country code to flag emoji
function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length < 2) return '';

  // Handle 3-letter codes by mapping to 2-letter
  const codeMap: Record<string, string> = {
    'AUS': 'AU', 'AUT': 'AT', 'AZE': 'AZ', 'BHR': 'BH', 'BEL': 'BE',
    'BRA': 'BR', 'CAN': 'CA', 'CHN': 'CN', 'GBR': 'GB', 'HUN': 'HU',
    'ITA': 'IT', 'JPN': 'JP', 'MEX': 'MX', 'MCO': 'MC', 'NLD': 'NL',
    'QAT': 'QA', 'SAU': 'SA', 'SGP': 'SG', 'ESP': 'ES', 'UAE': 'AE',
    'USA': 'US', 'NED': 'NL', 'KSA': 'SA', 'MON': 'MC',
  };

  const code = codeMap[countryCode.toUpperCase()] || countryCode.slice(0, 2).toUpperCase();

  // Convert to regional indicator symbols
  const codePoints = [...code].map(char =>
    0x1F1E6 + char.charCodeAt(0) - 65
  );

  return String.fromCodePoint(...codePoints);
}

function formatDateRange(dateStart: string): string {
  const start = new Date(dateStart);
  const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const startDay = start.getDate();
  const endDay = startDay + 2;
  return `${month} ${startDay}-${endDay}`;
}

function getGrandPrixName(meetingName: string): string {
  return meetingName
    .replace('Grand Prix', 'GP')
    .replace('Grand prix', 'GP');
}

function isPastRace(dateStart: string): boolean {
  const raceDate = new Date(dateStart);
  raceDate.setDate(raceDate.getDate() + 2);
  return raceDate < new Date();
}

export function ScheduleView({
  meetings,
  startIndex = 0,
  itemsPerPage = 10,
  globalNextRaceIndex
}: ScheduleViewProps) {
  if (meetings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-f1-text-secondary text-sm mb-1">
            No race schedule available
          </div>
        </div>
      </div>
    );
  }

  const displayMeetings = meetings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 flex flex-col justify-center space-y-1.5">
        {displayMeetings.map((meeting, index) => {
          const actualIndex = startIndex + index;
          const isPast = isPastRace(meeting.date_start);
          const isNext = actualIndex === globalNextRaceIndex;

          return (
            <div
              key={meeting.meeting_key}
              className={`
                rounded p-2 border transition-all
                ${isPast
                  ? 'bg-f1-bg-secondary/50 border-f1-border/50 opacity-50'
                  : isNext
                    ? 'bg-f1-bg-tertiary border-f1-accent-red'
                    : 'bg-f1-bg-secondary border-f1-border'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {/* Race number */}
                <div className={`text-base font-bold w-6 text-right ${isPast ? 'text-f1-text-muted' : 'text-f1-text-primary'}`}>
                  {actualIndex + 1}.
                </div>

                {/* Color indicator */}
                <div
                  className={`w-1 h-8 rounded-full flex-shrink-0 ${
                    isNext ? 'bg-f1-accent-red' : isPast ? 'bg-f1-text-muted' : 'bg-f1-border'
                  }`}
                />

                {/* Race info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold truncate ${isPast ? 'text-f1-text-muted' : 'text-f1-text-primary'}`}>
                    {getGrandPrixName(meeting.meeting_name)}
                  </div>
                  <div className={`text-xs ${isPast ? 'text-f1-text-muted' : 'text-f1-text-secondary'}`}>
                    {meeting.location || meeting.circuit_short_name}, {meeting.country_name}
                  </div>
                </div>

                {/* Date - vertically centered */}
                <div className={`text-xs font-mono flex-shrink-0 ${isPast ? 'text-f1-text-muted' : isNext ? 'text-f1-accent-red' : 'text-f1-text-secondary'}`}>
                  {formatDateRange(meeting.date_start)}
                </div>

                {/* Next badge */}
                {isNext && (
                  <div className="bg-f1-accent-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                    NEXT
                  </div>
                )}

                {/* Country flag */}
                <div className={`text-lg flex-shrink-0 ${isPast ? 'opacity-50' : ''}`}>
                  {countryCodeToFlag(meeting.country_code)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to calculate how many schedule pages are needed
export function getSchedulePageCount(meetingsCount: number, itemsPerPage: number = 10): number {
  return Math.ceil(meetingsCount / itemsPerPage);
}

// Helper to find the next race index
export function findNextRaceIndex(meetings: Meeting[]): number {
  const now = new Date();
  return meetings.findIndex(m => new Date(m.date_start) > now);
}

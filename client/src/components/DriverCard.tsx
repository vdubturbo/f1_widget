import { useState, useEffect } from 'react';
import type { DriverCardData, EnrichedDriverStanding, Meeting, Driver } from '../types/f1';
import { TEAM_COLORS } from '../types/f1';
import { getDriverCardData } from '../services/openf1';

interface DriverCardProps {
  driverNumber: number;
  driver: Driver;
  standings: EnrichedDriverStanding[];
  meetings: Meeting[];
}

function getTeamColor(teamName?: string, teamColour?: string): string {
  if (teamColour) {
    return `#${teamColour}`;
  }
  if (teamName && TEAM_COLORS[teamName]) {
    return TEAM_COLORS[teamName];
  }
  return '#666666';
}

function getCountryFlag(countryCode: string): string {
  // Convert country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function PositionBadge({ position, isSprint }: { position: number | null; isSprint?: boolean }) {
  if (position === null) {
    return (
      <div className="w-7 h-7 flex items-center justify-center rounded bg-f1-bg-tertiary text-f1-text-muted text-xs font-bold">
        DNF
      </div>
    );
  }

  let bgColor = 'bg-f1-bg-tertiary';
  let textColor = 'text-f1-text-secondary';

  if (position === 1) {
    bgColor = 'bg-yellow-500';
    textColor = 'text-black';
  } else if (position === 2) {
    bgColor = 'bg-gray-300';
    textColor = 'text-black';
  } else if (position === 3) {
    bgColor = 'bg-amber-600';
    textColor = 'text-white';
  } else if (position <= 10) {
    bgColor = 'bg-f1-bg-secondary';
    textColor = 'text-f1-text-primary';
  }

  return (
    <div
      className={`w-7 h-7 flex items-center justify-center rounded ${bgColor} ${textColor} text-xs font-bold ${isSprint ? 'opacity-70' : ''}`}
      title={isSprint ? 'Sprint Race' : 'Main Race'}
    >
      {position}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-f1-text-primary">{value}</div>
      <div className="text-[10px] text-f1-text-muted uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function DriverCard({ driverNumber, driver, standings, meetings }: DriverCardProps) {
  const [cardData, setCardData] = useState<DriverCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const data = await getDriverCardData(driverNumber, driver, standings, meetings);
        if (!cancelled) {
          setCardData(data);
        }
      } catch (e) {
        console.error('Failed to fetch driver card data:', e);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [driverNumber, driver, standings, meetings]);

  const teamColor = getTeamColor(driver.team_name, driver.team_colour);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-f1-accent-red border-t-transparent mb-2" />
          <div className="text-f1-text-secondary text-sm">Loading driver data...</div>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-f1-text-secondary text-sm">Failed to load driver data</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header: Headshot + Summary Info */}
      <div className="flex gap-4 mb-4">
        {/* Headshot */}
        <div className="relative flex-shrink-0">
          <div
            className="w-24 h-24 rounded-lg overflow-hidden border-2"
            style={{ borderColor: teamColor }}
          >
            {cardData.headshotUrl ? (
              <img
                src={cardData.headshotUrl}
                alt={cardData.fullName}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-f1-bg-tertiary flex items-center justify-center text-f1-text-muted">
                {cardData.nameAcronym}
              </div>
            )}
          </div>
          {/* Car number badge */}
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: teamColor }}
          >
            {cardData.driverNumber}
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-f1-text-primary truncate">
            {cardData.fullName}
          </h2>
          <div className="text-sm text-f1-text-secondary mb-2" style={{ color: teamColor }}>
            {cardData.teamName}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {cardData.nationality && (
              <div className="flex items-center gap-1">
                <span className="text-f1-text-muted">Nationality:</span>
                <span className="text-f1-text-primary">
                  {getCountryFlag(cardData.countryCode)} {cardData.nationality}
                </span>
              </div>
            )}
            {cardData.age && (
              <div className="flex items-center gap-1">
                <span className="text-f1-text-muted">Age:</span>
                <span className="text-f1-text-primary">{cardData.age}</span>
              </div>
            )}
            {cardData.birthplace && (
              <div className="flex items-center gap-1 col-span-2 truncate">
                <span className="text-f1-text-muted">From:</span>
                <span className="text-f1-text-primary truncate">{cardData.birthplace}</span>
              </div>
            )}
            {cardData.engineer && (
              <div className="flex items-center gap-1 col-span-2 truncate">
                <span className="text-f1-text-muted">Engineer:</span>
                <span className="text-f1-text-primary truncate">{cardData.engineer}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Season Stats Row */}
      <div
        className="rounded-lg p-3 mb-4"
        style={{ backgroundColor: `${teamColor}20`, borderLeft: `3px solid ${teamColor}` }}
      >
        <div className="grid grid-cols-5 gap-2">
          <StatBox label="Position" value={`P${cardData.championshipPosition}`} />
          <StatBox label="Points" value={cardData.championshipPoints} />
          <StatBox label="Wins" value={cardData.wins} />
          <StatBox label="Podiums" value={cardData.podiums} />
          <StatBox label="DNFs" value={cardData.dnfs} />
        </div>
      </div>

      {/* Recent Form */}
      <div className="mb-4">
        <div className="text-xs text-f1-text-muted uppercase tracking-wide mb-2">Recent Form</div>
        <div className="flex gap-2">
          {cardData.recentResults.length > 0 ? (
            cardData.recentResults.map((result, idx) => (
              <div key={`${result.meetingKey}-${idx}`} className="flex flex-col items-center">
                <PositionBadge position={result.position} isSprint={result.isSprintResult} />
                <div className="text-[9px] text-f1-text-muted mt-1 truncate max-w-[40px]" title={result.meetingName}>
                  {result.meetingName.split(' ')[0].slice(0, 3)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-f1-text-muted text-sm">No recent results</div>
          )}
        </div>
      </div>

      {/* Teammate Comparison */}
      {cardData.teammate && (
        <div className="flex-1">
          <div className="text-xs text-f1-text-muted uppercase tracking-wide mb-2">
            vs Teammate
          </div>
          <div className="bg-f1-bg-secondary rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-f1-text-primary">
                {cardData.nameAcronym}
              </span>
              <span className="text-xs text-f1-text-muted">Points</span>
              <span className="text-sm font-semibold text-f1-text-primary">
                {cardData.teammate.name.split(' ').pop()?.slice(0, 3).toUpperCase()}
              </span>
            </div>

            {/* Points comparison bar */}
            <div className="relative h-6 bg-f1-bg-tertiary rounded-full overflow-hidden">
              {(() => {
                const total = cardData.championshipPoints + cardData.teammate.points;
                const driverPercent = total > 0 ? (cardData.championshipPoints / total) * 100 : 50;
                return (
                  <>
                    <div
                      className="absolute left-0 top-0 h-full transition-all duration-500"
                      style={{ width: `${driverPercent}%`, backgroundColor: teamColor }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold">
                      <span className="text-white drop-shadow">{cardData.championshipPoints}</span>
                      <span className="text-f1-text-primary">{cardData.teammate.points}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

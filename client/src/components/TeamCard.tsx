import { useState, useEffect } from 'react';
import type { TeamCardData, ConstructorStanding, EnrichedDriverStanding, Meeting } from '../types/f1';
import { TEAM_COLORS } from '../types/f1';
import { getTeamCardData } from '../services/openf1';

interface TeamCardProps {
  teamName: string;
  constructorStanding: ConstructorStanding;
  driverStandings: EnrichedDriverStanding[];
  meetings: Meeting[];
}

function getTeamColor(teamName?: string, teamColour?: string): string {
  if (teamColour && !teamColour.startsWith('#')) {
    return `#${teamColour}`;
  }
  if (teamColour) return teamColour;
  if (teamName && TEAM_COLORS[teamName]) {
    return TEAM_COLORS[teamName];
  }
  return '#666666';
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-f1-text-primary">{value}</div>
      <div className="text-[10px] text-f1-text-muted uppercase tracking-wide">{label}</div>
    </div>
  );
}

function PositionBadge({ position }: { position: number | null }) {
  if (position === null) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-f1-bg-tertiary text-f1-text-muted text-xs font-bold">
        -
      </span>
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
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${bgColor} ${textColor} text-xs font-bold`}>
      {position}
    </span>
  );
}

export function TeamCard({ teamName, constructorStanding, driverStandings, meetings }: TeamCardProps) {
  const [cardData, setCardData] = useState<TeamCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const data = await getTeamCardData(teamName, constructorStanding, driverStandings, meetings);
        if (!cancelled) {
          setCardData(data);
        }
      } catch (e) {
        console.error('Failed to fetch team card data:', e);
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
  }, [teamName, constructorStanding, driverStandings, meetings]);

  const teamColor = getTeamColor(teamName, constructorStanding.team_colour);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-f1-accent-red border-t-transparent mb-2" />
          <div className="text-f1-text-secondary text-sm">Loading team data...</div>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-f1-text-secondary text-sm">Failed to load team data</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header: Team Info */}
      <div className="mb-4">
        <div className="flex items-start gap-4">
          {/* Team color block */}
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: teamColor }}
          >
            P{cardData.championshipPosition}
          </div>

          {/* Team info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-f1-text-primary truncate">
              {cardData.fullName || cardData.teamName}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
              {cardData.base && (
                <div className="flex items-center gap-1">
                  <span className="text-f1-text-muted">Base:</span>
                  <span className="text-f1-text-primary truncate">{cardData.base}</span>
                </div>
              )}
              {cardData.powerUnit && (
                <div className="flex items-center gap-1">
                  <span className="text-f1-text-muted">PU:</span>
                  <span className="text-f1-text-primary">{cardData.powerUnit}</span>
                </div>
              )}
              {cardData.teamPrincipal && (
                <div className="flex items-center gap-1 col-span-2">
                  <span className="text-f1-text-muted">Principal:</span>
                  <span className="text-f1-text-primary truncate">{cardData.teamPrincipal}</span>
                </div>
              )}
              {cardData.championships !== undefined && cardData.championships > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-f1-text-muted">Titles:</span>
                  <span className="text-f1-text-primary">{cardData.championships}</span>
                </div>
              )}
            </div>
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
          <StatBox label="1-2s" value={cardData.oneTwo} />
        </div>
      </div>

      {/* Drivers */}
      <div className="mb-4">
        <div className="text-xs text-f1-text-muted uppercase tracking-wide mb-2">Drivers</div>
        <div className="grid grid-cols-2 gap-2">
          {cardData.drivers.map((driver) => (
            <div
              key={driver.driverNumber}
              className="bg-f1-bg-secondary rounded-lg p-3 flex items-center gap-3"
            >
              {driver.headshotUrl ? (
                <img
                  src={driver.headshotUrl}
                  alt={driver.name}
                  className="w-10 h-10 rounded-full object-cover object-top"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-f1-bg-tertiary flex items-center justify-center text-f1-text-muted text-xs">
                  {driver.nameAcronym}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-f1-text-primary truncate">
                  {driver.name.split(' ').pop()}
                </div>
                <div className="text-xs text-f1-text-secondary">
                  {driver.points} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Form */}
      <div className="flex-1">
        <div className="text-xs text-f1-text-muted uppercase tracking-wide mb-2">Recent Form</div>
        <div className="space-y-1.5">
          {cardData.recentResults.length > 0 ? (
            cardData.recentResults.slice(0, 4).map((result) => (
              <div
                key={result.meetingKey}
                className="flex items-center gap-2 bg-f1-bg-secondary rounded p-2"
              >
                <div className="flex-1 text-xs text-f1-text-primary truncate" title={result.meetingName}>
                  {result.meetingName.replace('Grand Prix', 'GP')}
                </div>
                <div className="flex items-center gap-1">
                  <PositionBadge position={result.driver1Position} />
                  <PositionBadge position={result.driver2Position} />
                </div>
                <div className="text-xs font-mono text-f1-text-secondary w-8 text-right">
                  +{result.totalPoints}
                </div>
              </div>
            ))
          ) : (
            <div className="text-f1-text-muted text-sm">No recent results</div>
          )}
        </div>
      </div>
    </div>
  );
}

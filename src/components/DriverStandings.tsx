import type { EnrichedDriverStanding } from '../types/f1';
import { TEAM_COLORS } from '../types/f1';

interface DriverStandingsProps {
  standings: EnrichedDriverStanding[];
  startIndex?: number;
  itemsPerPage?: number;
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

export function DriverStandings({
  standings,
  startIndex = 0,
  itemsPerPage = 10
}: DriverStandingsProps) {
  if (standings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-f1-text-secondary text-sm mb-1">
            Driver standings not available
          </div>
          <div className="text-f1-text-muted text-xs">
            Check back when the season begins
          </div>
        </div>
      </div>
    );
  }

  const maxPoints = standings[0]?.points_current || 1;
  const displayStandings = standings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 flex flex-col justify-center space-y-1.5">
        {displayStandings.map((driver) => {
          const teamColor = getTeamColor(driver.team_name, driver.team_colour);
          const barWidth = (driver.points_current / maxPoints) * 100;

          return (
            <div
              key={driver.driver_number}
              className="bg-f1-bg-secondary rounded p-2 border border-f1-border"
            >
              <div className="flex items-center gap-2">
                {/* Position */}
                <div className="text-base font-bold text-f1-text-primary w-6 text-right">
                  {driver.position_current}.
                </div>

                {/* Team color indicator */}
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teamColor }}
                />

                {/* Driver info with points bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-f1-text-primary truncate">
                      {driver.full_name || driver.broadcast_name || `#${driver.driver_number}`}
                    </span>
                    <span className="text-sm font-mono font-semibold text-f1-text-primary ml-2 flex-shrink-0">
                      {driver.points_current}
                    </span>
                  </div>

                  {/* Points bar */}
                  <div className="h-1 bg-f1-bg-tertiary rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: teamColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to calculate how many driver pages are needed
export function getDriverPageCount(standingsCount: number, itemsPerPage: number = 10): number {
  return Math.ceil(standingsCount / itemsPerPage);
}

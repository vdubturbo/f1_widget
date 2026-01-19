import type { ConstructorStanding } from '../types/f1';
import { TEAM_COLORS } from '../types/f1';

interface ConstructorStandingsProps {
  standings: ConstructorStanding[];
  startIndex?: number;
  itemsPerPage?: number;
}

function getTeamColor(teamName: string, teamColour?: string): string {
  if (teamColour && !teamColour.startsWith('#')) {
    return `#${teamColour}`;
  }
  if (teamColour) {
    return teamColour;
  }
  return TEAM_COLORS[teamName] || '#666666';
}

export function ConstructorStandings({
  standings,
  startIndex = 0,
  itemsPerPage = 10
}: ConstructorStandingsProps) {
  if (standings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-f1-text-secondary text-sm mb-1">
            Constructor standings not available
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
      <div className="flex-1 flex flex-col justify-center space-y-2">
        {displayStandings.map((team) => {
          const teamColor = getTeamColor(team.team_name, team.team_colour);
          const barWidth = (team.points_current / maxPoints) * 100;

          return (
            <div
              key={team.team_name}
              className="bg-f1-bg-secondary rounded p-2.5 border border-f1-border"
            >
              <div className="flex items-center gap-2">
                {/* Position */}
                <div className="text-lg font-bold text-f1-text-primary w-7 text-right">
                  {team.position_current}.
                </div>

                {/* Team color indicator */}
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teamColor }}
                />

                {/* Team info with points bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-f1-text-primary truncate">
                      {team.team_name}
                    </span>
                    <span className="text-sm font-mono font-semibold text-f1-text-primary ml-2 flex-shrink-0">
                      {team.points_current} <span className="text-f1-text-secondary text-xs">pts</span>
                    </span>
                  </div>

                  {/* Points bar */}
                  <div className="h-1.5 bg-f1-bg-tertiary rounded-full overflow-hidden">
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

// Helper to calculate how many constructor pages are needed
export function getConstructorPageCount(standingsCount: number, itemsPerPage: number = 10): number {
  return Math.ceil(standingsCount / itemsPerPage);
}

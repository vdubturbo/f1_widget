import { useMemo, useState } from 'react';
import { useOpenF1Data } from '../hooks/useOpenF1';
import { useRotation } from '../hooks/useRotation';
import { useConfig } from '../hooks/useConfig';
import { ViewTransition } from './ViewTransition';
import { ScheduleView, getSchedulePageCount, findNextRaceIndex } from './ScheduleView';
import { DriverStandings, getDriverPageCount } from './DriverStandings';
import { ConstructorStandings, getConstructorPageCount } from './ConstructorStandings';
import { RaceDetailView, isSprintWeekend } from './RaceDetailView';
import { DriverCard } from './DriverCard';
import { TeamCard } from './TeamCard';
import { UserConfigMenu } from './UserConfigMenu';
import type { Meeting, Driver } from '../types/f1';
import type { CardId } from '../types/config';

// Find the previous race (most recent completed race)
function findPreviousRace(meetings: Meeting[]): Meeting | null {
  const now = new Date();
  // Find the last meeting that has already started
  for (let i = meetings.length - 1; i >= 0; i--) {
    const raceEnd = new Date(meetings[i].date_start);
    raceEnd.setDate(raceEnd.getDate() + 2); // Race day is typically Sunday
    if (raceEnd < now) {
      return meetings[i];
    }
  }
  return null;
}

// Find the next race (upcoming race)
function findNextRace(meetings: Meeting[]): Meeting | null {
  const now = new Date();
  for (const meeting of meetings) {
    const raceStart = new Date(meeting.date_start);
    if (raceStart > now) {
      return meeting;
    }
  }
  return null;
}

interface ViewItem {
  cardId: CardId;
  pageIndex: number;
}

export function Dashboard() {
  const { data, loading, error } = useOpenF1Data();
  const { adminConfig, userConfig, loading: configLoading } = useConfig();
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);

  // Get items per page from config
  const itemsPerPage = adminConfig?.itemsPerPage ?? {
    schedule: 10,
    drivers: 11,
    constructors: 11,
  };

  // Get the previous and next race meetings
  const { previousRace, nextRace, nextRaceIndex } = useMemo(() => {
    if (!data?.meetings) return { previousRace: null, nextRace: null, nextRaceIndex: -1 };
    const nextIdx = findNextRaceIndex(data.meetings);
    return {
      previousRace: findPreviousRace(data.meetings),
      nextRace: findNextRace(data.meetings),
      nextRaceIndex: nextIdx,
    };
  }, [data?.meetings]);

  // Calculate page counts for each card type
  const pageCounts = useMemo(() => {
    if (!data) return { schedule: 0, drivers: 0, constructors: 0, previousRace: 0, nextRace: 0, driverCard: 0, teamCard: 0 };

    return {
      schedule: getSchedulePageCount(data.meetings.length, itemsPerPage.schedule),
      drivers: data.driverStandings.length > 0
        ? getDriverPageCount(data.driverStandings.length, itemsPerPage.drivers)
        : 0,
      constructors: data.constructorStandings.length > 0
        ? getConstructorPageCount(data.constructorStandings.length, itemsPerPage.constructors)
        : 0,
      previousRace: previousRace ? 1 : 0,
      nextRace: nextRace ? 1 : 0,
      driverCard: data.driverStandings.length > 0 ? 1 : 0,
      teamCard: data.constructorStandings.length > 0 ? 1 : 0,
    };
  }, [data, previousRace, nextRace, itemsPerPage]);

  // Build view sequence from config
  const views: ViewItem[] = useMemo(() => {
    const result: ViewItem[] = [];

    // Use card order from user config, filtered by selected cards
    const orderedCards = userConfig.cardOrder.filter(id =>
      userConfig.selectedCards.includes(id)
    );

    for (const cardId of orderedCards) {
      const pageCount = pageCounts[cardId] || 0;
      for (let i = 0; i < pageCount; i++) {
        result.push({ cardId, pageIndex: i });
      }
    }

    return result;
  }, [userConfig.cardOrder, userConfig.selectedCards, pageCounts]);

  const totalViews = views.length || 1;
  const { currentIndex } = useRotation(totalViews, userConfig.interval);

  // Show settings button?
  const showSettingsButton = adminConfig?.features.showUserConfigMenu ?? true;

  if (loading || configLoading) {
    return (
      <div className="widget-container bg-f1-bg-primary flex items-center justify-center rounded-xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-f1-accent-red border-t-transparent mb-2" />
          <div className="text-f1-text-secondary text-sm">Loading F1 data...</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="widget-container bg-f1-bg-primary flex items-center justify-center rounded-xl">
        <div className="text-center p-4">
          <div className="text-f1-accent-red text-4xl mb-2">!</div>
          <div className="text-f1-text-primary text-base mb-1">Failed to load data</div>
          <div className="text-f1-text-secondary text-xs">{error.message}</div>
        </div>
      </div>
    );
  }

  // Render the current view based on the view sequence
  const renderCurrentView = () => {
    if (views.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-f1-text-secondary">
          No cards selected
        </div>
      );
    }

    const currentView = views[currentIndex];
    if (!currentView) return null;

    const { cardId, pageIndex } = currentView;

    switch (cardId) {
      case 'schedule':
        return (
          <ScheduleView
            meetings={data?.meetings || []}
            startIndex={pageIndex * itemsPerPage.schedule}
            itemsPerPage={itemsPerPage.schedule}
            globalNextRaceIndex={nextRaceIndex}
          />
        );
      case 'drivers':
        return (
          <DriverStandings
            standings={data?.driverStandings || []}
            startIndex={pageIndex * itemsPerPage.drivers}
            itemsPerPage={itemsPerPage.drivers}
          />
        );
      case 'constructors':
        return (
          <ConstructorStandings
            standings={data?.constructorStandings || []}
            startIndex={pageIndex * itemsPerPage.constructors}
            itemsPerPage={itemsPerPage.constructors}
          />
        );
      case 'previousRace':
        return previousRace ? (
          <RaceDetailView
            meeting={previousRace}
            isSprintWeekend={isSprintWeekend(previousRace.meeting_name)}
            isPreviousRace={true}
          />
        ) : null;
      case 'nextRace':
        return nextRace ? (
          <RaceDetailView
            meeting={nextRace}
            isSprintWeekend={isSprintWeekend(nextRace.meeting_name)}
            isPreviousRace={false}
          />
        ) : null;
      case 'driverCard': {
        // Use favorite driver from config, or fall back to first driver
        const favoriteNumber = userConfig.favoriteDriverNumber;
        const standing = favoriteNumber
          ? data?.driverStandings.find(d => d.driver_number === favoriteNumber)
          : data?.driverStandings[0];
        if (!standing) return null;

        // Create a Driver object from the enriched standing
        const driverObj: Driver = {
          driver_number: standing.driver_number,
          broadcast_name: standing.broadcast_name || '',
          full_name: standing.full_name || '',
          first_name: standing.first_name || '',
          last_name: standing.last_name || '',
          name_acronym: standing.name_acronym || '',
          team_name: standing.team_name || '',
          team_colour: standing.team_colour || '',
          country_code: standing.country_code || '',
          headshot_url: standing.headshot_url || '',
        };

        return (
          <DriverCard
            driverNumber={standing.driver_number}
            driver={driverObj}
            standings={data?.driverStandings || []}
            meetings={data?.meetings || []}
          />
        );
      }
      case 'teamCard': {
        // Use favorite team from config, or fall back to first team
        const favoriteTeamName = userConfig.favoriteTeam;
        const constructorStanding = favoriteTeamName
          ? data?.constructorStandings.find(c => c.team_name === favoriteTeamName)
          : data?.constructorStandings[0];
        if (!constructorStanding) return null;

        return (
          <TeamCard
            teamName={constructorStanding.team_name}
            constructorStanding={constructorStanding}
            driverStandings={data?.driverStandings || []}
            meetings={data?.meetings || []}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="widget-container bg-f1-bg-primary flex flex-col overflow-hidden rounded-xl">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <ViewTransition viewKey={String(currentIndex)}>
          {renderCurrentView()}
        </ViewTransition>
      </div>

      {/* Bottom bar: indicator dots + settings button */}
      <div className="flex items-center justify-center pb-3 px-3">
        {/* Spacer for balance */}
        <div className="w-8" />

        {/* View indicator dots */}
        <div className="flex-1 flex justify-center gap-1.5">
          {Array.from({ length: totalViews }).map((_, index) => (
            <div
              key={index}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${index === currentIndex
                  ? 'bg-f1-accent-red w-4'
                  : 'bg-f1-border w-1.5'
                }
              `}
            />
          ))}
        </div>

        {/* Settings button */}
        {showSettingsButton ? (
          <button
            onClick={() => setIsConfigMenuOpen(true)}
            className="w-8 h-8 flex items-center justify-center text-f1-text-muted hover:text-f1-text-primary transition-colors"
            aria-label="Open settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* User config menu */}
      <UserConfigMenu
        isOpen={isConfigMenuOpen}
        onClose={() => setIsConfigMenuOpen(false)}
        drivers={data?.driverStandings || []}
        teams={data?.constructorStandings || []}
      />
    </div>
  );
}

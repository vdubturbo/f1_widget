import { useMemo } from 'react';
import { useOpenF1Data } from '../hooks/useOpenF1';
import { useRotation } from '../hooks/useRotation';
import { ViewTransition } from './ViewTransition';
import { ScheduleView, getSchedulePageCount, findNextRaceIndex } from './ScheduleView';
import { DriverStandings, getDriverPageCount } from './DriverStandings';
import { ConstructorStandings, getConstructorPageCount } from './ConstructorStandings';
import { RaceDetailView, isSprintWeekend } from './RaceDetailView';
import type { Meeting } from '../types/f1';

const SCHEDULE_PER_PAGE = 10;
const DRIVERS_PER_PAGE = 11;
const CONSTRUCTORS_PER_PAGE = 11;

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

export function Dashboard() {
  const { data, loading, error } = useOpenF1Data();

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

  // Calculate pagination
  // Order: schedule -> drivers -> constructors -> previous race -> next race
  const pagination = useMemo(() => {
    if (!data) return {
      schedulePages: 0,
      driverPages: 0,
      constructorPages: 0,
      previousRacePages: 0,
      nextRacePages: 0,
      totalViews: 1
    };

    const schedulePages = getSchedulePageCount(data.meetings.length, SCHEDULE_PER_PAGE);
    const driverPages = data.driverStandings.length > 0
      ? getDriverPageCount(data.driverStandings.length, DRIVERS_PER_PAGE)
      : 0;
    const constructorPages = data.constructorStandings.length > 0
      ? getConstructorPageCount(data.constructorStandings.length, CONSTRUCTORS_PER_PAGE)
      : 0;
    const previousRacePages = previousRace ? 1 : 0;
    const nextRacePages = nextRace ? 1 : 0;

    return {
      schedulePages,
      driverPages,
      constructorPages,
      previousRacePages,
      nextRacePages,
      totalViews: schedulePages + driverPages + constructorPages + previousRacePages + nextRacePages,
    };
  }, [data, previousRace, nextRace]);

  const { currentIndex, totalViews } = useRotation(pagination.totalViews, 10000);

  if (loading) {
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

  // Determine which view to show based on currentIndex
  // Order: schedule -> drivers -> constructors -> previous race -> next race
  const renderCurrentView = () => {
    const { schedulePages, driverPages, constructorPages, previousRacePages } = pagination;
    let viewIndex = currentIndex;

    // Schedule pages (first)
    if (viewIndex < schedulePages) {
      return (
        <ScheduleView
          meetings={data?.meetings || []}
          startIndex={viewIndex * SCHEDULE_PER_PAGE}
          itemsPerPage={SCHEDULE_PER_PAGE}
          globalNextRaceIndex={nextRaceIndex}
        />
      );
    }
    viewIndex -= schedulePages;

    // Driver pages
    if (viewIndex < driverPages) {
      return (
        <DriverStandings
          standings={data?.driverStandings || []}
          startIndex={viewIndex * DRIVERS_PER_PAGE}
          itemsPerPage={DRIVERS_PER_PAGE}
        />
      );
    }
    viewIndex -= driverPages;

    // Constructor pages
    if (viewIndex < constructorPages) {
      return (
        <ConstructorStandings
          standings={data?.constructorStandings || []}
          startIndex={viewIndex * CONSTRUCTORS_PER_PAGE}
          itemsPerPage={CONSTRUCTORS_PER_PAGE}
        />
      );
    }
    viewIndex -= constructorPages;

    // Previous race results
    if (previousRacePages > 0 && viewIndex < previousRacePages) {
      return (
        <RaceDetailView
          meeting={previousRace!}
          isSprintWeekend={isSprintWeekend(previousRace!.meeting_name)}
          isPreviousRace={true}
        />
      );
    }
    viewIndex -= previousRacePages;

    // Next race preview (last)
    return (
      <RaceDetailView
        meeting={nextRace!}
        isSprintWeekend={isSprintWeekend(nextRace!.meeting_name)}
        isPreviousRace={false}
      />
    );
  };

  return (
    <div className="widget-container bg-f1-bg-primary flex flex-col overflow-hidden rounded-xl">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <ViewTransition viewKey={String(currentIndex)}>
          {renderCurrentView()}
        </ViewTransition>
      </div>

      {/* View indicator dots */}
      <div className="flex justify-center gap-1.5 pb-3">
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
    </div>
  );
}

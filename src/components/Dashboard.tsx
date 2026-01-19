import { useMemo } from 'react';
import { useOpenF1Data } from '../hooks/useOpenF1';
import { useRotation } from '../hooks/useRotation';
import { ViewTransition } from './ViewTransition';
import { ScheduleView, getSchedulePageCount, findNextRaceIndex } from './ScheduleView';
import { DriverStandings, getDriverPageCount } from './DriverStandings';
import { ConstructorStandings, getConstructorPageCount } from './ConstructorStandings';

const SCHEDULE_PER_PAGE = 10;
const DRIVERS_PER_PAGE = 11;
const CONSTRUCTORS_PER_PAGE = 11;

export function Dashboard() {
  const { data, loading, error } = useOpenF1Data();

  // Calculate pagination
  const pagination = useMemo(() => {
    if (!data) return { schedulePages: 0, driverPages: 0, constructorPages: 0, totalViews: 1 };

    const schedulePages = getSchedulePageCount(data.meetings.length, SCHEDULE_PER_PAGE);
    const driverPages = data.driverStandings.length > 0
      ? getDriverPageCount(data.driverStandings.length, DRIVERS_PER_PAGE)
      : 0;
    const constructorPages = data.constructorStandings.length > 0
      ? getConstructorPageCount(data.constructorStandings.length, CONSTRUCTORS_PER_PAGE)
      : 0;

    return {
      schedulePages,
      driverPages,
      constructorPages,
      totalViews: schedulePages + driverPages + constructorPages,
    };
  }, [data]);

  const { currentIndex, totalViews } = useRotation(pagination.totalViews, 10000);

  // Calculate next race index for highlighting
  const nextRaceIndex = useMemo(() => {
    if (!data?.meetings) return -1;
    return findNextRaceIndex(data.meetings);
  }, [data?.meetings]);

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
  const renderCurrentView = () => {
    const { schedulePages, driverPages } = pagination;

    // Schedule pages
    if (currentIndex < schedulePages) {
      const pageIndex = currentIndex;
      return (
        <ScheduleView
          meetings={data?.meetings || []}
          startIndex={pageIndex * SCHEDULE_PER_PAGE}
          itemsPerPage={SCHEDULE_PER_PAGE}
          globalNextRaceIndex={nextRaceIndex}
        />
      );
    }

    // Driver pages
    const driverStartIndex = schedulePages;
    if (currentIndex < driverStartIndex + driverPages) {
      const pageIndex = currentIndex - driverStartIndex;
      return (
        <DriverStandings
          standings={data?.driverStandings || []}
          startIndex={pageIndex * DRIVERS_PER_PAGE}
          itemsPerPage={DRIVERS_PER_PAGE}
        />
      );
    }

    // Constructor pages
    const constructorStartIndex = driverStartIndex + driverPages;
    const pageIndex = currentIndex - constructorStartIndex;
    return (
      <ConstructorStandings
        standings={data?.constructorStandings || []}
        startIndex={pageIndex * CONSTRUCTORS_PER_PAGE}
        itemsPerPage={CONSTRUCTORS_PER_PAGE}
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

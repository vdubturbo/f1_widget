import { useState, useEffect, useCallback } from 'react';
import type { F1Data, EnrichedDriverStanding, ConstructorStanding } from '../types/f1';
import { TEAM_COLORS } from '../types/f1';
import {
  getMeetings,
  getDriverStandings,
  getConstructorStandings,
  getDrivers,
  getUniqueDrivers
} from '../services/openf1';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Helper to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper with exponential backoff
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs * Math.pow(2, i));
    }
  }
  throw new Error('Max retries reached');
}

export function useOpenF1Data() {
  const [data, setData] = useState<F1Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const currentYear = new Date().getFullYear();

      // Fetch meetings first - this should always work
      const meetings = await fetchWithRetry(() => getMeetings(currentYear));

      // Try to fetch standings data (may fail during offseason)
      let enrichedDriverStandings: EnrichedDriverStanding[] = [];
      let constructorStandings: ConstructorStanding[] = [];

      try {
        // Fetch sequentially with delays to avoid rate limiting
        await delay(300);
        const driverStandingsData = await fetchWithRetry(() => getDriverStandings());

        await delay(300);
        const constructorStandingsData = await fetchWithRetry(() => getConstructorStandings());

        await delay(300);
        const driversData = await fetchWithRetry(() => getDrivers());

        const uniqueDrivers = getUniqueDrivers(driversData);

        // Merge driver details with standings
        enrichedDriverStandings = driverStandingsData.map(standing => {
          const driverDetails = uniqueDrivers.find(d => d.driver_number === standing.driver_number);
          return {
            ...standing,
            ...driverDetails,
          };
        }).sort((a, b) => a.position_current - b.position_current);

        // Infer missing team names from driver data by matching points totals
        const teamPointsMap = new Map<string, number>();
        for (const driver of enrichedDriverStandings) {
          if (driver.team_name) {
            teamPointsMap.set(driver.team_name, (teamPointsMap.get(driver.team_name) || 0) + (driver.points_current || 0));
          }
        }

        // Enrich constructor standings with team colors and fill missing names
        constructorStandings = constructorStandingsData.map(standing => {
          let teamName = standing.team_name;
          if (!teamName) {
            // Find a team whose driver points sum matches this constructor's points
            for (const [name, points] of teamPointsMap.entries()) {
              if (points === standing.points_current && !constructorStandingsData.some(s => s.team_name === name)) {
                teamName = name;
                teamPointsMap.delete(name);
                break;
              }
            }
          }
          return {
            ...standing,
            team_name: teamName || `Team P${standing.position_current}`,
            team_colour: TEAM_COLORS[teamName || ''] || '#666666',
          };
        }).sort((a, b) => a.position_current - b.position_current);

      } catch (standingsError) {
        console.warn('Could not fetch standings data (may be offseason):', standingsError);
        // Continue with empty standings - will show placeholder message
      }

      setData({
        meetings: meetings.sort((a, b) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        ),
        driverStandings: enrichedDriverStandings,
        constructorStandings,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch F1 data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Refresh every 30 minutes
    const refreshInterval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

import type { Meeting, DriverStanding, ConstructorStanding, Driver, Session, Position, DriverRaceResult, DriverCardData, EnrichedDriverStanding, TeamCardData, TeamRaceResult } from '../types/f1';
import { getDriverProfile, calculateAge } from '../data/driverProfiles';
import { getTeamProfile } from '../data/teamProfiles';

const BASE_URL = 'https://api.openf1.org/v1';

export async function getMeetings(year: number): Promise<Meeting[]> {
  const response = await fetch(`${BASE_URL}/meetings?year=${year}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch meetings: ${response.statusText}`);
  }
  return response.json();
}

export async function getDriverStandings(): Promise<DriverStanding[]> {
  const response = await fetch(`${BASE_URL}/championship_drivers?session_key=latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch driver standings: ${response.statusText}`);
  }
  return response.json();
}

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
  const response = await fetch(`${BASE_URL}/championship_teams?session_key=latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch constructor standings: ${response.statusText}`);
  }
  return response.json();
}

export async function getDrivers(): Promise<Driver[]> {
  const response = await fetch(`${BASE_URL}/drivers?session_key=latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch drivers: ${response.statusText}`);
  }
  return response.json();
}

// Get unique drivers (API may return duplicates for different sessions)
export function getUniqueDrivers(drivers: Driver[]): Driver[] {
  const driverMap = new Map<number, Driver>();
  for (const driver of drivers) {
    if (!driverMap.has(driver.driver_number) || driver.headshot_url) {
      driverMap.set(driver.driver_number, driver);
    }
  }
  return Array.from(driverMap.values());
}

export async function getSessions(meetingKey: number): Promise<Session[]> {
  const response = await fetch(`${BASE_URL}/sessions?meeting_key=${meetingKey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }
  return response.json();
}

export async function getPositions(sessionKey: number): Promise<Position[]> {
  const response = await fetch(`${BASE_URL}/position?session_key=${sessionKey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch positions: ${response.statusText}`);
  }
  return response.json();
}

export async function getDriversBySession(sessionKey: number): Promise<Driver[]> {
  const response = await fetch(`${BASE_URL}/drivers?session_key=${sessionKey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch drivers: ${response.statusText}`);
  }
  return response.json();
}

// Points awarded for race positions (2025 regulations)
const POINTS_TABLE: Record<number, number> = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
};

const SPRINT_POINTS_TABLE: Record<number, number> = {
  1: 8, 2: 7, 3: 6, 4: 5, 5: 4,
  6: 3, 7: 2, 8: 1,
};

// Get final positions for a race session
export async function getRaceResults(sessionKey: number): Promise<Position[]> {
  const positions = await getPositions(sessionKey);
  // Get the latest position for each driver (final result)
  const finalPositions = new Map<number, Position>();
  for (const pos of positions) {
    const existing = finalPositions.get(pos.driver_number);
    if (!existing || new Date(pos.date) > new Date(existing.date)) {
      finalPositions.set(pos.driver_number, pos);
    }
  }
  return Array.from(finalPositions.values()).sort((a, b) => a.position - b.position);
}

// Get recent race results for a specific driver
export async function getDriverRecentResults(
  driverNumber: number,
  meetings: Meeting[],
  limit: number = 5
): Promise<DriverRaceResult[]> {
  const results: DriverRaceResult[] = [];
  const now = new Date();

  // Get completed meetings (most recent first)
  const completedMeetings = meetings
    .filter(m => new Date(m.date_start) < now)
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
    .slice(0, limit);

  for (const meeting of completedMeetings) {
    try {
      const sessions = await getSessions(meeting.meeting_key);
      const raceSessions = sessions.filter(s => s.session_type === 'Race');

      for (const session of raceSessions) {
        const positions = await getRaceResults(session.session_key);
        const driverPos = positions.find(p => p.driver_number === driverNumber);

        if (driverPos) {
          const isSprint = session.session_name.toLowerCase().includes('sprint');
          const pointsTable = isSprint ? SPRINT_POINTS_TABLE : POINTS_TABLE;

          results.push({
            meetingKey: meeting.meeting_key,
            meetingName: meeting.meeting_name,
            position: driverPos.position,
            points: pointsTable[driverPos.position] || 0,
            isSprintResult: isSprint,
          });
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch results for meeting ${meeting.meeting_key}:`, e);
    }
  }

  return results;
}

// Calculate season stats from race results
export function calculateSeasonStats(results: DriverRaceResult[]): {
  wins: number;
  podiums: number;
  dnfs: number;
} {
  const mainRaceResults = results.filter(r => !r.isSprintResult);
  return {
    wins: mainRaceResults.filter(r => r.position === 1).length,
    podiums: mainRaceResults.filter(r => r.position !== null && r.position <= 3).length,
    dnfs: mainRaceResults.filter(r => r.position === null).length,
  };
}

// Find teammate from standings
export function findTeammate(
  driverNumber: number,
  standings: EnrichedDriverStanding[]
): EnrichedDriverStanding | undefined {
  const driver = standings.find(d => d.driver_number === driverNumber);
  if (!driver?.team_name) return undefined;

  return standings.find(
    d => d.team_name === driver.team_name && d.driver_number !== driverNumber
  );
}

// Build complete driver card data
export async function getDriverCardData(
  driverNumber: number,
  driver: Driver,
  standings: EnrichedDriverStanding[],
  meetings: Meeting[]
): Promise<DriverCardData> {
  const standing = standings.find(s => s.driver_number === driverNumber);
  const profile = getDriverProfile(driverNumber);
  const teammate = findTeammate(driverNumber, standings);

  // Fetch recent results (this may take a moment)
  const recentResults = await getDriverRecentResults(driverNumber, meetings, 5);
  const stats = calculateSeasonStats(recentResults);

  return {
    // From OpenF1 API
    driverNumber: driver.driver_number,
    fullName: driver.full_name,
    firstName: driver.first_name,
    lastName: driver.last_name,
    nameAcronym: driver.name_acronym,
    teamName: driver.team_name,
    teamColour: driver.team_colour,
    countryCode: driver.country_code,
    headshotUrl: driver.headshot_url,
    // From standings
    championshipPosition: standing?.position_current ?? 0,
    championshipPoints: standing?.points_current ?? 0,
    // Calculated stats
    wins: stats.wins,
    podiums: stats.podiums,
    poles: 0, // Would need qualifying data
    fastestLaps: 0, // Would need lap data
    dnfs: stats.dnfs,
    // Recent form
    recentResults,
    // Teammate comparison
    teammate: teammate ? {
      name: teammate.full_name || teammate.broadcast_name || `#${teammate.driver_number}`,
      driverNumber: teammate.driver_number,
      points: teammate.points_current,
      qualifyingBattles: { wins: 0, losses: 0 }, // Would need qualifying data
      raceBattles: { wins: 0, losses: 0 }, // Would need to track head-to-head
    } : undefined,
    // From static profile
    age: profile ? calculateAge(profile.dateOfBirth) : undefined,
    birthplace: profile?.birthplace,
    nationality: profile?.nationality,
    manager: profile?.manager,
    physio: profile?.physio,
    engineer: profile?.engineer,
  };
}

// Get team drivers from standings
export function getTeamDrivers(
  teamName: string,
  standings: EnrichedDriverStanding[]
): EnrichedDriverStanding[] {
  return standings.filter(d => d.team_name === teamName);
}

// Get recent race results for a team
export async function getTeamRecentResults(
  teamName: string,
  standings: EnrichedDriverStanding[],
  meetings: Meeting[],
  limit: number = 5
): Promise<TeamRaceResult[]> {
  const results: TeamRaceResult[] = [];
  const now = new Date();
  const teamDrivers = getTeamDrivers(teamName, standings);

  if (teamDrivers.length === 0) return results;

  // Get completed meetings (most recent first)
  const completedMeetings = meetings
    .filter(m => new Date(m.date_start) < now)
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
    .slice(0, limit);

  for (const meeting of completedMeetings) {
    try {
      const sessions = await getSessions(meeting.meeting_key);
      const raceSessions = sessions.filter(s =>
        s.session_type === 'Race' && !s.session_name.toLowerCase().includes('sprint')
      );

      for (const session of raceSessions) {
        const positions = await getRaceResults(session.session_key);

        const driver1Pos = positions.find(p => p.driver_number === teamDrivers[0]?.driver_number);
        const driver2Pos = positions.find(p => p.driver_number === teamDrivers[1]?.driver_number);

        const points1 = driver1Pos ? (POINTS_TABLE[driver1Pos.position] || 0) : 0;
        const points2 = driver2Pos ? (POINTS_TABLE[driver2Pos.position] || 0) : 0;

        results.push({
          meetingKey: meeting.meeting_key,
          meetingName: meeting.meeting_name,
          driver1Position: driver1Pos?.position ?? null,
          driver2Position: driver2Pos?.position ?? null,
          totalPoints: points1 + points2,
        });
      }
    } catch (e) {
      console.warn(`Failed to fetch team results for meeting ${meeting.meeting_key}:`, e);
    }
  }

  return results;
}

// Calculate team season stats from results
export function calculateTeamSeasonStats(
  results: TeamRaceResult[]
): { wins: number; podiums: number; oneTwo: number } {
  let wins = 0;
  let podiums = 0;
  let oneTwo = 0;

  for (const result of results) {
    if (result.driver1Position === 1 || result.driver2Position === 1) wins++;
    if (result.driver1Position !== null && result.driver1Position <= 3) podiums++;
    if (result.driver2Position !== null && result.driver2Position <= 3) podiums++;
    if (
      (result.driver1Position === 1 && result.driver2Position === 2) ||
      (result.driver1Position === 2 && result.driver2Position === 1)
    ) {
      oneTwo++;
    }
  }

  return { wins, podiums, oneTwo };
}

// Build complete team card data
export async function getTeamCardData(
  teamName: string,
  constructorStanding: ConstructorStanding,
  driverStandings: EnrichedDriverStanding[],
  meetings: Meeting[]
): Promise<TeamCardData> {
  const profile = getTeamProfile(teamName);
  const teamDrivers = getTeamDrivers(teamName, driverStandings);

  // Fetch recent results
  const recentResults = await getTeamRecentResults(teamName, driverStandings, meetings, 5);
  const stats = calculateTeamSeasonStats(recentResults);

  return {
    // From OpenF1 API
    teamName,
    teamColour: constructorStanding.team_colour || '',
    // From standings
    championshipPosition: constructorStanding.position_current,
    championshipPoints: constructorStanding.points_current,
    // Calculated stats
    wins: stats.wins,
    podiums: stats.podiums,
    poles: 0, // Would need qualifying data
    oneTwo: stats.oneTwo,
    // Drivers
    drivers: teamDrivers.map(d => ({
      driverNumber: d.driver_number,
      name: d.full_name || d.broadcast_name || `#${d.driver_number}`,
      nameAcronym: d.name_acronym || '',
      points: d.points_current,
      headshotUrl: d.headshot_url,
    })),
    // Recent form
    recentResults,
    // From static profile
    fullName: profile?.fullName,
    base: profile?.base,
    teamPrincipal: profile?.teamPrincipal,
    technicalDirector: profile?.technicalDirector,
    powerUnit: profile?.powerUnit,
    firstEntry: profile?.firstEntry,
    championships: profile?.championships,
  };
}

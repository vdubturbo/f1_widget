import type { Meeting, DriverStanding, ConstructorStanding, Driver, Session, Position } from '../types/f1';

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

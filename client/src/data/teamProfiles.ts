// Static team profile data not available from OpenF1 API
// Keyed by team name for easy lookup

export interface TeamProfile {
  teamName: string;
  fullName: string;
  base: string;
  teamPrincipal: string;
  technicalDirector?: string;
  powerUnit: string;
  firstEntry: number;
  championships: number;
  logoUrl?: string;
}

export const TEAM_PROFILES: Record<string, TeamProfile> = {
  'Red Bull Racing': {
    teamName: 'Red Bull Racing',
    fullName: 'Oracle Red Bull Racing',
    base: 'Milton Keynes, UK',
    teamPrincipal: 'Christian Horner',
    technicalDirector: 'Pierre Waché',
    powerUnit: 'Honda RBPT',
    firstEntry: 2005,
    championships: 6,
  },
  'McLaren': {
    teamName: 'McLaren',
    fullName: 'McLaren Formula 1 Team',
    base: 'Woking, UK',
    teamPrincipal: 'Andrea Stella',
    technicalDirector: 'Peter Prodromou',
    powerUnit: 'Mercedes',
    firstEntry: 1966,
    championships: 8,
  },
  'Ferrari': {
    teamName: 'Ferrari',
    fullName: 'Scuderia Ferrari',
    base: 'Maranello, Italy',
    teamPrincipal: 'Frédéric Vasseur',
    technicalDirector: 'Loïc Serra',
    powerUnit: 'Ferrari',
    firstEntry: 1950,
    championships: 16,
  },
  'Mercedes': {
    teamName: 'Mercedes',
    fullName: 'Mercedes-AMG Petronas F1 Team',
    base: 'Brackley, UK',
    teamPrincipal: 'Toto Wolff',
    technicalDirector: 'James Allison',
    powerUnit: 'Mercedes',
    firstEntry: 2010,
    championships: 8,
  },
  'Aston Martin': {
    teamName: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    base: 'Silverstone, UK',
    teamPrincipal: 'Andy Cowell',
    technicalDirector: 'Dan Fallows',
    powerUnit: 'Mercedes',
    firstEntry: 2021,
    championships: 0,
  },
  'Alpine': {
    teamName: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    base: 'Enstone, UK',
    teamPrincipal: 'Oliver Oakes',
    powerUnit: 'Renault',
    firstEntry: 2021,
    championships: 0,
  },
  'Williams': {
    teamName: 'Williams',
    fullName: 'Williams Racing',
    base: 'Grove, UK',
    teamPrincipal: 'James Vowles',
    powerUnit: 'Mercedes',
    firstEntry: 1978,
    championships: 9,
  },
  'RB': {
    teamName: 'RB',
    fullName: 'Visa Cash App RB F1 Team',
    base: 'Faenza, Italy',
    teamPrincipal: 'Laurent Mekies',
    powerUnit: 'Honda RBPT',
    firstEntry: 2024,
    championships: 0,
  },
  'Racing Bulls': {
    teamName: 'Racing Bulls',
    fullName: 'Visa Cash App RB F1 Team',
    base: 'Faenza, Italy',
    teamPrincipal: 'Laurent Mekies',
    powerUnit: 'Honda RBPT',
    firstEntry: 2024,
    championships: 0,
  },
  'Kick Sauber': {
    teamName: 'Kick Sauber',
    fullName: 'Stake F1 Team Kick Sauber',
    base: 'Hinwil, Switzerland',
    teamPrincipal: 'Mattia Binotto',
    powerUnit: 'Ferrari',
    firstEntry: 1993,
    championships: 0,
  },
  'Sauber': {
    teamName: 'Sauber',
    fullName: 'Stake F1 Team Kick Sauber',
    base: 'Hinwil, Switzerland',
    teamPrincipal: 'Mattia Binotto',
    powerUnit: 'Ferrari',
    firstEntry: 1993,
    championships: 0,
  },
  'Haas F1 Team': {
    teamName: 'Haas F1 Team',
    fullName: 'MoneyGram Haas F1 Team',
    base: 'Kannapolis, USA',
    teamPrincipal: 'Ayao Komatsu',
    powerUnit: 'Ferrari',
    firstEntry: 2016,
    championships: 0,
  },
  'Haas': {
    teamName: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    base: 'Kannapolis, USA',
    teamPrincipal: 'Ayao Komatsu',
    powerUnit: 'Ferrari',
    firstEntry: 2016,
    championships: 0,
  },
  'Cadillac': {
    teamName: 'Cadillac',
    fullName: 'Cadillac F1 Team',
    base: 'USA',
    teamPrincipal: 'TBA',
    powerUnit: 'Ferrari',
    firstEntry: 2026,
    championships: 0,
  },
};

export function getTeamProfile(teamName: string): TeamProfile | undefined {
  return TEAM_PROFILES[teamName];
}

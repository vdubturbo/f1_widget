// Static driver profile data not available from OpenF1 API
// Keyed by driver number for easy lookup

export interface DriverProfile {
  driverNumber: number;
  dateOfBirth: string; // ISO date string
  birthplace: string;
  nationality: string;
  manager?: string;
  physio?: string;
  engineer?: string;
}

export const DRIVER_PROFILES: Record<number, DriverProfile> = {
  1: {
    driverNumber: 1,
    dateOfBirth: '1997-09-30',
    birthplace: 'Hasselt, Belgium',
    nationality: 'Dutch',
    manager: 'Raymond Vermeulen',
    engineer: 'Gianpiero Lambiase',
  },
  11: {
    driverNumber: 11,
    dateOfBirth: '1990-01-26',
    birthplace: 'Guadalajara, Mexico',
    nationality: 'Mexican',
    engineer: 'Hugh Bird',
  },
  44: {
    driverNumber: 44,
    dateOfBirth: '1985-01-07',
    birthplace: 'Stevenage, UK',
    nationality: 'British',
    physio: 'Angela Cullen',
    engineer: 'Riccardo Adami',
  },
  63: {
    driverNumber: 63,
    dateOfBirth: '1998-02-15',
    birthplace: "King's Lynn, UK",
    nationality: 'British',
    engineer: 'Marcus Dudley',
  },
  16: {
    driverNumber: 16,
    dateOfBirth: '1997-10-16',
    birthplace: 'Monte Carlo, Monaco',
    nationality: 'Monegasque',
    engineer: 'Bryan Bozzi',
  },
  55: {
    driverNumber: 55,
    dateOfBirth: '1994-09-01',
    birthplace: 'Madrid, Spain',
    nationality: 'Spanish',
    engineer: 'Riccardo Adami',
  },
  4: {
    driverNumber: 4,
    dateOfBirth: '1999-11-13',
    birthplace: 'Bristol, UK',
    nationality: 'British',
    manager: 'Mark Mayall',
    engineer: 'Tom Stallard',
  },
  81: {
    driverNumber: 81,
    dateOfBirth: '1999-05-11',
    birthplace: 'Palermo, Australia',
    nationality: 'Australian',
    engineer: 'Will Joseph',
  },
  14: {
    driverNumber: 14,
    dateOfBirth: '1981-07-29',
    birthplace: 'Oviedo, Spain',
    nationality: 'Spanish',
    engineer: 'Chris Cronin',
  },
  18: {
    driverNumber: 18,
    dateOfBirth: '1999-02-14',
    birthplace: 'Montreal, Canada',
    nationality: 'Canadian',
    engineer: 'Josh Sherritt',
  },
  23: {
    driverNumber: 23,
    dateOfBirth: '1996-02-07',
    birthplace: 'Bangkok, Thailand',
    nationality: 'Thai',
    engineer: 'Brad Sherwood',
  },
  10: {
    driverNumber: 10,
    dateOfBirth: '2000-04-01',
    birthplace: 'Rouen, France',
    nationality: 'French',
    engineer: 'Pierre Hamelin',
  },
  31: {
    driverNumber: 31,
    dateOfBirth: '1996-10-29',
    birthplace: 'Rouen, France',
    nationality: 'French',
    engineer: 'Gaetan Jego',
  },
  87: {
    driverNumber: 87,
    dateOfBirth: '1998-10-05',
    birthplace: 'Sydney, Australia',
    nationality: 'Australian',
  },
  22: {
    driverNumber: 22,
    dateOfBirth: '2002-05-03',
    birthplace: 'Fukuoka, Japan',
    nationality: 'Japanese',
    engineer: 'Mattia Spini',
  },
  6: {
    driverNumber: 6,
    dateOfBirth: '2006-01-12',
    birthplace: 'Roeselare, Belgium',
    nationality: 'Belgian',
  },
  27: {
    driverNumber: 27,
    dateOfBirth: '1994-08-28',
    birthplace: 'Oerlikon, Switzerland',
    nationality: 'Swiss',
  },
  5: {
    driverNumber: 5,
    dateOfBirth: '2005-11-11',
    birthplace: 'Campinas, Brazil',
    nationality: 'Brazilian',
  },
  30: {
    driverNumber: 30,
    dateOfBirth: '2002-10-28',
    birthplace: 'Louth, UK',
    nationality: 'British',
  },
  20: {
    driverNumber: 20,
    dateOfBirth: '1999-02-26',
    birthplace: 'Copenhagen, Denmark',
    nationality: 'Danish',
    engineer: 'Gary Gannon',
  },
  50: {
    driverNumber: 50,
    dateOfBirth: '2004-04-18',
    birthplace: 'Buenos Aires, Argentina',
    nationality: 'Argentine',
  },
};

export function getDriverProfile(driverNumber: number): DriverProfile | undefined {
  return DRIVER_PROFILES[driverNumber];
}

export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

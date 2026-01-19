// OpenF1 API Types

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  country_name: string;
  country_code: string;
  country_key: number;
  circuit_key: number;
  circuit_short_name: string;
  location: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

export interface DriverStanding {
  driver_number: number;
  position_current: number;
  points_current: number;
  meeting_key: number;
  session_key: number;
}

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  first_name: string;
  last_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  country_code: string;
  headshot_url: string;
}

export interface ConstructorStanding {
  team_name: string;
  position_current: number;
  points_current: number;
  meeting_key: number;
  session_key: number;
  team_colour?: string;
}

export interface EnrichedDriverStanding extends DriverStanding {
  broadcast_name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  name_acronym?: string;
  team_name?: string;
  team_colour?: string;
  country_code?: string;
  headshot_url?: string;
}

export interface F1Data {
  meetings: Meeting[];
  driverStandings: EnrichedDriverStanding[];
  constructorStandings: ConstructorStanding[];
}

export type View = 'schedule' | 'drivers' | 'constructors';

// Team colors mapping (fallback if API doesn't provide)
export const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  'McLaren': '#FF8000',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'RB': '#6692FF',
  'Racing Bulls': '#6692FF',
  'Visa Cash App RB': '#6692FF',
  'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
  'Haas': '#B6BABD',
  'Sauber': '#52E252',
  'AlphaTauri': '#6692FF',
  'Alfa Romeo': '#C92D4B',
  'Cadillac': '#D4AF37',
};

// Circuit images from GitHub (toUpperCase78/formula1-datasets)
const GITHUB_BASE = 'https://raw.githubusercontent.com/toUpperCase78/formula1-datasets/master/F1%20Race%20Tracks';

export const CIRCUIT_IMAGES: Record<string, string> = {
  // Country name mappings
  'Australia': `${GITHUB_BASE}/Australia_Albert_Park.png`,
  'Austria': `${GITHUB_BASE}/Austria_Red_Bull_Ring.png`,
  'Azerbaijan': `${GITHUB_BASE}/Azerbaijan_Baku.png`,
  'Bahrain': `${GITHUB_BASE}/Bahrain_Bahrain_International.png`,
  'Belgium': `${GITHUB_BASE}/Belgium_Spa_Francorchamps.png`,
  'Brazil': `${GITHUB_BASE}/Brazil_Jose_Carlos_Pace.png`,
  'Canada': `${GITHUB_BASE}/Canada_Gilles_Villeneuve.png`,
  'China': `${GITHUB_BASE}/China_Shanghai_International.png`,
  'Great Britain': `${GITHUB_BASE}/Great_Britain_Silverstone.png`,
  'United Kingdom': `${GITHUB_BASE}/Great_Britain_Silverstone.png`,
  'Hungary': `${GITHUB_BASE}/Hungary_Hungaroring.png`,
  'Italy': `${GITHUB_BASE}/Italy_Monza.png`,
  'Imola': `${GITHUB_BASE}/Italy_Imola_Internazionale_Enzo_Dino_Ferrari.png`,
  'Emilia-Romagna': `${GITHUB_BASE}/Italy_Imola_Internazionale_Enzo_Dino_Ferrari.png`,
  'Emilia Romagna': `${GITHUB_BASE}/Italy_Imola_Internazionale_Enzo_Dino_Ferrari.png`,
  'Japan': `${GITHUB_BASE}/Japan_Suzuka.png`,
  'Mexico': `${GITHUB_BASE}/Mexico_Hermanos_Rodriguez.png`,
  'Monaco': `${GITHUB_BASE}/Monaco_Circuit_de_Monaco.png`,
  'Netherlands': `${GITHUB_BASE}/Netherlands_Zandvoort.png`,
  'Qatar': `${GITHUB_BASE}/Qatar_Lusail_International.png`,
  'Saudi Arabia': `${GITHUB_BASE}/Saudi_Arabia_Jeddah_Corniche.png`,
  'Singapore': `${GITHUB_BASE}/Singapore_Marina_Bay_Street.png`,
  'Spain': `${GITHUB_BASE}/Spain_Barcelona_Catalunya.png`,
  'United Arab Emirates': `${GITHUB_BASE}/UAE_Abu_Dhabi_Yas_Marina.png`,
  'UAE': `${GITHUB_BASE}/UAE_Abu_Dhabi_Yas_Marina.png`,
  'Abu Dhabi': `${GITHUB_BASE}/UAE_Abu_Dhabi_Yas_Marina.png`,
  'United States': `${GITHUB_BASE}/USA_Circuit_of_the_Americas.png`,
  'USA': `${GITHUB_BASE}/USA_Circuit_of_the_Americas.png`,
  'Las Vegas': `${GITHUB_BASE}/USA_Las_Vegas_Strip.png`,
  'Miami': `${GITHUB_BASE}/USA_Miami_International.png`,
  // Circuit short name mappings
  'Albert Park': `${GITHUB_BASE}/Australia_Albert_Park.png`,
  'Spielberg': `${GITHUB_BASE}/Austria_Red_Bull_Ring.png`,
  'Red Bull Ring': `${GITHUB_BASE}/Austria_Red_Bull_Ring.png`,
  'Baku': `${GITHUB_BASE}/Azerbaijan_Baku.png`,
  'Sakhir': `${GITHUB_BASE}/Bahrain_Bahrain_International.png`,
  'Spa-Francorchamps': `${GITHUB_BASE}/Belgium_Spa_Francorchamps.png`,
  'Spa': `${GITHUB_BASE}/Belgium_Spa_Francorchamps.png`,
  'Interlagos': `${GITHUB_BASE}/Brazil_Jose_Carlos_Pace.png`,
  'São Paulo': `${GITHUB_BASE}/Brazil_Jose_Carlos_Pace.png`,
  'Montreal': `${GITHUB_BASE}/Canada_Gilles_Villeneuve.png`,
  'Shanghai': `${GITHUB_BASE}/China_Shanghai_International.png`,
  'Silverstone': `${GITHUB_BASE}/Great_Britain_Silverstone.png`,
  'Hungaroring': `${GITHUB_BASE}/Hungary_Hungaroring.png`,
  'Budapest': `${GITHUB_BASE}/Hungary_Hungaroring.png`,
  'Monza': `${GITHUB_BASE}/Italy_Monza.png`,
  'Suzuka': `${GITHUB_BASE}/Japan_Suzuka.png`,
  'Mexico City': `${GITHUB_BASE}/Mexico_Hermanos_Rodriguez.png`,
  'Zandvoort': `${GITHUB_BASE}/Netherlands_Zandvoort.png`,
  'Lusail': `${GITHUB_BASE}/Qatar_Lusail_International.png`,
  'Jeddah': `${GITHUB_BASE}/Saudi_Arabia_Jeddah_Corniche.png`,
  'Marina Bay': `${GITHUB_BASE}/Singapore_Marina_Bay_Street.png`,
  'Barcelona': `${GITHUB_BASE}/Spain_Barcelona_Catalunya.png`,
  'Catalunya': `${GITHUB_BASE}/Spain_Barcelona_Catalunya.png`,
  'Yas Marina': `${GITHUB_BASE}/UAE_Abu_Dhabi_Yas_Marina.png`,
  'Austin': `${GITHUB_BASE}/USA_Circuit_of_the_Americas.png`,
  'COTA': `${GITHUB_BASE}/USA_Circuit_of_the_Americas.png`,
};

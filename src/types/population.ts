// Application-specific population data types

export interface CountryPopulationData {
  countryCode: string;
  countryName: string;
  population: number;
  birthRate: number;        // births per 1000 people per year
  deathRate: number;        // deaths per 1000 people per year
  growthRate: number;       // percentage
  birthsPerSecond: number;  // calculated
  deathsPerSecond: number;  // calculated
  lastUpdated: string;
}

export interface TreemapNode {
  name: string;
  value: number;
  data?: CountryPopulationData;
  children?: TreemapNode[];
}

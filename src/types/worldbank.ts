// World Bank API response types

export interface WorldBankIndicator {
  indicator: {
    id: string;
    value: string
  };
  country: {
    id: string;
    value: string
  };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

export interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

export type WorldBankAPIResponse = [WorldBankResponse, WorldBankIndicator[]];

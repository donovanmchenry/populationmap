import { WORLD_BANK_BASE_URL, INDICATORS, TOP_20_COUNTRIES } from './constants';
import { WorldBankAPIResponse } from '@/types/worldbank';

/**
 * Fetch a single indicator from World Bank API for a country
 * @param countryCode - ISO3 country code
 * @param indicator - Indicator code
 * @returns The latest value for the indicator
 */
async function fetchIndicator(countryCode: string, indicator: string): Promise<number> {
  const url = `${WORLD_BANK_BASE_URL}/country/${countryCode}/indicator/${indicator}?format=json&per_page=1&mrv=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch ${indicator} for ${countryCode}: ${response.status}`);
      return 0;
    }

    const data: WorldBankAPIResponse = await response.json();

    // World Bank API returns [metadata, data]
    const indicatorData = data[1];
    if (!indicatorData || indicatorData.length === 0) {
      console.warn(`No data available for ${indicator} in ${countryCode}`);
      return 0;
    }

    return indicatorData[0]?.value ?? 0;
  } catch (error) {
    console.error(`Error fetching ${indicator} for ${countryCode}:`, error);
    return 0;
  }
}

/**
 * Fetch all population data for the top 20 countries
 * @returns Array of country data with all indicators
 */
export async function fetchPopulationData() {
  const countryCodes = TOP_20_COUNTRIES.map(c => c.code);

  const promises = countryCodes.map(async (code) => {
    const countryName = TOP_20_COUNTRIES.find(c => c.code === code)?.name || code;

    // Fetch all indicators in parallel for this country
    const [population, birthRate, deathRate, growthRate] = await Promise.all([
      fetchIndicator(code, INDICATORS.POPULATION),
      fetchIndicator(code, INDICATORS.BIRTH_RATE),
      fetchIndicator(code, INDICATORS.DEATH_RATE),
      fetchIndicator(code, INDICATORS.GROWTH_RATE),
    ]);

    return {
      countryCode: code,
      countryName,
      population,
      birthRate,
      deathRate,
      growthRate,
    };
  });

  return Promise.all(promises);
}

import { SECONDS_PER_YEAR } from './constants';

/**
 * Calculate births per second based on population and birth rate
 * @param population - Total population
 * @param birthRate - Births per 1000 people per year
 * @returns Births per second
 */
export function calculateBirthsPerSecond(population: number, birthRate: number): number {
  // birthRate is per 1000 people per year
  const birthsPerYear = (population * birthRate) / 1000;
  return birthsPerYear / SECONDS_PER_YEAR;
}

/**
 * Calculate deaths per second based on population and death rate
 * @param population - Total population
 * @param deathRate - Deaths per 1000 people per year
 * @returns Deaths per second
 */
export function calculateDeathsPerSecond(population: number, deathRate: number): number {
  // deathRate is per 1000 people per year
  const deathsPerYear = (population * deathRate) / 1000;
  return deathsPerYear / SECONDS_PER_YEAR;
}

/**
 * Calculate current population based on elapsed time and rates
 * @param basePopulation - Starting population
 * @param birthsPerSecond - Birth rate in people per second
 * @param deathsPerSecond - Death rate in people per second
 * @param secondsElapsed - Time elapsed since base population
 * @returns Current population
 */
export function calculateCurrentPopulation(
  basePopulation: number,
  birthsPerSecond: number,
  deathsPerSecond: number,
  secondsElapsed: number
): number {
  const netChange = (birthsPerSecond - deathsPerSecond) * secondsElapsed;
  return Math.floor(basePopulation + netChange);
}

/**
 * Format a population number with commas
 * @param population - Population number
 * @returns Formatted string
 */
export function formatPopulation(population: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(population));
}

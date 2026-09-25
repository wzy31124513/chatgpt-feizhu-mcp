export function toFlags(input: Record<string, unknown>, names: Record<string, string>): string[] {
  const flags: string[] = [];
  for (const [name, flag] of Object.entries(names)) {
    const value = input[name];
    if (value !== undefined && value !== null && value !== '') {
      flags.push(`--${flag}`, String(value));
    }
  }
  return flags;
}

export const routeFlags = {
  origin: 'origin', destination: 'destination', depDate: 'dep-date',
  depDateStart: 'dep-date-start', depDateEnd: 'dep-date-end',
  backDate: 'back-date', backDateStart: 'back-date-start', backDateEnd: 'back-date-end',
  journeyType: 'journey-type', seatClassName: 'seat-class-name', transportNo: 'transport-no',
  transferCity: 'transfer-city', depHourStart: 'dep-hour-start', depHourEnd: 'dep-hour-end',
  arrHourStart: 'arr-hour-start', arrHourEnd: 'arr-hour-end',
  totalDurationHour: 'total-duration-hour', maxPrice: 'max-price', sortType: 'sort-type',
} as const;

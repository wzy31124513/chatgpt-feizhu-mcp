import { z } from 'zod';

export const name = z.string().trim().min(1).max(160);
export const date = z.iso.date();
export const price = z.number().positive().finite();
export const hour = z.number().int().min(0).max(23);
export const routeShape = {
  origin: name.describe('Departure city, airport, or station'),
  destination: name.optional().describe('Arrival city, airport, or station'),
  depDate: date.optional(), depDateStart: date.optional(), depDateEnd: date.optional(),
  backDate: date.optional(), backDateStart: date.optional(), backDateEnd: date.optional(),
  journeyType: z.enum(['1', '2']).optional(),
  seatClassName: name.optional(), transportNo: name.optional(), transferCity: name.optional(),
  depHourStart: hour.optional(), depHourEnd: hour.optional(),
  arrHourStart: hour.optional(), arrHourEnd: hour.optional(),
  totalDurationHour: z.number().positive().finite().optional(),
  maxPrice: price.optional(), sortType: z.number().int().min(1).max(8).optional(),
};

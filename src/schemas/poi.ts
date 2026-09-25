import { z } from 'zod';
import { name } from './common.js';

export const poiSchema = z.object({
  cityName: name,
  keyword: name.optional(),
  poiLevel: z.number().int().min(1).max(5).optional(),
  category: name.optional(),
});
